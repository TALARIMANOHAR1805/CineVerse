"""
CineVerse ML — recommender.py
Simple content-based recommendation engine using TF-IDF on genre+synopsis.

Author: Koushik-31368
"""

from typing import List, Dict, Any, Optional
import math
import re


def _tokenize(text: str) -> List[str]:
    """Lowercase, strip punctuation, split into tokens."""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return [t for t in text.split() if len(t) > 2]


def _tf(tokens: List[str]) -> Dict[str, float]:
    """Term frequency: count / total."""
    if not tokens:
        return {}
    freq: Dict[str, int] = {}
    for t in tokens:
        freq[t] = freq.get(t, 0) + 1
    n = len(tokens)
    return {t: c / n for t, c in freq.items()}


def _idf(docs: List[List[str]]) -> Dict[str, float]:
    """Inverse document frequency."""
    N = len(docs)
    df: Dict[str, int] = {}
    for doc in docs:
        for t in set(doc):
            df[t] = df.get(t, 0) + 1
    return {t: math.log((N + 1) / (c + 1)) + 1 for t, c in df.items()}


def _tfidf_vector(tf_map: Dict[str, float], idf_map: Dict[str, float]) -> Dict[str, float]:
    return {t: tf_map[t] * idf_map.get(t, 1.0) for t in tf_map}


def _cosine_similarity(a: Dict[str, float], b: Dict[str, float]) -> float:
    """Cosine similarity between two sparse TF-IDF vectors."""
    keys = set(a) & set(b)
    dot  = sum(a[k] * b[k] for k in keys)
    mag_a = math.sqrt(sum(v * v for v in a.values()))
    mag_b = math.sqrt(sum(v * v for v in b.values()))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


class ContentRecommender:
    """
    Simple content-based recommender.

    Usage:
        rec = ContentRecommender()
        rec.fit(items)          # items: list of dicts with 'id', 'title', 'genres', 'synopsis'
        recs = rec.recommend("item_id", n=5)
    """

    def __init__(self):
        self._items: List[Dict[str, Any]] = []
        self._vectors: List[Dict[str, float]] = []

    def fit(self, items: List[Dict[str, Any]]) -> "ContentRecommender":
        """Build TF-IDF index from item list."""
        self._items = items
        docs = []
        for item in items:
            text = " ".join([
                item.get("title", ""),
                " ".join(item.get("genres", [])),
                item.get("synopsis", ""),
            ])
            docs.append(_tokenize(text))

        idf = _idf(docs)
        self._vectors = [_tfidf_vector(_tf(doc), idf) for doc in docs]
        return self

    def recommend(self, item_id: str, n: int = 6) -> List[Dict[str, Any]]:
        """Return top-n similar items (excluding the query item)."""
        idx_map = {str(item["id"]): i for i, item in enumerate(self._items)}
        if item_id not in idx_map:
            return []
        query_idx = idx_map[item_id]
        query_vec = self._vectors[query_idx]

        scores = []
        for i, vec in enumerate(self._vectors):
            if i == query_idx:
                continue
            scores.append((i, _cosine_similarity(query_vec, vec)))

        scores.sort(key=lambda x: x[1], reverse=True)
        return [self._items[i] for i, _ in scores[:n]]
