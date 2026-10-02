"""
test_genre_classifier.py — Unit tests for genre_classifier module

Tests:
 - score_genres returns correct keys and values
 - classify_top_genres returns sorted top genres
 - get_genre_confidence returns 0.0 for unknown genre
 - Empty text returns empty dict
 - anime-specific genres work correctly

Author: Koushik-31368
"""
import pytest
from app.genre_classifier import score_genres, classify_top_genres, get_genre_confidence


class TestScoreGenres:
    def test_returns_dict(self):
        result = score_genres("an action packed fight scene", "movie")
        assert isinstance(result, dict)

    def test_action_scores_high(self):
        result = score_genres("epic battle fight combat explosion hero", "movie")
        assert "action" in result
        assert result["action"] > 0.3

    def test_comedy_scores_high(self):
        result = score_genres("funny comedy humor laugh hilarious joke", "movie")
        assert "comedy" in result
        assert result["comedy"] > 0.5

    def test_empty_text_returns_empty(self):
        result = score_genres("", "movie")
        assert result == {}

    def test_scores_between_0_and_1(self):
        result = score_genres("action fight battle drama story emotion love romance", "movie")
        for score in result.values():
            assert 0.0 <= score <= 1.0

    def test_horror_detection(self):
        result = score_genres("ghost scary terror monster dark supernatural fear", "movie")
        assert "horror" in result

    def test_anime_isekai_detection(self):
        result = score_genres("transported to another world reincarnated summoned", "anime")
        assert "isekai" in result

    def test_anime_sports_detection(self):
        result = score_genres("baseball team tournament sports school competition", "anime")
        assert "sports" in result


class TestClassifyTopGenres:
    def test_returns_list(self):
        result = classify_top_genres("action fight battle", "movie")
        assert isinstance(result, list)

    def test_returns_at_most_n_genres(self):
        result = classify_top_genres("story life love drama family relationship", "movie", top_n=2)
        assert len(result) <= 2

    def test_top_genre_is_most_relevant(self):
        result = classify_top_genres("comedy funny laugh humor hilarious witty joke satire", "movie", top_n=3)
        assert len(result) > 0
        assert result[0] == "comedy"

    def test_empty_text_returns_empty_list(self):
        result = classify_top_genres("", "movie")
        assert result == []

    def test_anime_magic_classification(self):
        result = classify_top_genres("magic spell wizard mage grimoire witch", "anime", top_n=1)
        assert "magic" in result


class TestGetGenreConfidence:
    def test_returns_float(self):
        conf = get_genre_confidence("action fight hero battle", "action", "movie")
        assert isinstance(conf, float)

    def test_known_genre_nonzero(self):
        conf = get_genre_confidence("scary ghost monster horror terror", "horror", "movie")
        assert conf > 0.0

    def test_unknown_genre_returns_zero(self):
        conf = get_genre_confidence("action fight hero battle", "nonexistent_genre", "movie")
        assert conf == 0.0

    def test_confidence_between_0_and_1(self):
        conf = get_genre_confidence("funny comedy humor laugh hilarious witty joke", "comedy", "movie")
        assert 0.0 <= conf <= 1.0

    def test_case_insensitive_genre(self):
        conf_lower = get_genre_confidence("funny comedy", "comedy", "movie")
        conf_upper = get_genre_confidence("funny comedy", "Comedy", "movie")
        assert conf_lower == conf_upper
