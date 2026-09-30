"""
test_color_utils_v2.py — Tests for enhanced color_utils (HSL, palette generation).

Author: Koushik-31368
"""
import pytest
from app.color_utils import (
    rgb_to_hex, hex_to_rgb,
    rgb_to_hsl, hsl_to_rgb,
    generate_palette,
)


class TestRgbHslRoundTrip:
    def test_red_hue(self):
        h, s, l = rgb_to_hsl(255, 0, 0)
        assert 0 <= h < 10 or h > 350  # near 0°

    def test_green_hue(self):
        h, s, l = rgb_to_hsl(0, 255, 0)
        assert abs(h - 120) < 2

    def test_blue_hue(self):
        h, s, l = rgb_to_hsl(0, 0, 255)
        assert abs(h - 240) < 2

    def test_white_lightness(self):
        _, _, l = rgb_to_hsl(255, 255, 255)
        assert abs(l - 1.0) < 0.01

    def test_black_lightness(self):
        _, _, l = rgb_to_hsl(0, 0, 0)
        assert abs(l - 0.0) < 0.01

    def test_gray_zero_saturation(self):
        _, s, _ = rgb_to_hsl(128, 128, 128)
        assert abs(s) < 0.01

    def test_roundtrip_rgb_hsl_rgb(self):
        original = (100, 150, 200)
        h, s, l = rgb_to_hsl(*original)
        back = hsl_to_rgb(h, s, l)
        # Allow ±2 rounding error
        for a, b in zip(original, back):
            assert abs(a - b) <= 2


class TestGeneratePalette:
    def test_returns_correct_count(self):
        palette = generate_palette("#7c6fff", steps=5)
        assert len(palette) == 5

    def test_all_valid_hex(self):
        palette = generate_palette("#ff6b9d", steps=4)
        for color in palette:
            assert color.startswith("#")
            assert len(color) == 7

    def test_custom_steps(self):
        palette = generate_palette("#38ef7d", steps=3)
        assert len(palette) == 3

    def test_dark_to_light_ordering(self):
        palette = generate_palette("#4facfe", steps=5)
        # Last entry should be lighter (higher L) than first
        _, _, l_first = rgb_to_hsl(*hex_to_rgb(palette[0]))
        _, _, l_last  = rgb_to_hsl(*hex_to_rgb(palette[-1]))
        assert l_last > l_first
