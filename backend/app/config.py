from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration settings."""

    APP_NAME: str = "WindLens - UK Day-Ahead Wind Generation Procurement Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Elexon BMRS API configuration
    ELEXON_BASE_URL: str = "https://data.elexon.co.uk/bmrs/api/v1"
    ELEXON_TIMEOUT_SECONDS: float = 20.0
    ELEXON_MAX_RETRIES: int = 3
    ELEXON_RETRY_BACKOFF: float = 1.5

    # Storage paths
    DATA_DIR: Path = Path(__file__).resolve().parent / "data"
    ACTUALS_CACHE_FILE: str = "january_2026_actuals.json"
    FORECASTS_CACHE_FILE: str = "january_2026_forecasts.json"

    # Evaluation bounds
    EVALUATION_START_DATE: str = "2026-01-01"
    EVALUATION_END_DATE: str = "2026-01-31"

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    CORS_ORIGIN_REGEX: str = r"^https:\/\/.*(\.vercel\.app|\.onrender\.com)$"

    # Server binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
