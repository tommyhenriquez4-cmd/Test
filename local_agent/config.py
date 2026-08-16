import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class AgentSettings(BaseSettings):
    """
    Configuration for Local Farm Agent.
    Runs on the local computer/mini-PC connected to the Android phones and Laixi.
    """
    AGENT_ID: str = Field(
        default="farm_agent_node_01",
        description="Unique identifier for this local farm runner"
    )
    
    # Server WebSocket & REST Endpoint
    SERVER_WS_URL: str = Field(
        default="ws://127.0.0.1:8000/agent/ws",
        description="Cloud Server WebSocket endpoint"
    )
    SERVER_HTTP_URL: str = Field(
        default="http://127.0.0.1:8000",
        description="Cloud Server HTTP base URL for media downloading"
    )
    
    # Safe Secret Token (no raw angle brackets or URI-breaking tokens)
    AGENT_SECRET: str = Field(
        default="cf_agent_sec_994821a8f",
        description="Shared secret matching server settings"
    )
    
    # Laixi WebSocket Port (Local phone controller software)
    LAIXI_WS_URL: str = Field(
        default="ws://127.0.0.1:22221/",
        description="Laixi software local WebSocket controller"
    )
    
    # Device discovery configuration ('auto', 'all', or comma-separated IDs)
    DEVICE_IDS: str = Field(
        default="auto",
        description="'auto' / 'all' to query Laixi automatically, or specific device IDs: 'dev1,dev2'"
    )
    
    # Path configuration
    SCRIPTS_DIR: str = Field(
        default="./scripts",
        description="Directory containing Autox.js task templates and _lib.js"
    )
    GENERATED_SCRIPTS_DIR: str = Field(
        default="./temp_scripts",
        description="Directory for temporary rendered .js scripts"
    )
    DOWNLOAD_TEMP_DIR: str = Field(
        default="./temp_downloads",
        description="Directory for cached downloaded videos prior to adb push"
    )

    # Timeouts & intervals
    HEARTBEAT_INTERVAL_SEC: int = 30
    TASK_TIMEOUT_SEC: int = 600
    SCRIPT_CLEANUP_HOURS: int = 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = AgentSettings()
