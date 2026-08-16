import os
import shutil
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set
import aiofiles
from fastapi import (
    FastAPI,
    WebSocket,
    WebSocketDisconnect,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends,
    Query,
    status
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db, engine, Base
from app.models import (
    Device,
    SocialAccount,
    Task,
    Schedule,
    VideoMedia,
    DeviceStatus,
    TaskStatus
)
from app.schemas import (
    DeviceRegisterPayload,
    DeviceResponse,
    AccountCreate,
    AccountResponse,
    TaskCreate,
    TaskResponse,
    ScheduleCreate,
    ScheduleResponse,
    VideoResponse
)

# Initialize FastAPI App
app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise API for Android Farm Management with Laixi & Autox.js",
    version="2.0.0"
)

# Enable CORS for Frontend UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure Media Storage Directory exists
os.makedirs(settings.MEDIA_DIR, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.MEDIA_DIR), name="media")


# ------------------ Agent WebSocket Connection Manager ------------------
class AgentConnectionManager:
    """Manages active WebSocket connections from Local Python Farm Agents."""
    def __init__(self):
        self.active_agents: Dict[str, WebSocket] = {}
        self.device_to_agent: Dict[str, str] = {}

    async def connect(self, agent_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_agents[agent_id] = websocket
        logger.info(f"Agent '{agent_id}' connected successfully.")

    def disconnect(self, agent_id: str):
        if agent_id in self.active_agents:
            del self.active_agents[agent_id]
            logger.info(f"Agent '{agent_id}' disconnected.")

    def register_device_routing(self, agent_id: str, device_ids: List[str]):
        for d_id in device_ids:
            self.device_to_agent[d_id] = agent_id

    async def send_to_agent(self, agent_id: str, message: dict) -> bool:
        ws = self.active_agents.get(agent_id)
        if ws:
            await ws.send_json(message)
            return True
        return False

    async def dispatch_task(self, device_id: str, task_data: dict) -> bool:
        # Find which agent controls this device
        agent_id = self.device_to_agent.get(device_id)
        if not agent_id and self.active_agents:
            # Fallback to any connected agent
            agent_id = next(iter(self.active_agents.keys()))

        if agent_id:
            logger.info(f"Dispatching task {task_data.get('id')} to agent {agent_id} for device {device_id}")
            return await self.send_to_agent(agent_id, {
                "action": "EXECUTE_TASK",
                "task": task_data
            })
        logger.warning(f"No active agent found for device {device_id}")
        return False


manager = AgentConnectionManager()


@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Database Tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Content Farm Server is ready.")


# ------------------ Agent WebSocket Endpoint ------------------
@app.websocket("/agent/ws")
async def agent_websocket_endpoint(
    websocket: WebSocket,
    secret: Optional[str] = Query(None),
    agent_id: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for Local Python Agents.
    Requires shared AGENT_SECRET for handshake verification.
    """
    if secret != settings.AGENT_SECRET:
        logger.warning("Rejected unauthorized agent connection attempt.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    agent_key = agent_id or f"agent_{uuid.uuid4().hex[:8]}"
    await manager.connect(agent_key, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "HEARTBEAT":
                # Process periodic agent ping
                devices = data.get("devices", [])
                manager.register_device_routing(agent_key, [d.get("id", d.get("laixi_id")) for d in devices])
                await websocket.send_json({"type": "HEARTBEAT_ACK", "timestamp": datetime.utcnow().isoformat()})

            elif msg_type == "DEVICE_DISCOVERY":
                # Auto-Discovery payload from agent
                discovered_devices = data.get("devices", [])
                logger.info(f"Agent discovered {len(discovered_devices)} devices: {[d.get('laixi_id') for d in discovered_devices]}")
                # Update devices in DB asynchronously
                # (In production, persist device state to database)
                manager.register_device_routing(agent_key, [d.get("id", d.get("laixi_id")) for d in discovered_devices])

            elif msg_type == "TASK_RESULT":
                # Agent completed a task and sent back result
                task_id = data.get("task_id")
                task_status = data.get("status")
                logs = data.get("logs", [])
                error_msg = data.get("error_message")
                result_data = data.get("result_data", {})

                logger.info(f"Received task result for {task_id}: status={task_status}")
                # Save task result to DB
                async with AsyncSessionLocal() as session:
                    stmt = (
                        update(Task)
                        .where(Task.id == task_id)
                        .values(
                            status=TaskStatus(task_status) if task_status in [s.value for s in TaskStatus] else TaskStatus.DONE,
                            logs=logs,
                            error_message=error_msg,
                            result_data=result_data,
                            completed_at=datetime.utcnow()
                        )
                    )
                    await session.execute(stmt)
                    await session.commit()

            elif msg_type == "LOG":
                logger.debug(f"[Agent Log] {data.get('message')}")

    except WebSocketDisconnect:
        manager.disconnect(agent_key)
    except Exception as e:
        logger.error(f"WebSocket error for agent {agent_key}: {e}")
        manager.disconnect(agent_key)


# ------------------ REST APIs ------------------

# 1. Devices API
@app.get("/api/devices", response_model=List[DeviceResponse])
async def list_devices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device))
    return result.scalars().all()


@app.post("/api/devices/register", response_model=DeviceResponse)
async def register_device(payload: DeviceRegisterPayload, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Device).where(Device.serial == payload.serial))
    device = existing.scalar_one_or_none()
    
    if device:
        device.status = DeviceStatus.ONLINE
        device.battery = payload.battery or device.battery
        device.temperature = payload.temperature or device.temperature
        device.last_seen = datetime.utcnow()
    else:
        device = Device(
            id=f"dev_{uuid.uuid4().hex[:8]}",
            serial=payload.serial,
            laixi_id=payload.laixi_id,
            name=payload.name,
            model=payload.model or "Android Device",
            android_version=payload.android_version or "12.0",
            status=DeviceStatus.ONLINE,
            battery=payload.battery or 100,
            temperature=payload.temperature or 30.0,
            ip_address=payload.ip_address or "127.0.0.1",
            last_seen=datetime.utcnow()
        )
        db.add(device)
    
    await db.commit()
    await db.refresh(device)
    return device


# 2. Accounts API
@app.get("/api/accounts", response_model=List[AccountResponse])
async def list_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SocialAccount))
    return result.scalars().all()


@app.post("/api/accounts", response_model=AccountResponse)
async def create_account(payload: AccountCreate, db: AsyncSession = Depends(get_db)):
    account = SocialAccount(
        id=f"acc_{uuid.uuid4().hex[:8]}",
        platform=payload.platform,
        username=payload.username,
        handle=payload.handle,
        avatar_url=payload.avatar_url,
        proxy=payload.proxy,
        device_id=payload.device_id,
        daily_likes_max=payload.daily_likes_max or 150,
        daily_comments_max=payload.daily_comments_max or 20,
        daily_follows_max=payload.daily_follows_max or 50,
        daily_posts_max=payload.daily_posts_max or 3
    )
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


# 3. Video Upload (500MB Streaming Support)
@app.post("/api/videos/upload", response_model=VideoResponse)
async def upload_video(
    file: UploadFile = File(...),
    caption: str = Form(""),
    tags: str = Form(""),
    db: AsyncSession = Depends(get_db)
):
    """
    Handles streaming upload of video files up to 500MB.
    Saves file to media storage and indexes in database.
    """
    if not file.filename.lower().endswith((".mp4", ".mov", ".mkv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .mp4, .mov, and .mkv video formats are supported."
        )

    file_id = f"vid_{uuid.uuid4().hex[:10]}"
    safe_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.MEDIA_DIR, safe_filename)

    total_bytes = 0
    async with aiofiles.open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            total_bytes += len(chunk)
            if total_bytes > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                # Cleanup and reject
                if os.path.exists(file_path):
                    os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Video size exceeds maximum limit of {settings.MAX_UPLOAD_SIZE_MB}MB"
                )
            await buffer.write(chunk)

    filesize_mb = round(total_bytes / (1024 * 1024), 2)
    tags_list = [t.strip() for t in tags.split(",") if t.strip()]

    video_record = VideoMedia(
        id=file_id,
        filename=file.filename,
        file_path=file_path,
        filesize_mb=filesize_mb,
        duration_sec=30,
        url=f"/media/{safe_filename}",
        thumbnail_url=f"/media/{safe_filename}",
        caption=caption,
        tags=tags_list,
        uploaded_at=datetime.utcnow()
    )
    db.add(video_record)
    await db.commit()
    await db.refresh(video_record)

    logger.info(f"Uploaded video '{file.filename}' ({filesize_mb} MB) successfully.")
    return video_record


@app.get("/api/videos", response_model=List[VideoResponse])
async def list_videos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VideoMedia).order_by(VideoMedia.uploaded_at.desc()))
    return result.scalars().all()


# 4. Tasks API & Immediate Execution
@app.get("/api/tasks", response_model=List[TaskResponse])
async def list_tasks(limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task).order_by(Task.created_at.desc()).limit(limit))
    return result.scalars().all()


@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(payload: TaskCreate, db: AsyncSession = Depends(get_db)):
    task_id = f"task_{int(datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:4]}"
    task = Task(
        id=task_id,
        task_type=payload.task_type,
        device_id=payload.device_id,
        account_id=payload.account_id,
        status=TaskStatus.QUEUED,
        params=payload.params,
        logs=[f"Task queued at {datetime.utcnow().isoformat()}"],
        created_at=datetime.utcnow()
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Immediately try to dispatch to connected local agent
    dispatched = await manager.dispatch_task(payload.device_id, {
        "id": task.id,
        "task_type": task.task_type,
        "device_id": task.device_id,
        "params": task.params
    })

    if dispatched:
        task.status = TaskStatus.RUNNING
        task.started_at = datetime.utcnow()
        await db.commit()
        await db.refresh(task)

    return task


# 5. Schedules API
@app.get("/api/schedules", response_model=List[ScheduleResponse])
async def list_schedules(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Schedule).order_by(Schedule.created_at.desc()))
    return result.scalars().all()


@app.post("/api/schedules", response_model=ScheduleResponse)
async def create_schedule(payload: ScheduleCreate, db: AsyncSession = Depends(get_db)):
    import pytz
    from croniter import croniter

    tz_str = payload.timezone or settings.TIMEZONE
    try:
        tz = pytz.timezone(tz_str)
    except Exception:
        tz = pytz.UTC

    now_local = datetime.now(tz)
    itr = croniter(payload.cron_expr, now_local)
    next_dt = itr.get_next(datetime)

    sched = Schedule(
        id=f"sch_{uuid.uuid4().hex[:8]}",
        name=payload.name,
        cron_expr=payload.cron_expr,
        timezone=tz_str,
        task_type=payload.task_type,
        target_device_ids=payload.target_device_ids,
        target_account_ids=payload.target_account_ids,
        params=payload.params,
        enabled=payload.enabled,
        next_run=next_dt.astimezone(pytz.UTC).replace(tzinfo=None)
    )
    db.add(sched)
    await db.commit()
    await db.refresh(sched)
    return sched


# Healthcheck
@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "connected_agents": len(manager.active_agents),
        "timezone": settings.TIMEZONE
    }
