"""
CineVerse ML Service — Utility helpers shared across modules.

Includes:
- Image downloading and validation
- Colour hex conversion
- Safe JSON serialisation
- Response timing decorator

Added by: Koushik-31368
"""

import time
import functools
import logging
from typing import Optional, Tuple

import httpx
from PIL import Image
import io

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Image Utilities
# ─────────────────────────────────────────────────────────────────────────────

def download_image(url: str, timeout: float = 10.0) -> Optional[Image.Image]:
    """
    Download an image from a URL and return a PIL Image object.

    Args:
        url:     The image URL to download.
        timeout: HTTP request timeout in seconds.

    Returns:
        PIL.Image.Image if successful, None if the download fails.
    """
    if not url or not url.startswith("http"):
        logger.warning("download_image: invalid URL received: %s", url)
        return None

    try:
        response = httpx.get(url, timeout=timeout, follow_redirects=True)
        response.raise_for_status()
        image = Image.open(io.BytesIO(response.content)).convert("RGB")
        logger.debug("download_image: fetched %s (%d bytes)", url, len(response.content))
        return image
    except httpx.HTTPStatusError as e:
        logger.error("download_image: HTTP %s for %s", e.response.status_code, url)
    except httpx.RequestError as e:
        logger.error("download_image: request error for %s — %s", url, e)
    except Exception as e:
        logger.error("download_image: unexpected error for %s — %s", url, e)
    return None


def rgb_to_hex(rgb: Tuple[int, int, int]) -> str:
    """
    Convert an (R, G, B) tuple to a hex colour string.

    Args:
        rgb: A tuple of three ints in range 0–255.

    Returns:
        Hex string, e.g. '#f72585'.
    """
    r, g, b = (max(0, min(255, int(c))) for c in rgb)
    return f"#{r:02x}{g:02x}{b:02x}"


def clamp(value: float, min_val: float = 0.0, max_val: float = 1.0) -> float:
    """Clamp a float value between min_val and max_val."""
    return max(min_val, min(max_val, value))


# ─────────────────────────────────────────────────────────────────────────────
# Timing Decorator
# ─────────────────────────────────────────────────────────────────────────────

def timed(func):
    """
    Decorator that logs the execution time of any function.

    Usage:
        @timed
        def my_slow_function(): ...
    """
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = (time.perf_counter() - start) * 1000
        logger.debug("%s completed in %.2f ms", func.__qualname__, elapsed)
        return result
    return wrapper


# ─────────────────────────────────────────────────────────────────────────────
# Safe Serialisation
# ─────────────────────────────────────────────────────────────────────────────

def safe_float(value, default: float = 0.0) -> float:
    """Safely convert a value to float, returning default on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def safe_int(value, default: int = 0) -> int:
    """Safely convert a value to int, returning default on failure."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
