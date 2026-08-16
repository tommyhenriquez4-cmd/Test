from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models import DeviceStatus, AccountPlatform, TaskStatus


# ------------------ Device Schemas ------------------
class DeviceRegisterPayload(BaseModel):
    laixi_id: str
    serial: str
    name: str
    model: Optional[str] = "Android Phone"
    android_version: Optional[str] = "12.0"
    battery: Optional[int] = 100
    temperature: Optional[float] = 30.0
    ip_address: Optional[str] = "127.0.0.1"


class DeviceResponse(BaseModel):
    id: str
    serial: str
    laixi_id: str
    name: str
    model: str
    android_version: str
    status: DeviceStatus
    battery: int
    temperature: float
    ip_address: str
    screen_locked: bool
    last_seen: datetime

    class Config:
        from_attributes = True


# ------------------ Social Account Schemas ------------------
class AccountCreate(BaseModel):
    platform: AccountPlatform
    username: str
    handle: str
    avatar_url: Optional[str] = None
    proxy: Optional[str] = None
    device_id: Optional[str] = None
    daily_likes_max: Optional[int] = 150
    daily_comments_max: Optional[int] = 20
    daily_follows_max: Optional[int] = 50
    daily_posts_max: Optional[int] = 3


class AccountResponse(BaseModel):
    id: str
    platform: AccountPlatform
    username: str
    handle: str
    avatar_url: Optional[str]
    status: str
    proxy: Optional[str]
    warmup_day: int
    total_videos_posted: int
    daily_likes_current: int
    daily_likes_max: int
    daily_comments_current: int
    daily_comments_max: int
    daily_follows_current: int
    daily_follows_max: int
    daily_posts_current: int
    daily_posts_max: int
    device_id: Optional[str]

    class Config:
        from_attributes = True


# ------------------ Task Schemas ------------------
class TaskCreate(BaseModel):
    task_type: str = Field(..., description="Action type like warmup_session, upload_video, etc.")
    device_id: str
    account_id: Optional[str] = None
    params: Dict[str, Any] = Field(default_factory=dict)


class TaskResponse(BaseModel):
    id: str
    task_type: str
    device_id: str
    account_id: Optional[str]
    status: TaskStatus
    params: Dict[str, Any]
    logs: List[str]
    result_data: Dict[str, Any]
    error_message: Optional[str]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ------------------ Video Schemas ------------------
class VideoResponse(BaseModel):
    id: str
    filename: str
    filesize_mb: float
    duration_sec: int
    url: str
    thumbnail_url: Optional[str]
    caption: str
    tags: List[str]
    uploaded_at: datetime
    used_count: int

    class Config:
        from_attributes = True


# ------------------ Schedule Schemas ------------------
class ScheduleCreate(BaseModel):
    name: str
    cron_expr: str
    timezone: str = "Europe/Moscow"
    task_type: str
    target_device_ids: List[str] = Field(default_factory=list)
    target_account_ids: List[str] = Field(default_factory=list)
    params: Dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True


class ScheduleResponse(BaseModel):
    id: str
    name: str
    cron_expr: str
    timezone: str
    task_type: str
    target_device_ids: List[str]
    target_account_ids: List[str]
    params: Dict[str, Any]
    enabled: bool
    last_run: Optional[datetime]
    next_run: datetime

    class Config:
        from_attributes = True


# ------------------ Agent WebSocket Messages ------------------
class AgentHeartbeat(BaseModel):
    agent_id: str
    connected_devices: List[str]
    timestamp: float


class TaskResultPayload(BaseModel):
    task_id: str
    device_id: str
    status: str
    logs: List[str]
    error_message: Optional[str] = None
    result_data: Optional[Dict[str, Any]] = None
