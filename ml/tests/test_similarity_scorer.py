"""
test_similarity_scorer.py — Unit tests for similarity_scorer module

Author: Koushik-31368
"""
import pytest
from app.similarity_scorer import (
    jaccard_similarity,
    keyword_overlap_score,
    genre_overlap_score,
    combined_similarity,
)


class TestJaccardSimilarity:
    def test_identical_texts_score_one(self):
        score = jaccard_similarity("action hero battle", "action hero battle")
        assert score == 1.0

    def test_empty_first_text_returns_zero(self):
        assert jaccard_similarity("", "action hero") == 0.0

    def test_empty_second_text_returns_zero(self):
        assert jaccard_similarity("action hero", "") == 0.0

    def test_both_empty_returns_zero(self):
        assert jaccard_similarity("", "") == 0.0

    def test_no_overlap_returns_zero(self):
        score = jaccard_similarity("cat dog", "fish bird")
        assert score == 0.0

    def test_partial_overlap_between_zero_and_one(self):
        score = jaccard_similarity("action hero battle", "action comedy romance")
        assert 0.0 < score < 1.0

    def test_result_is_float(self):
        score = jaccard_similarity("hello world", "world peace")
        assert isinstance(score, float)


class TestKeywordOverlapScore:
    def test_identical_returns_one(self):
        score = keyword_overlap_score("the dark knight batman", "the dark knight batman")
        assert score == 1.0

    def test_no_overlap_returns_zero(self):
        score = keyword_overlap_score("magic spell wizard", "baseball tournament school")
        assert score == 0.0

    def test_empty_inputs_return_zero(self):
        assert keyword_overlap_score("", "some text") == 0.0
        assert keyword_overlap_score("some text", "") == 0.0

    def test_partial_overlap_nonzero(self):
        score = keyword_overlap_score("action adventure hero", "action comedy romance")
        assert score > 0.0


class TestGenreOverlapScore:
    def test_identical_genres_score_one(self):
        score = genre_overlap_score(["action", "comedy"], ["action", "comedy"])
        assert score == 1.0

    def test_no_overlap_returns_zero(self):
        score = genre_overlap_score(["action", "thriller"], ["comedy", "romance"])
        assert score == 0.0

    def test_partial_overlap(self):
        score = genre_overlap_score(["action", "comedy", "drama"], ["action", "horror"])
        assert 0.0 < score < 1.0

    def test_empty_lists_return_zero(self):
        assert genre_overlap_score([], ["action"]) == 0.0
        assert genre_overlap_score(["action"], []) == 0.0

    def test_case_insensitive(self):
        score_lower = genre_overlap_score(["action"], ["action"])
        score_mixed = genre_overlap_score(["Action"], ["ACTION"])
        assert score_lower == score_mixed


class TestCombinedSimilarity:
    def test_returns_float_between_0_and_1(self):
        score = combined_similarity("action hero", "action battle")
        assert 0.0 <= score <= 1.0

    def test_high_similarity_texts(self):
        score = combined_similarity(
            "epic action battle hero fight",
            "epic action battle hero fight",
        )
        assert score > 0.7

    def test_dissimilar_texts_low_score(self):
        score = combined_similarity("romance love couple heart", "space robot alien future")
        assert score < 0.3

    def test_genres_influence_score(self):
        base = combined_similarity("adventure story", "adventure journey")
        with_genres = combined_similarity(
            "adventure story", "adventure journey",
            genres_a=["adventure", "fantasy"],
            genres_b=["adventure", "fantasy"],
        )
        assert with_genres >= base

    def test_custom_weights(self):
        score = combined_similarity(
            "action fight",
            "action fight",
            weights={"jaccard": 1.0, "keywords": 0.0, "genres": 0.0},
        )
        assert score > 0.5
