from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import pytz


class Settings(BaseSettings):
    """
    Application Settings for Cloud Farm Management Server.
    Loads values from environment variables or .env file.
    """
    APP_NAME: str = "Content Farm Orchestrator"
    DEBUG: bool = False
    
    # Database and Redis
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://farm_admin:SuperSecretPass2026!@postgres:5432/content_farm_db",
        description="Async PostgreSQL connection URI"
    )
    REDIS_URL: str = Field(
        default="redis://redis:6379/0",
        description="Redis Broker URI"
    )
    CELERY_BROKER_URL: str = Field(
        default="redis://redis:6379/0",
        description="Celery Broker URI"
    )
    CELERY_RESULT_BACKEND: str = Field(
        default="redis://redis:6379/1",
        description="Celery Results Backend"
    )

    # Security & Agent Auth
    # Safe alphanumeric secret string without raw URI breaking tokens
    AGENT_SECRET: str = Field(
        default="cf_agent_sec_994821a8f",
        description="Shared secret key for Local Agent WebSocket authentication"
    )

    # Timezone configuration
    TIMEZONE: str = Field(
        default="Europe/Moscow",
        description="Default timezone for scheduling and CRON calculation"
    )
    
    # Media storage
    MEDIA_DIR: str = Field(
        default="./media_storage",
        description="Local directory for uploaded mp4/mov video files"
    )
    MAX_UPLOAD_SIZE_MB: int = 500

    @property
    def tz_info(self):
        try:
            return pytz.timezone(self.TIMEZONE)
        except Exception:
            return pytz.UTC

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
