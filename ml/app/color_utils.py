"""
CineVerse ML — color_utils.py v2
RGB-to-hex and hex-to-RGB conversion utilities with validation.
Enhanced with HSL conversion and color palette generation.

Author: Koushik-31368
"""

import math
from typing import Tuple, List


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Convert RGB (0-255) to hex string like '#ff6b9d'."""
    def clamp(v: int) -> int:
        return max(0, min(255, int(v)))
    return "#{:02x}{:02x}{:02x}".format(clamp(r), clamp(g), clamp(b))


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert '#rrggbb' or '#rgb' hex to (r, g, b) tuple."""
    h = hex_color.lstrip('#')
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    if len(h) != 6:
        raise ValueError(f"Invalid hex color: '{hex_color}'")
    r = int(h[0:2], 16)
    g = int(h[2:4], 16)
    b = int(h[4:6], 16)
    return r, g, b


def rgb_to_hsl(r: int, g: int, b: int) -> Tuple[float, float, float]:
    """
    Convert RGB (0-255) to HSL (h:0-360, s:0-1, l:0-1).
    """
    r_, g_, b_ = r / 255, g / 255, b / 255
    cmax = max(r_, g_, b_)
    cmin = min(r_, g_, b_)
    delta = cmax - cmin

    l = (cmax + cmin) / 2

    if delta == 0:
        return 0.0, 0.0, l

    s = delta / (1 - abs(2 * l - 1))

    if cmax == r_:
        h = 60 * (((g_ - b_) / delta) % 6)
    elif cmax == g_:
        h = 60 * (((b_ - r_) / delta) + 2)
    else:
        h = 60 * (((r_ - g_) / delta) + 4)

    return round(h % 360, 2), round(s, 4), round(l, 4)


def hsl_to_rgb(h: float, s: float, l: float) -> Tuple[int, int, int]:
    """Convert HSL (h:0-360, s:0-1, l:0-1) to RGB (0-255)."""
    c = (1 - abs(2 * l - 1)) * s
    x = c * (1 - abs((h / 60) % 2 - 1))
    m = l - c / 2

    if   h < 60:  r_, g_, b_ = c, x, 0
    elif h < 120: r_, g_, b_ = x, c, 0
    elif h < 180: r_, g_, b_ = 0, c, x
    elif h < 240: r_, g_, b_ = 0, x, c
    elif h < 300: r_, g_, b_ = x, 0, c
    else:         r_, g_, b_ = c, 0, x

    return (
        round((r_ + m) * 255),
        round((g_ + m) * 255),
        round((b_ + m) * 255),
    )


def generate_palette(base_hex: str, steps: int = 5) -> List[str]:
    """
    Generate a monochromatic palette from a base hex color.
    Returns `steps` hex colors ranging from dark to light.
    """
    r, g, b = hex_to_rgb(base_hex)
    h, s, l = rgb_to_hsl(r, g, b)
    palette = []
    for i in range(steps):
        new_l = 0.15 + (i / (steps - 1)) * 0.65  # 15% to 80%
        nr, ng, nb = hsl_to_rgb(h, s, new_l)
        palette.append(rgb_to_hex(nr, ng, nb))
    return palette
