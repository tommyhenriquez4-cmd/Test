import os
import time
import json
from pathlib import Path
from typing import Dict, Any
from loguru import logger
from app.config import settings if False else None  # type check stub


class ScriptRenderer:
    """
    Renders Autox.js task templates by combining `_lib.js` anti-detection engine
    with parameterized task logic. Also manages 24-hour cleanup of temporary files.
    """
    def __init__(self, scripts_dir: str = "./scripts", temp_dir: str = "./temp_scripts"):
        self.scripts_dir = Path(scripts_dir)
        self.temp_dir = Path(temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        self.lib_file = self.scripts_dir / "_lib.js"

    def cleanup_old_scripts(self, max_age_hours: int = 24):
        """
        Removes temporary generated .js files older than specified hours (default 24h).
        """
        now = time.time()
        max_age_seconds = max_age_hours * 3600
        cleaned_count = 0

        for file_path in self.temp_dir.glob("*.js"):
            try:
                if file_path.is_file():
                    file_age = now - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        file_path.unlink()
                        cleaned_count += 1
            except Exception as e:
                logger.warning(f"Error cleaning file {file_path}: {e}")

        if cleaned_count > 0:
            logger.info(f"Cleaned up {cleaned_count} temporary .js scripts older than {max_age_hours}h.")

    def render(self, task_type: str, task_id: str, params: Dict[str, Any]) -> str:
        """
        Generates self-contained executable Autox.js script with parameters injected.
        """
        self.cleanup_old_scripts()

        # 1. Read _lib.js anti-detection library
        lib_content = ""
        if self.lib_file.exists():
            lib_content = self.lib_file.read_text(encoding="utf-8")
        else:
            logger.warning(f"Library file {self.lib_file} not found. Using minimal fallback.")

        # 2. Read specific task template
        template_file = self.scripts_dir / f"{task_type}.js"
        if not template_file.exists():
            raise FileNotFoundError(f"Autox.js script template '{task_type}.js' not found in {self.scripts_dir}")

        task_content = template_file.read_text(encoding="utf-8")

        # 3. Inject configuration payload safely
        config_json = json.dumps({
            "taskId": task_id,
            "taskType": task_type,
            **params
        }, ensure_ascii=False, indent=2)

        header = f"""/**
 * Auto-generated Autox.js Task Script
 * Task ID: {task_id}
 * Task Type: {task_type}
 * Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}
 */
"auto";
const TASK_CONFIG = {config_json};

"""
        full_code = f"{header}\n\n// ======= ANTI-BAN LIB =======\n{lib_content}\n\n// ======= TASK LOGIC =======\n{task_content}"

        # Write to temporary file for inspection/debugging
        out_file = self.temp_dir / f"run_{task_id}_{task_type}.js"
        out_file.write_text(full_code, encoding="utf-8")

        return full_code
