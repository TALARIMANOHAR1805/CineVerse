"""
CineVerse ML — text_utils.py
Text preprocessing utilities for the recommendation engine.

Author: Koushik-31368
"""

import re
import unicodedata
from typing import List, Set

# Common stopwords to remove before TF-IDF
STOPWORDS: Set[str] = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "from", "is", "are", "was", "were",
    "this", "that", "it", "its", "he", "she", "they", "we", "you",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "not", "no", "so", "if", "as", "when", "where", "who", "what",
    "how", "can", "could", "will", "would", "may", "might",
}


def normalize(text: str) -> str:
    """Lowercase, remove accents, collapse whitespace."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def normalize_text(text: str) -> str:
    """Backward-compatible alias for normalize()."""
    return normalize(text)


def tokenize(text: str, remove_stopwords: bool = True, min_length: int = 2) -> List[str]:
    """Normalize and split text into tokens, optionally removing stopwords."""
    tokens = normalize(text).split()
    tokens = [t for t in tokens if len(t) >= min_length]
    if remove_stopwords:
        tokens = [t for t in tokens if t not in STOPWORDS]
    return tokens


def build_ngrams(tokens: List[str], n: int = 2) -> List[str]:
    """Generate n-gram tokens from a list of tokens."""
    if n < 1 or len(tokens) < n:
        return tokens
    ngrams = []
    for i in range(len(tokens) - n + 1):
        ngrams.append("_".join(tokens[i:i+n]))
    return ngrams


def extract_keywords(text: str, top_n: int = 10) -> List[str]:
    """
    Return the top_n most frequent meaningful tokens from text.
    Simple frequency-based keyword extraction.
    """
    tokens = tokenize(text)
    freq: dict = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    sorted_tokens = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [t for t, _ in sorted_tokens[:top_n]]
