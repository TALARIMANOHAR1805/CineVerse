"""
test_vibe_engine.py — Unit tests for the vibe engine.

Author: Koushik-31368
"""

import pytest
from app.vibe_engine import get_vibe, score_content_for_vibe, rank_by_vibe, VALID_VIBES


class TestGetVibe:
    def test_dark_vibe_exists(self):
        vibe = get_vibe("dark")
        assert vibe["label"] == "Dark & Intense"
        assert "tmdb_genres" in vibe

    def test_all_vibes_have_required_keys(self):
        for name in VALID_VIBES:
            v = get_vibe(name)
            assert "label"        in v
            assert "tmdb_genres"  in v
            assert "jikan_genres" in v
            assert "palette"      in v

    def test_invalid_vibe_raises(self):
        with pytest.raises(ValueError, match="Unknown vibe"):
            get_vibe("nonexistent_vibe_xyz")

    def test_palette_has_three_colors(self):
        for name in VALID_VIBES:
            assert len(get_vibe(name)["palette"]) == 3


class TestScoreContent:
    def test_matching_genres_score_above_zero(self):
        score = score_content_for_vibe(["horror", "psychological"], "dark")
        assert score > 0.0

    def test_no_genres_returns_zero(self):
        assert score_content_for_vibe([], "dark") == 0.0

    def test_score_between_0_and_1(self):
        score = score_content_for_vibe(["action", "quest", "hero"], "epic")
        assert 0.0 <= score <= 1.0

    def test_non_matching_genres(self):
        score = score_content_for_vibe(["romance", "slice of life"], "dark")
        assert score == 0.0


class TestRankByVibe:
    def test_returns_sorted_list(self):
        items = [
            {"title": "Romance Movie", "genres": ["romance", "drama"]},
            {"title": "Horror Film",   "genres": ["horror", "psychological"]},
        ]
        ranked = rank_by_vibe(items, "dark")
        assert ranked[0]["title"] == "Horror Film"

    def test_vibe_score_key_added(self):
        items = [{"title": "Test", "genres": ["horror"]}]
        ranked = rank_by_vibe(items, "dark")
        assert "_vibe_score" in ranked[0]

    def test_empty_list_returns_empty(self):
        assert rank_by_vibe([], "epic") == []
