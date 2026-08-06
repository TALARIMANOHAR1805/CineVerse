"""
poster.py — Phase 4: Poster image analysis.

Features:
  1. Dominant color extraction (for UI theming)
  2. Brightness / vibe classification (dark, medium, bright)
  3. Color palette generation

Uses Pillow + colorthief — no GPU required, runs on any CPU.
"""

import io
import httpx
from PIL import Image
from colorthief import ColorThief


async def analyze_poster(poster_url: str) -> dict:
    """
    Download a movie poster and extract visual features.
    Returns dominant color, palette, brightness, and vibe.
    """
    image_bytes = await _download_image(poster_url)
    if not image_bytes:
        return {"error": "Failed to download poster", "posterUrl": poster_url}

    try:
        # Dominant color + palette
        ct = ColorThief(io.BytesIO(image_bytes))
        dominant = ct.get_color(quality=5)
        palette = ct.get_palette(color_count=5, quality=5)

        # Brightness & vibe
        brightness = _brightness(dominant)
        vibe = _classify_vibe(brightness, dominant)

        return {
            "posterUrl": poster_url,
            "dominantColor": _rgb_hex(dominant),
            "dominantRgb": list(dominant),
            "palette": [_rgb_hex(c) for c in palette],
            "paletteRgb": [list(c) for c in palette],
            "brightness": round(brightness, 2),
            "vibe": vibe,
        }
    except Exception as e:
        return {"error": str(e), "posterUrl": poster_url}


async def _download_image(url: str) -> bytes | None:
    """Download poster image bytes."""
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.content
    except Exception:
        pass
    return None


def _brightness(rgb: tuple[int, int, int]) -> float:
    """Perceived brightness (0-255) using luminance formula."""
    r, g, b = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b


def _classify_vibe(brightness: float, rgb: tuple[int, int, int]) -> str:
    """Classify the visual vibe based on brightness and color."""
    r, g, b = rgb
    saturation = max(r, g, b) - min(r, g, b)

    if brightness < 60:
        return "dark"
    elif brightness < 100:
        if saturation > 100:
            return "intense"
        return "moody"
    elif brightness < 170:
        if saturation > 120:
            return "vibrant"
        return "neutral"
    else:
        if saturation > 100:
            return "energetic"
        return "bright"


def _rgb_hex(rgb: tuple[int, int, int]) -> str:
    """Convert RGB tuple to hex string."""
    return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
