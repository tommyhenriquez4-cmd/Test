import asyncio
from datetime import datetime
import pytz
from croniter import croniter
from celery import Celery
from celery.schedules import crontab
from loguru import logger
from sqlalchemy import select, update
from app.config import settings
from app.database import AsyncSessionLocal
from app.models import Schedule, Task, Device, TaskStatus, DeviceStatus

# Initialize Celery with Redis broker and result backend
celery_app = Celery(
    "content_farm_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.update(
    timezone=settings.TIMEZONE,
    enable_utc=False,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    beat_schedule_filename="/tmp/celerybeat-schedule",
    beat_schedule={
        "evaluate_schedules_every_minute": {
            "task": "app.worker.check_and_trigger_schedules",
            "schedule": 60.0,  # runs every 60 seconds
        },
        "reset_daily_limits_midnight": {
            "task": "app.worker.reset_daily_limits",
            "schedule": crontab(hour=0, minute=0),
        }
    }
)


async def _async_trigger_schedules():
    """Evaluate database schedules with timezone awareness and dispatch tasks."""
    logger.info("Evaluating active farm schedules...")
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Schedule).where(Schedule.enabled == True)
        )
        schedules = result.scalars().all()
        now_utc = datetime.now(pytz.UTC)

        for sched in schedules:
            try:
                # Timezone aware calculation
                try:
                    tz = pytz.timezone(sched.timezone or settings.TIMEZONE)
                except Exception:
                    tz = pytz.UTC

                now_local = datetime.now(tz)
                
                # Check if it's time to run
                if sched.next_run:
                    # Make next_run timezone aware if naive
                    next_run_aware = sched.next_run.replace(tzinfo=tz) if sched.next_run.tzinfo is None else sched.next_run
                    if now_local >= next_run_aware:
                        logger.info(f"Triggering schedule {sched.id} ({sched.name}) for task {sched.task_type}")
                        
                        # Generate tasks for target devices
                        for dev_id in (sched.target_device_ids or []):
                            task_id = f"task_{int(datetime.utcnow().timestamp())}_{dev_id[:6]}"
                            new_task = Task(
                                id=task_id,
                                task_type=sched.task_type,
                                device_id=dev_id,
                                status=TaskStatus.QUEUED,
                                params=sched.params or {},
                                logs=[f"Scheduled by {sched.name} at {now_local.isoformat()}"],
                                created_at=datetime.utcnow()
                            )
                            session.add(new_task)

                        # Update last_run and calculate next_run with croniter
                        sched.last_run = datetime.utcnow()
                        itr = croniter(sched.cron_expr, now_local)
                        next_dt = itr.get_next(datetime)
                        sched.next_run = next_dt.astimezone(pytz.UTC).replace(tzinfo=None)
                        
                else:
                    # Initialize next_run
                    itr = croniter(sched.cron_expr, now_local)
                    next_dt = itr.get_next(datetime)
                    sched.next_run = next_dt.astimezone(pytz.UTC).replace(tzinfo=None)

            except Exception as e:
                logger.error(f"Error evaluating schedule {sched.id}: {e}")

        await session.commit()


@celery_app.task(name="app.worker.check_and_trigger_schedules")
def check_and_trigger_schedules():
    """Celery beat periodic worker task."""
    loop = asyncio.get_event_loop()
    if loop.is_running():
        asyncio.ensure_future(_async_trigger_schedules())
    else:
        loop.run_until_complete(_async_trigger_schedules())


@celery_app.task(name="app.worker.reset_daily_limits")
def reset_daily_limits():
    """Reset daily counters for likes, comments, follows, posts at midnight."""
    logger.info("Resetting daily social account action limits...")
    # Handled via DB update
