"""
CineVerse ML — Logging configuration.

Sets up structured logging with a consistent format for all modules.
Call setup_logging() once at application startup in main.py.

Added by: Koushik-31368
"""

import logging
import sys
from app.config import get_settings


def setup_logging() -> None:
    """
    Configure the root logger with level and formatter based on app settings.

    Log format:
        2026-09-28 14:10:47 [INFO ] cineverse.ml: GET /health [req_id=abc123] [12.3ms]
    """
    settings = get_settings()

    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    formatter = logging.Formatter(
        fmt="%(asctime)s [%(levelname)-5s] %(name)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    handler.setLevel(level)

    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # Avoid duplicate handlers if setup_logging() is called multiple times
    if not root_logger.handlers:
        root_logger.addHandler(handler)
    else:
        root_logger.handlers.clear()
        root_logger.addHandler(handler)

    # Quieten noisy third-party loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("PIL").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    logging.getLogger("cineverse.ml").info(
        "Logging configured — level=%s", settings.log_level.upper()
    )
