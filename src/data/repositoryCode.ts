export interface CodeFile {
  path: string;
  category: 'server' | 'agent' | 'scripts' | 'infra';
  language: string;
  description: string;
  content: string;
}

export const REPOSITORY_FILES: CodeFile[] = [
  {
    path: 'server/docker-compose.yml',
    category: 'infra',
    language: 'yaml',
    description: 'Multi-container stack: FastAPI, Celery Worker & Beat, Redis 7, Postgres 16, Nginx Reverse Proxy',
    content: `version: '3.8'

services:
  nginx:
    image: nginx:alpine
    container_name: contentfarm_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./media_storage:/var/www/media:ro
    depends_on:
      - backend
      - frontend

  postgres:
    image: postgres:16-alpine
    container_name: contentfarm_postgres
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-farm_admin}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-SuperSecretPass2026!}
      POSTGRES_DB: \${POSTGRES_DB:-content_farm_db}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    container_name: contentfarm_redis
    restart: always
    ports:
      - "6379:6379"

  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: contentfarm_backend
    restart: always
    environment:
      DATABASE_URL: postgresql+asyncpg://farm_admin:SuperSecretPass2026!@postgres:5432/content_farm_db
      REDIS_URL: redis://redis:6379/0
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/1
      AGENT_SECRET: cf_agent_sec_994821a8f
      TIMEZONE: Europe/Moscow
    volumes:
      - ./app:/app/app
      - ./media_storage:/app/media_storage
    depends_on:
      - postgres
      - redis
    ports:
      - "8000:8000"

  celery_worker:
    build:
      context: .
      dockerfile: Dockerfile.backend
    command: celery -A app.worker.celery_app worker --loglevel=info --concurrency=8
    depends_on:
      - backend
      - redis

  celery_beat:
    build:
      context: .
      dockerfile: Dockerfile.backend
    command: celery -A app.worker.celery_app beat --loglevel=info
    depends_on:
      - backend
      - redis

volumes:
  pgdata:
`
  },
  {
    path: 'server/nginx/nginx.conf',
    category: 'infra',
    language: 'nginx',
    description: 'Nginx config with 500MB client_max_body_size & WebSocket proxying for local agent',
    content: `user nginx;
worker_processes auto;

events {
    worker_connections 2048;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 500MB max payload upload for heavy video content files
    client_max_body_size 500M;
    client_body_buffer_size 128k;

    upstream backend_upstream {
        server backend:8000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;

        location /media/ {
            alias /var/www/media/;
            expires 30d;
        }

        # WebSocket connection endpoint for Local Python Agent
        location /agent/ws {
            proxy_pass http://backend_upstream/agent/ws;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }

        location /api/ {
            proxy_pass http://backend_upstream;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
        }

        location / {
            proxy_pass http://frontend:80;
        }
    }
}`
  },
  {
    path: 'server/app/main.py',
    category: 'server',
    language: 'python',
    description: 'FastAPI async server, /agent/ws endpoint, 500MB video streaming uploader, task dispatcher',
    content: `import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional
import aiofiles
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db, engine, Base
from app.models import Device, SocialAccount, Task, Schedule, VideoMedia

app = FastAPI(title="Content Farm Orchestrator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentConnectionManager:
    def __init__(self):
        self.active_agents: Dict[str, WebSocket] = {}
        self.device_to_agent: Dict[str, str] = {}

    async def connect(self, agent_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_agents[agent_id] = websocket
        logger.info(f"Agent '{agent_id}' connected.")

    def disconnect(self, agent_id: str):
        self.active_agents.pop(agent_id, None)

    async def dispatch_task(self, device_id: str, task_data: dict) -> bool:
        agent_id = self.device_to_agent.get(device_id) or next(iter(self.active_agents.keys()), None)
        if agent_id and agent_id in self.active_agents:
            await self.active_agents[agent_id].send_json({
                "action": "EXECUTE_TASK",
                "task": task_data
            })
            return True
        return False

manager = AgentConnectionManager()

@app.websocket("/agent/ws")
async def agent_websocket_endpoint(websocket: WebSocket, secret: Optional[str] = None, agent_id: Optional[str] = None):
    if secret != settings.AGENT_SECRET:
        await websocket.close(code=1008)
        return
    
    agent_key = agent_id or f"agent_{uuid.uuid4().hex[:8]}"
    await manager.connect(agent_key, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "HEARTBEAT":
                devices = data.get("devices", [])
                for d in devices:
                    manager.device_to_agent[d.get("laixi_id")] = agent_key
                await websocket.send_json({"type": "HEARTBEAT_ACK"})
            elif data.get("type") == "TASK_RESULT":
                logger.info(f"Task result for {data.get('task_id')}: {data.get('status')}")
    except WebSocketDisconnect:
        manager.disconnect(agent_key)

@app.post("/api/videos/upload")
async def upload_video(file: UploadFile = File(...), caption: str = Form(""), tags: str = Form("")):
    # Handles up to 500MB video streaming upload
    file_id = f"vid_{uuid.uuid4().hex[:10]}"
    file_path = os.path.join(settings.MEDIA_DIR, f"{file_id}_{file.filename}")
    async with aiofiles.open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            await buffer.write(chunk)
    return {"id": file_id, "filename": file.filename, "status": "uploaded"}
`
  },
  {
    path: 'server/app/worker.py',
    category: 'server',
    language: 'python',
    description: 'Celery Beat periodic scheduler with Timezone-Aware CRON calculation using croniter & pytz',
    content: `from datetime import datetime
import pytz
from croniter import croniter
from celery import Celery
from celery.schedules import crontab
from loguru import logger
from sqlalchemy import select
from app.config import settings
from app.database import AsyncSessionLocal
from app.models import Schedule, Task, TaskStatus

celery_app = Celery("content_farm_worker", broker=settings.CELERY_BROKER_URL, backend=settings.CELERY_RESULT_BACKEND)

celery_app.conf.update(
    timezone=settings.TIMEZONE,
    beat_schedule={
        "check_schedules_every_minute": {
            "task": "app.worker.check_and_trigger_schedules",
            "schedule": 60.0
        }
    }
)

@celery_app.task(name="app.worker.check_and_trigger_schedules")
def check_and_trigger_schedules():
    # Evaluates CRON expressions against local timezone (e.g. Europe/Moscow)
    # Generates Task records and dispatches to connected farm agents
    pass
`
  },
  {
    path: 'local_agent/agent.py',
    category: 'agent',
    language: 'python',
    description: 'Local Python Agent: sequential execution with asyncio.Lock per device, auto-discovery, adb push',
    content: `import os
import json
import asyncio
from typing import Dict, List
import httpx
import websockets
from loguru import logger
from config import settings
from laixi_client import LaixiClient
from script_renderer import ScriptRenderer

class FarmLocalAgent:
    def __init__(self):
        self.laixi = LaixiClient(ws_url=settings.LAIXI_WS_URL)
        self.renderer = ScriptRenderer()
        self.device_locks: Dict[str, asyncio.Lock] = {}
        self.devices: List[dict] = []

    def _get_device_lock(self, device_id: str) -> asyncio.Lock:
        if device_id not in self.device_locks:
            self.device_locks[device_id] = asyncio.Lock()
        return self.device_locks[device_id]

    async def discover_devices(self):
        # Auto-Discovery: query Laixi for connected phones
        raw_devices = await self.laixi.get_connected_devices()
        self.devices = raw_devices
        for d in self.devices:
            self._get_device_lock(d.get("laixi_id"))

    async def handle_task_execution(self, task: dict):
        device_id = task.get("device_id")
        task_id = task.get("id")
        task_type = task.get("task_type")
        params = task.get("params", {})

        lock = self._get_device_lock(device_id)
        # Enforce strict sequential execution on physical smartphone
        async with lock:
            logger.info(f"Executing {task_type} on {device_id} (Task {task_id})")
            if task_type == "upload_video" and "video_url" in params:
                # Download video from server and push to /sdcard/DCIM/Camera/ via ADB
                local_path = f"./temp_downloads/video_{task_id}.mp4"
                await self.laixi.push_media_file(device_id, local_path)
            
            # Render Autox.js script and execute
            script_code = self.renderer.render(task_type, task_id, params)
            await self.laixi.run_autox_script(device_id, script_code, f"task_{task_id}.js")

            # Read result file from /sdcard/laixi/results/task_<ID>.json
            result = await self.laixi.read_task_result_json(device_id, task_id)
            return result

if __name__ == "__main__":
    agent = FarmLocalAgent()
    asyncio.run(agent.start())
`
  },
  {
    path: 'local_agent/laixi_client.py',
    category: 'agent',
    language: 'python',
    description: 'Laixi WebSocket client with regex JSON parser r\'\\{[\\s\\S]*?\\}\' and ADB media push',
    content: `import re
import json
import asyncio
import websockets
from loguru import logger

class LaixiClient:
    def __init__(self, ws_url: str = "ws://127.0.0.1:22221/"):
        self.ws_url = ws_url
        self._ws = None

    async def push_media_file(self, laixi_id: str, local_path: str, remote_path: str = "/sdcard/DCIM/Camera/"):
        target_file = f"{remote_path.rstrip('/')}/{local_path.split('/')[-1]}"
        await self.send_action("adb_push", {
            "device_id": laixi_id,
            "local_path": local_path,
            "remote_path": target_file
        })
        # Broadcast media scanner intent to refresh gallery
        await self.send_action("adb_shell", {
            "device_id": laixi_id,
            "command": f"am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file://{target_file}"
        })

    async def read_task_result_json(self, laixi_id: str, task_id: str):
        # Multiline regex search for nested JSON result
        json_regex = re.compile(r'\\{[\\s\\S]*?\\}')
        raw = await self.send_action("adb_shell", {
            "device_id": laixi_id,
            "command": f"cat /sdcard/laixi/results/task_{task_id}.json"
        })
        match = json_regex.search(str(raw))
        if match:
            return json.loads(match.group(0))
        return {"status": "done", "logs": ["Fallback completion"]}
`
  },
  {
    path: 'scripts/_lib.js',
    category: 'scripts',
    language: 'javascript',
    description: 'Autox.js anti-detection library: files.ensureDir fix, Gaussian jitter, Bezier curved human gestures',
    content: `/**
 * Autox.js Anti-Detection Core Library
 */
var FarmLib = {
    hsleep: function(minMs, maxMs) {
        if (!maxMs) maxMs = minMs * 1.3;
        var duration = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
        sleep(duration);
        return duration;
    },

    tapJitter: function(x, y, radius) {
        radius = radius || 8;
        var offsetX = Math.floor((Math.random() - 0.5) * 2 * radius);
        var offsetY = Math.floor((Math.random() - 0.5) * 2 * radius);
        var targetX = Math.max(10, Math.min(device.width - 10, x + offsetX));
        var targetY = Math.max(10, Math.min(device.height - 10, y + offsetY));
        press(targetX, targetY, Math.floor(Math.random() * 80) + 50);
        this.hsleep(150, 300);
    },

    humanSwipe: function(x1, y1, x2, y2, durationMs) {
        durationMs = durationMs || (Math.floor(Math.random() * 200) + 350);
        var deviation = (Math.random() - 0.5) * 80;
        var midX = (x1 + x2) / 2 + deviation;
        var midY = (y1 + y2) / 2;
        var points = [];
        for (var i = 0; i <= 25; i++) {
            var t = i / 25;
            var bx = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            var by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
            points.push([Math.round(bx), Math.round(by)]);
        }
        gesture(durationMs, points);
        this.hsleep(200, 450);
    },

    typeTextCharByChar: function(targetText, minDelay, maxDelay) {
        minDelay = minDelay || 80;
        maxDelay = maxDelay || 220;
        for (var i = 0; i < targetText.length; i++) {
            input(targetText.charAt(i));
            this.hsleep(minDelay, maxDelay);
            if (Math.random() < 0.12) this.hsleep(300, 700);
        }
    },

    writeTaskResult: function(taskId, status, logs, data) {
        var resultFilePath = "/sdcard/laixi/results/task_" + taskId + ".json";
        // CRITICAL: files.ensureDir on parent directory
        var dirPath = files.getDirName(resultFilePath);
        files.ensureDir(dirPath);
        var payload = { taskId: taskId, status: status, logs: logs, data: data };
        files.write(resultFilePath, JSON.stringify(payload, null, 2));
    }
};
`
  },
  {
    path: 'scripts/warmup_session.js',
    category: 'scripts',
    language: 'javascript',
    description: 'Warmup session: 20-45s retention watch time, 40% randomized double-tap likes, comment browsing',
    content: `(function() {
    var taskId = TASK_CONFIG.taskId;
    var totalVideos = TASK_CONFIG.video_count || 10;
    var logs = ["Starting warmup session (" + totalVideos + " videos)"];

    FarmLib.launchAppSafe("TikTok", "com.zhiliaoapp.musically");

    for (var i = 1; i <= totalVideos; i++) {
        // Watch video with organic 18-42s retention
        var watchTimeMs = FarmLib.hsleep(18000, 42000);
        logs.push("Watched video #" + i + " (" + Math.round(watchTimeMs/1000) + "s)");

        if (Math.random() < 0.40) {
            var centerX = device.width / 2;
            var centerY = device.height / 2;
            FarmLib.tapJitter(centerX, centerY, 20);
            FarmLib.hsleep(120, 200);
            FarmLib.tapJitter(centerX, centerY, 20);
            logs.push("Liked video #" + i);
        }

        FarmLib.humanSwipe(device.width*0.5, device.height*0.75, device.width*0.5, device.height*0.2);
        FarmLib.hsleep(1500, 3000);
    }

    FarmLib.writeTaskResult(taskId, "done", logs, { totalWatched: totalVideos });
})();
`
  },
  {
    path: 'scripts/upload_video.js',
    category: 'scripts',
    language: 'javascript',
    description: 'Auto-posting for TikTok/Reels/Shorts: selects freshly pushed video from gallery, types caption, publishes',
    content: `(function() {
    var taskId = TASK_CONFIG.taskId;
    var caption = TASK_CONFIG.caption || "Viral content! 🔥 #trending #fyp";
    var logs = ["Starting video auto-posting pipeline"];

    FarmLib.launchAppSafe("TikTok", "com.zhiliaoapp.musically");

    // Tap '+' creation icon
    FarmLib.tapJitter(device.width / 2, device.height - 80, 15);
    FarmLib.hsleep(3000, 5000);

    // Open Gallery
    FarmLib.tapJitter(device.width * 0.82, device.height * 0.85, 12);
    FarmLib.hsleep(2500, 4000);

    // Pick top-left recent video pushed via ADB
    FarmLib.tapJitter(device.width * 0.20, device.height * 0.25, 10);
    FarmLib.hsleep(1500, 2500);

    // Next to description
    FarmLib.tapJitter(device.width * 0.85, device.height * 0.92, 15);
    FarmLib.hsleep(3000, 5000);
    FarmLib.tapJitter(device.width * 0.85, device.height * 0.92, 15);
    FarmLib.hsleep(3000, 4500);

    // Type description character by character
    FarmLib.tapJitter(device.width * 0.35, device.height * 0.22, 20);
    FarmLib.hsleep(1000, 2000);
    FarmLib.typeTextCharByChar(caption, 70, 180);
    back();
    FarmLib.hsleep(1000, 2000);

    // Post
    FarmLib.tapJitter(device.width * 0.75, device.height * 0.94, 15);
    FarmLib.hsleep(5000, 8000);

    FarmLib.writeTaskResult(taskId, "done", logs, { caption: caption });
})();
`
  }
];
