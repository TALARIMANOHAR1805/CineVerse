"""
test_text_utils.py — Tests for text preprocessing utilities.

Author: Koushik-31368
"""
import pytest
from app.text_utils import normalize, tokenize, build_ngrams, extract_keywords


class TestNormalize:
    def test_lowercases(self):
        assert normalize("INCEPTION") == "inception"

    def test_removes_accents(self):
        result = normalize("café naïve")
        assert "é" not in result
        assert "café" not in result

    def test_strips_punctuation(self):
        result = normalize("hello, world!")
        assert "," not in result

    def test_collapses_whitespace(self):
        result = normalize("  too   many   spaces  ")
        assert "  " not in result
        assert result == "too many spaces"


class TestTokenize:
    def test_removes_stopwords_by_default(self):
        tokens = tokenize("this is a great movie")
        assert "this" not in tokens
        assert "is" not in tokens
        assert "a" not in tokens
        assert "great" in tokens
        assert "movie" in tokens

    def test_keep_stopwords_when_disabled(self):
        tokens = tokenize("this is great", remove_stopwords=False)
        assert "this" in tokens
        assert "is" in tokens

    def test_min_length_filter(self):
        tokens = tokenize("I am an AI going", min_length=3)
        assert "am" not in tokens
        assert "going" in tokens

    def test_empty_string(self):
        assert tokenize("") == []


class TestBuildNgrams:
    def test_bigrams(self):
        ngrams = build_ngrams(["action", "sci", "fi"], n=2)
        assert "action_sci" in ngrams

    def test_trigrams(self):
        ngrams = build_ngrams(["a", "b", "c", "d"], n=3)
        assert "a_b_c" in ngrams

    def test_tokens_shorter_than_n(self):
        result = build_ngrams(["only"], n=2)
        assert result == ["only"]  # returns tokens as-is


class TestExtractKeywords:
    def test_returns_list(self):
        kws = extract_keywords("action thriller mystery action mystery")
        assert isinstance(kws, list)

    def test_most_frequent_first(self):
        kws = extract_keywords("horror horror horror romance")
        assert kws[0] == "horror"

    def test_top_n_limit(self):
        text = " ".join([f"word{i}" for i in range(20)])
        kws = extract_keywords(text, top_n=5)
        assert len(kws) == 5
