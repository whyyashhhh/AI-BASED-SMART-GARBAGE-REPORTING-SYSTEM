import os
from functools import lru_cache
from pathlib import Path

from pydantic import BaseModel


BASE_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BASE_DIR.parent
UPLOAD_DIR = PROJECT_ROOT / "backend" / "uploads"
MODEL_DIR = PROJECT_ROOT / "models"
DATABASE_DIR = PROJECT_ROOT / "database"
DATABASE_PATH = DATABASE_DIR / "complaints.db"
DEFAULT_YOLO_WEIGHTS = MODEL_DIR / "garbage_yolov8.pt"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"
JWT_SECRET_KEY = "change-this-secret"
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 12
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


class Settings(BaseModel):
    app_name: str = "Smart Garbage Complaint System"
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]
    database_url: str = f"sqlite:///{DATABASE_PATH.as_posix()}"
    upload_dir: Path = UPLOAD_DIR
    yolo_weights_path: Path = DEFAULT_YOLO_WEIGHTS


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
