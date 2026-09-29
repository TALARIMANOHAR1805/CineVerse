"""
CineVerse ML — Utility functions v2.

Added by: Koushik-31368
"""

import re


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    """Convert an (R, G, B) tuple to a hex colour string."""
    r, g, b = (clamp(int(c), 0, 255) for c in rgb)
    return f"#{r:02x}{g:02x}{b:02x}"


def hex_to_rgb(hex_str: str) -> tuple[int, int, int]:
    """Convert a hex colour string to an (R, G, B) tuple."""
    hex_str = hex_str.lstrip('#')
    if len(hex_str) == 3:
        hex_str = ''.join(c * 2 for c in hex_str)
    if len(hex_str) != 6 or not re.fullmatch(r'[0-9a-fA-F]{6}', hex_str):
        raise ValueError(f"Invalid hex colour: #{hex_str}")
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))


def clamp(value: int | float, lo: int | float, hi: int | float) -> int | float:
    """Clamp a value between lo and hi (inclusive)."""
    return max(lo, min(hi, value))


def safe_float(value, default: float = 0.0) -> float:
    """Safely convert a value to float, returning default on failure."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def truncate(text: str, max_len: int = 200, suffix: str = "…") -> str:
    """Truncate a string to max_len characters, appending suffix if truncated."""
    if not text or len(text) <= max_len:
        return text
    return text[:max_len - len(suffix)].rstrip() + suffix


def slugify(text: str) -> str:
    """Convert a string to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')


def similarity_percent(score: float) -> int:
    """Convert a 0.0–1.0 similarity score to a 0–100 percentage."""
    return round(clamp(score, 0.0, 1.0) * 100)


def is_valid_url(url: str) -> bool:
    """Return True if the string looks like a valid HTTP/HTTPS URL."""
    return bool(re.match(r'^https?://', url.strip()))
