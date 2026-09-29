"""
CineVerse ML — Additional unit tests for utils v2 functions.

Run with: pytest tests/test_utils.py -v

Author: Koushik-31368
"""

import pytest
from app.utils import (
    rgb_to_hex, hex_to_rgb, clamp, safe_float,
    truncate, slugify, similarity_percent, is_valid_url,
)


class TestRgbHexConversions:
    def test_rgb_to_hex_black(self):
        assert rgb_to_hex((0, 0, 0)) == "#000000"

    def test_rgb_to_hex_white(self):
        assert rgb_to_hex((255, 255, 255)) == "#ffffff"

    def test_rgb_to_hex_purple(self):
        assert rgb_to_hex((124, 111, 255)) == "#7c6fff"

    def test_hex_to_rgb_black(self):
        assert hex_to_rgb("#000000") == (0, 0, 0)

    def test_hex_to_rgb_shorthand(self):
        assert hex_to_rgb("#fff") == (255, 255, 255)

    def test_hex_to_rgb_invalid_raises(self):
        with pytest.raises(ValueError):
            hex_to_rgb("not-a-colour")

    def test_roundtrip(self):
        rgb = (100, 149, 237)
        assert hex_to_rgb(rgb_to_hex(rgb)) == rgb


class TestClamp:
    def test_within_range(self):
        assert clamp(5, 0, 10) == 5

    def test_below_min(self):
        assert clamp(-1, 0, 10) == 0

    def test_above_max(self):
        assert clamp(20, 0, 10) == 10

    def test_exactly_min(self):
        assert clamp(0, 0, 10) == 0

    def test_exactly_max(self):
        assert clamp(10, 0, 10) == 10


class TestSafeFloat:
    def test_valid_int(self):
        assert safe_float(5) == 5.0

    def test_valid_string(self):
        assert safe_float("3.14") == pytest.approx(3.14)

    def test_none_returns_default(self):
        assert safe_float(None, 0.0) == 0.0

    def test_invalid_string_returns_default(self):
        assert safe_float("not_a_number", -1.0) == -1.0


class TestTruncate:
    def test_short_string_unchanged(self):
        assert truncate("hello", 100) == "hello"

    def test_long_string_truncated(self):
        result = truncate("a" * 300, 200)
        assert len(result) <= 200

    def test_truncation_ends_with_ellipsis(self):
        result = truncate("x" * 300, 50)
        assert result.endswith("…")

    def test_empty_string(self):
        assert truncate("", 50) == ""


class TestSlugify:
    def test_basic(self):
        assert slugify("Hello World") == "hello-world"

    def test_special_chars(self):
        assert slugify("Avengers: Endgame!") == "avengers-endgame"

    def test_multiple_spaces(self):
        assert slugify("one  two   three") == "one-two-three"


class TestSimilarityPercent:
    def test_zero(self):
        assert similarity_percent(0.0) == 0

    def test_one(self):
        assert similarity_percent(1.0) == 100

    def test_half(self):
        assert similarity_percent(0.5) == 50

    def test_clamped_above(self):
        assert similarity_percent(1.5) == 100

    def test_clamped_below(self):
        assert similarity_percent(-0.1) == 0


class TestIsValidUrl:
    def test_https(self):
        assert is_valid_url("https://example.com/image.jpg") is True

    def test_http(self):
        assert is_valid_url("http://example.com") is True

    def test_invalid(self):
        assert is_valid_url("not-a-url") is False

    def test_ftp_invalid(self):
        assert is_valid_url("ftp://example.com") is False
