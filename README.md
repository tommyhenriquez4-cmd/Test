# 📱 Content Farm & Android Smartphone Fleet Management System

Enterprise-grade automated control and orchestration platform for Android smartphone content farms. Connects cloud scheduling (FastAPI + Celery + Redis + PostgreSQL) to local phone banks (Laixi Daemon + Autox.js) with anti-ban humanized gesture emulation.

---

## 🏗️ Architecture Overview

```
                          ┌─────────────────────────────┐
                          │   Dark Mode Web Console     │
                          │   (React 18 + Tailwind)     │
                          └──────────────┬──────────────┘
                                         │ REST / WS
                                         ▼
                          ┌─────────────────────────────┐
                          │       Nginx Proxy           │
                          │  (500M Max Upload, SSL, WS) │
                          └──────────────┬──────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     FastAPI Async Backend       │             │   Celery Worker & Celery Beat   │
│  - WebSocket `/agent/ws`        │◄───────────►│  - Timezone-Aware CRON Scheduler│
│  - 500MB Video Streaming        │             │  - Daily Limit Reset Engine     │
│  - SQLAlchemy 2.0 / PostgreSQL  │             │  - Redis 7 Broker & Results     │
└────────────────┬────────────────┘             └─────────────────────────────────┘
                 │
                 │ Persistent WebSocket (with Auto-Reconnect & 30s Heartbeat)
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Local Python Farm Agent                               │
│  - Auto-Discovery of USB/WiFi connected Android phones via Laixi API            │
│  - Per-Device Mutex (`asyncio.Lock`) for strict sequential script execution     │
│  - Video downloader & ADB Media Push (`/sdcard/DCIM/Camera/` + `am broadcast`)  │
│  - Script Renderer & 24h temp cleanup                                           │
└────────────────┬────────────────────────────────────────────────────────────────┘
                 │ WebSocket (`ws://127.0.0.1:22221/`) & ADB
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Laixi Control Daemon                                   │
└────────────────┬────────────────────────────────────────────────────────────────┘
                 │ Accessibility Service & Touch Injection
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                Android Smartphone Fleet (Autox.js Runtime)                      │
│  - `_lib.js`: Bezier curve swipes, Gaussian jitter taps, organic typing delay   │
│  - Tasks: Warmup session, Video Auto-Posting, Likes, AI Comments, Follows       │
│  - Results written to `/sdcard/laixi/results/task_<ID>.json`                   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Deployment

### 1. Cloud Server (Docker Compose)

1. Clone repository to your cloud VM / server:
   ```bash
   git clone <repo-url> content-farm
   cd content-farm/server
   ```

2. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Set your AGENT_SECRET and DB credentials
   ```

3. Launch all services:
   ```bash
   docker-compose up -d --build
   ```

4. Verify services:
   - Web Console: `http://<your-server-ip>/`
   - API Docs: `http://<your-server-ip>/api/docs`
   - Nginx WebSocket Route: `ws://<your-server-ip>/agent/ws`

---

### 2. Local Python Agent Setup

The agent runs on the PC connected via USB/WiFi to your Android phone rack.

1. Navigate to `local_agent/`:
   ```bash
   cd local_agent
   python3 -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

2. Configure `.env`:
   ```ini
   AGENT_ID=farm_agent_node_01
   SERVER_WS_URL=ws://<your-server-ip>/agent/ws
   SERVER_HTTP_URL=http://<your-server-ip>
   AGENT_SECRET=cf_agent_sec_994821a8f
   LAIXI_WS_URL=ws://127.0.0.1:22221/
   DEVICE_IDS=auto
   ```

3. Start Laixi software on Windows/Mac, connect phones via USB Debugging.
4. Launch the agent:
   ```bash
   python agent.py
   ```

---

## 🛡️ Anti-Detection (Anti-Ban) Design Rules

The system is engineered specifically to prevent algorithmic bot detection:

1. **Sequential Device Mutex (`asyncio.Lock`)**:
   Physical phones cannot safely execute multiple touch scripts simultaneously without crashing accessibility services. The agent enforces strict FIFO queuing per device.

2. **Touch Coordinate Jitter (`tapJitter`)**:
   Never taps the exact same pixel twice; uses randomized normal distribution radius offsets.

3. **Bezier Thumb Swiping (`humanSwipe`)**:
   Simulates natural human curved swipe physics with acceleration/deceleration steps instead of straight linear vectors.

4. **Character-by-Character Typing with Micro-Pauses**:
   Comments and captions are typed with 70–220ms randomized keystroke cadence and occasional 500ms hesitation pauses.

5. **24-Hour Temp Cleaners**:
   Temporary rendered scripts on the host PC are automatically pruned every 24 hours.

---

## 📋 Supported Tasks & Automation Scripts

| Task Type | Description | Key Parameters |
|---|---|---|
| `warmup_session` | Organic feed scrolling, 20–45s watch time, 40% randomized likes, comment peeking | `platform`, `video_count`, `like_probability` |
| `upload_video` | Auto-posts video from gallery to TikTok/Reels/Shorts with caption, hashtags and sound | `video_url`, `caption`, `platform` |
| `like_post` | Likes current post via double-tap or heart selector | `method` (`double_tap` or `icon`) |
| `post_comment` | Opens comments and enters human/AI-generated text | `comment_text`, `is_reply` |
| `follow_user` | Follows creator from feed or profile | `username` |
| `scroll_feed` | Humanized swipe exploration | `scroll_count` |
| `watch_video` | Dedicated retention watch session with micro-interactions | `duration_sec` |
