import os
import sys
import json
import asyncio
from pathlib import Path
from typing import Dict, Any, List
import httpx
import websockets
from loguru import logger

from config import settings
from laixi_client import LaixiClient
from script_renderer import ScriptRenderer

# Setup logging format
logger.remove()
logger.add(sys.stdout, colorize=True, format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{message}</cyan>")


class FarmLocalAgent:
    """
    Main Local Farm Agent Orchestrator.
    Bridges Cloud Server <---> Local Laixi <---> Android Phones.
    """
    def __init__(self):
        self.laixi = LaixiClient(ws_url=settings.LAIXI_WS_URL)
        self.renderer = ScriptRenderer(
            scripts_dir=settings.SCRIPTS_DIR,
            temp_dir=settings.GENERATED_SCRIPTS_DIR
        )
        self.ws: websockets.WebSocketClientProtocol = None
        self.is_running = True
        
        # STRICT REQUIREMENT: Mutex Lock per physical phone to prevent parallel overlapping scripts
        self.device_locks: Dict[str, asyncio.Lock] = {}
        
        # Discovered devices cache
        self.devices: List[Dict[str, Any]] = []

        # Create temporary folders
        Path(settings.DOWNLOAD_TEMP_DIR).mkdir(parents=True, exist_ok=True)
        Path(settings.GENERATED_SCRIPTS_DIR).mkdir(parents=True, exist_ok=True)

    def _get_device_lock(self, device_id: str) -> asyncio.Lock:
        """Ensure each device has its own sequential execution lock."""
        if device_id not in self.device_locks:
            self.device_locks[device_id] = asyncio.Lock()
        return self.device_locks[device_id]

    async def start(self):
        """Main startup sequence."""
        logger.info(f"Starting Farm Local Agent [{settings.AGENT_ID}]...")
        
        # 1. Connect to local Laixi daemon
        await self.laixi.connect()

        # 2. Device Auto-Discovery
        await self.discover_devices()

        # 3. Connect to Cloud Server WebSocket with auto-reconnect loop
        while self.is_running:
            try:
                await self.run_server_connection()
            except (websockets.ConnectionClosed, ConnectionRefusedError) as e:
                logger.warning(f"Server connection lost ({e}). Reconnecting in 5s...")
                await asyncio.sleep(5.0)
            except Exception as e:
                logger.error(f"Unexpected agent error: {e}")
                await asyncio.sleep(5.0)

    async def discover_devices(self):
        """
        Auto-Discovery: queries Laixi for connected Android phones
        and prepares execution locks.
        """
        logger.info("Scanning for connected Android devices via Laixi...")
        raw_devices = await self.laixi.get_connected_devices()
        
        # Filter based on config if not auto/all
        if settings.DEVICE_IDS.lower() in ["auto", "all"]:
            self.devices = raw_devices
        else:
            allowed = [d.strip() for d in settings.DEVICE_IDS.split(",")]
            self.devices = [d for d in raw_devices if d.get("laixi_id") in allowed or d.get("serial") in allowed]

        for dev in self.devices:
            dev_id = dev.get("laixi_id") or dev.get("id")
            self._get_device_lock(dev_id)

        logger.info(f"Auto-Discovery complete. Managing {len(self.devices)} physical phones.")

    async def run_server_connection(self):
        """Main WebSocket communication loop with Cloud Server."""
        ws_url = f"{settings.SERVER_WS_URL}?secret={settings.AGENT_SECRET}&agent_id={settings.AGENT_ID}"
        logger.info(f"Connecting to Cloud Server at {settings.SERVER_WS_URL}...")

        async with websockets.connect(ws_url, ping_interval=20, ping_timeout=15) as websocket:
            self.ws = websocket
            logger.info("Connected to Cloud Server successfully! Ready to accept tasks.")

            # Send Auto-Discovery payload immediately
            await self.ws.send(json.dumps({
                "type": "DEVICE_DISCOVERY",
                "agent_id": settings.AGENT_ID,
                "devices": self.devices
            }))

            # Start background 30s heartbeat loop
            heartbeat_task = asyncio.create_task(self._heartbeat_loop())

            try:
                while True:
                    msg_str = await self.ws.recv()
                    data = json.loads(msg_str)
                    action = data.get("action")

                    if action == "EXECUTE_TASK":
                        task_data = data.get("task", {})
                        # Launch task in background with device lock
                        asyncio.create_task(self.handle_task_execution(task_data))

            finally:
                heartbeat_task.cancel()

    async def _heartbeat_loop(self):
        """Send periodic 30-second ping to Cloud Server with device telemetry."""
        while True:
            try:
                await asyncio.sleep(settings.HEARTBEAT_INTERVAL_SEC)
                if self.ws and self.ws.open:
                    await self.ws.send(json.dumps({
                        "type": "HEARTBEAT",
                        "agent_id": settings.AGENT_ID,
                        "devices": self.devices,
                        "timestamp": asyncio.get_event_loop().time()
                    }))
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"Heartbeat send failed: {e}")

    async def handle_task_execution(self, task: Dict[str, Any]):
        """
        Executes an assigned task on target Android smartphone.
        Strictly enforces single-task execution per device via asyncio.Lock.
        """
        task_id = task.get("id")
        task_type = task.get("task_type")
        device_id = task.get("device_id")
        params = task.get("params", {})

        lock = self._get_device_lock(device_id)
        
        logger.info(f"Task {task_id} [{task_type}] queued for device {device_id}. Waiting for device lock...")

        async with lock:
            logger.info(f"Acquired lock for {device_id}. Starting execution of {task_type} (Task: {task_id})")
            
            try:
                # 1. Handle special video upload task: download video from server & push to device
                if task_type == "upload_video" and "video_url" in params:
                    video_url = params["video_url"]
                    if not video_url.startswith("http"):
                        video_url = f"{settings.SERVER_HTTP_URL.rstrip('/')}{video_url}"
                    
                    local_filename = f"video_{task_id}.mp4"
                    local_video_path = os.path.join(settings.DOWNLOAD_TEMP_DIR, local_filename)

                    logger.info(f"Downloading video from {video_url}...")
                    async with httpx.AsyncClient(timeout=120.0) as client:
                        resp = await client.get(video_url)
                        if resp.status_code == 200:
                            with open(local_video_path, "wb") as f:
                                f.write(resp.content)
                            logger.info(f"Video saved locally ({len(resp.content) // (1024*1024)} MB). Pushing via ADB...")
                            await self.laixi.push_media_file(device_id, local_video_path)
                            params["pushed_video_filename"] = local_filename
                        else:
                            raise RuntimeError(f"Failed to download video from server (HTTP {resp.status_code})")

                # 2. Render Autox.js script with parameters & anti-detection library
                script_code = self.renderer.render(task_type, task_id, params)

                # 3. Instruct Laixi to execute Autox.js script on device
                script_name = f"task_{task_id}.js"
                logger.info(f"Sending script '{script_name}' to Laixi device {device_id}...")
                await self.laixi.run_autox_script(device_id, script_code, script_name)

                # 4. Wait & poll for result JSON from /sdcard/laixi/results/task_<ID>.json
                result = await self.laixi.read_task_result_json(device_id, task_id)
                logger.info(f"Task {task_id} completed on {device_id} with status: {result.get('status')}")

                # 5. Notify Cloud Server of completion
                if self.ws and self.ws.open:
                    await self.ws.send(json.dumps({
                        "type": "TASK_RESULT",
                        "task_id": task_id,
                        "device_id": device_id,
                        "status": result.get("status", "done"),
                        "logs": result.get("logs", ["Completed successfully"]),
                        "result_data": result.get("data", {})
                    }))

            except Exception as e:
                logger.error(f"Task {task_id} failed on device {device_id}: {e}")
                if self.ws and self.ws.open:
                    await self.ws.send(json.dumps({
                        "type": "TASK_RESULT",
                        "task_id": task_id,
                        "device_id": device_id,
                        "status": "failed",
                        "error_message": str(e),
                        "logs": [f"Execution error: {str(e)}"]
                    }))


if __name__ == "__main__":
    agent = FarmLocalAgent()
    try:
        asyncio.run(agent.start())
    except KeyboardInterrupt:
        logger.info("Local Agent shut down cleanly.")
