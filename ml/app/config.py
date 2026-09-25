"""
CineVerse ML Service — Configuration management.

Loads all settings from environment variables with sensible defaults.
Uses pydantic-settings for validation and automatic .env file loading.

Added by: Koushik-31368
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.

    All fields are typed and validated automatically by Pydantic.
    Override any value by setting the corresponding environment variable.
    """

    # ── App ──────────────────────────────────────────────────────────────────
    app_name: str = "CineVerse ML Service"
    app_version: str = "1.0.0"
    debug: bool = False

    # ── Server ───────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8001

    # ── External APIs ────────────────────────────────────────────────────────
    tmdb_image_base_url: str = "https://image.tmdb.org/t/p/w500"

    # ── ML Configuration ─────────────────────────────────────────────────────
    # Number of dominant colours to extract from poster images
    poster_color_clusters: int = 5

    # Maximum image download size in bytes (10 MB)
    max_image_bytes: int = 10 * 1024 * 1024

    # HTTP timeout for external image requests (seconds)
    image_fetch_timeout: float = 10.0

    # Minimum cosine similarity score to consider a vibe match valid
    vibe_similarity_threshold: float = 0.65

    # ── CORS ─────────────────────────────────────────────────────────────────
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # ── Logging ──────────────────────────────────────────────────────────────
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return cached application settings.
    Cached so the .env file is only read once at startup.

    Usage:
        from app.config import get_settings
        settings = get_settings()
    """
    return Settings()
