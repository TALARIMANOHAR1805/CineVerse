"""
test_recommender.py — Tests for the ContentRecommender engine.

Author: Koushik-31368
"""
import pytest
from app.recommender import ContentRecommender, _tokenize, _tf, _cosine_similarity


SAMPLE_ITEMS = [
    {"id": "1", "title": "Inception",     "genres": ["Sci-Fi", "Thriller"], "synopsis": "A dream within a dream"},
    {"id": "2", "title": "Interstellar",  "genres": ["Sci-Fi", "Drama"],    "synopsis": "Space travel through wormhole"},
    {"id": "3", "title": "The Notebook",  "genres": ["Romance", "Drama"],   "synopsis": "A love story"},
    {"id": "4", "title": "Attack on Titan","genres": ["Action", "Fantasy"],  "synopsis": "Giants attack humanity"},
    {"id": "5", "title": "Shutter Island","genres": ["Thriller", "Mystery"],"synopsis": "A mental mystery on island"},
]


class TestTokenize:
    def test_lowercases(self):
        assert "hello" in _tokenize("Hello World")

    def test_removes_punctuation(self):
        tokens = _tokenize("sci-fi, thriller.")
        assert "," not in " ".join(tokens)

    def test_filters_short_tokens(self):
        tokens = _tokenize("a of the big")
        assert "a" not in tokens
        assert "big" in tokens


class TestTF:
    def test_sum_to_one(self):
        tf = _tf(["a", "b", "a"])
        assert abs(sum(tf.values()) - 1.0) < 1e-9

    def test_empty_returns_empty(self):
        assert _tf([]) == {}


class TestCosineSimilarity:
    def test_identical_vectors(self):
        v = {"a": 0.5, "b": 0.5}
        assert abs(_cosine_similarity(v, v) - 1.0) < 1e-6

    def test_orthogonal_vectors(self):
        a = {"x": 1.0}
        b = {"y": 1.0}
        assert _cosine_similarity(a, b) == 0.0

    def test_zero_vector(self):
        assert _cosine_similarity({}, {"a": 1.0}) == 0.0


class TestContentRecommender:
    def test_fit_and_recommend(self):
        rec = ContentRecommender()
        rec.fit(SAMPLE_ITEMS)
        recs = rec.recommend("1", n=2)
        assert len(recs) <= 2

    def test_excludes_query_item(self):
        rec = ContentRecommender()
        rec.fit(SAMPLE_ITEMS)
        recs = rec.recommend("1", n=4)
        ids = [r["id"] for r in recs]
        assert "1" not in ids

    def test_unknown_id_returns_empty(self):
        rec = ContentRecommender()
        rec.fit(SAMPLE_ITEMS)
        assert rec.recommend("999") == []

    def test_sci_fi_similar_to_sci_fi(self):
        rec = ContentRecommender()
        rec.fit(SAMPLE_ITEMS)
        recs = rec.recommend("1", n=2)
        # Inception (Sci-Fi/Thriller) should recommend Interstellar or Shutter Island
        top_genres = [g for r in recs for g in r.get("genres", [])]
        assert any(g in top_genres for g in ["Sci-Fi", "Thriller"])
