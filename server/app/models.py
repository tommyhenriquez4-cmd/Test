import enum
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Float,
    DateTime,
    ForeignKey,
    JSON,
    Text,
    Enum
)
from sqlalchemy.orm import relationship
from app.database import Base


class DeviceStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"
    ERROR = "error"


class AccountPlatform(str, enum.Enum):
    TIKTOK = "tiktok"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"


class TaskStatus(str, enum.Enum):
    QUEUED = "queued"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"


class Device(Base):
    __tablename__ = "devices"

    id = Column(String(64), primary_key=True, index=True)
    serial = Column(String(128), unique=True, index=True, nullable=False)
    laixi_id = Column(String(64), index=True, nullable=False)
    name = Column(String(128), nullable=False)
    model = Column(String(128), default="Android Device")
    android_version = Column(String(32), default="12.0")
    status = Column(Enum(DeviceStatus), default=DeviceStatus.OFFLINE, index=True)
    battery = Column(Integer, default=100)
    temperature = Column(Float, default=32.0)
    ip_address = Column(String(64), default="127.0.0.1")
    screen_locked = Column(Boolean, default=False)
    last_seen = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    accounts = relationship("SocialAccount", back_populates="device")
    tasks = relationship("Task", back_populates="device")


class SocialAccount(Base):
    __tablename__ = "social_accounts"

    id = Column(String(64), primary_key=True, index=True)
    platform = Column(Enum(AccountPlatform), nullable=False, index=True)
    username = Column(String(128), nullable=False, index=True)
    handle = Column(String(128), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    status = Column(String(32), default="warming_up")
    proxy = Column(String(256), nullable=True)
    warmup_day = Column(Integer, default=1)
    total_videos_posted = Column(Integer, default=0)

    # Daily action limits tracking
    daily_likes_current = Column(Integer, default=0)
    daily_likes_max = Column(Integer, default=150)
    daily_comments_current = Column(Integer, default=0)
    daily_comments_max = Column(Integer, default=20)
    daily_follows_current = Column(Integer, default=0)
    daily_follows_max = Column(Integer, default=50)
    daily_posts_current = Column(Integer, default=0)
    daily_posts_max = Column(Integer, default=3)
    last_limit_reset = Column(DateTime, default=datetime.utcnow)

    # Device binding
    device_id = Column(String(64), ForeignKey("devices.id"), nullable=True)
    device = relationship("Device", back_populates="accounts")
    tasks = relationship("Task", back_populates="account")


class VideoMedia(Base):
    __tablename__ = "video_media"

    id = Column(String(64), primary_key=True, index=True)
    filename = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=False)
    filesize_mb = Column(Float, nullable=False)
    duration_sec = Column(Integer, default=30)
    url = Column(String(512), nullable=False)
    thumbnail_url = Column(String(512), nullable=True)
    caption = Column(Text, default="")
    tags = Column(JSON, default=list)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    used_count = Column(Integer, default=0)


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(64), primary_key=True, index=True)
    task_type = Column(String(64), nullable=False, index=True)
    device_id = Column(String(64), ForeignKey("devices.id"), nullable=False, index=True)
    account_id = Column(String(64), ForeignKey("social_accounts.id"), nullable=True, index=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.QUEUED, index=True)
    params = Column(JSON, default=dict)
    logs = Column(JSON, default=list)
    result_data = Column(JSON, default=dict)
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    device = relationship("Device", back_populates="tasks")
    account = relationship("SocialAccount", back_populates="tasks")


class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    cron_expr = Column(String(64), nullable=False)
    timezone = Column(String(64), default="Europe/Moscow")
    task_type = Column(String(64), nullable=False)
    target_device_ids = Column(JSON, default=list)
    target_account_ids = Column(JSON, default=list)
    params = Column(JSON, default=dict)
    enabled = Column(Boolean, default=True, index=True)
    last_run = Column(DateTime, nullable=True)
    next_run = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
