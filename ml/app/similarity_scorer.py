"""
similarity_scorer.py — CineVerse ML Similarity Scoring

Provides lightweight text similarity scoring for recommendation
matching without requiring ML model downloads.

Algorithms:
  - Jaccard similarity (token overlap)
  - Token intersection ratio
  - Genre overlap score

Author: Koushik-31368
"""

from .text_utils import normalize_text, tokenize, extract_keywords


def jaccard_similarity(text_a: str, text_b: str) -> float:
    """
    Compute Jaccard similarity between two texts.

    J(A, B) = |A ∩ B| / |A ∪ B|

    Args:
        text_a: First text
        text_b: Second text

    Returns:
        Float between 0.0 (no overlap) and 1.0 (identical token sets)
    """
    if not text_a or not text_b:
        return 0.0

    tokens_a = set(tokenize(normalize_text(text_a)))
    tokens_b = set(tokenize(normalize_text(text_b)))

    if not tokens_a or not tokens_b:
        return 0.0

    intersection = tokens_a & tokens_b
    union        = tokens_a | tokens_b

    return round(len(intersection) / len(union), 4) if union else 0.0


def keyword_overlap_score(text_a: str, text_b: str, top_n: int = 10) -> float:
    """
    Score based on keyword overlap (uses top N keywords from each).

    Args:
        text_a: First text (e.g., query)
        text_b: Second text (e.g., synopsis)
        top_n:  Number of keywords to extract from each

    Returns:
        Float between 0.0 and 1.0
    """
    if not text_a or not text_b:
        return 0.0

    kw_a = set(extract_keywords(text_a, top_n=top_n))
    kw_b = set(extract_keywords(text_b, top_n=top_n))

    if not kw_a or not kw_b:
        return 0.0

    overlap = kw_a & kw_b
    return round(len(overlap) / len(kw_a | kw_b), 4)


def genre_overlap_score(genres_a: list[str], genres_b: list[str]) -> float:
    """
    Score genre list overlap.

    Args:
        genres_a: Genres of item A
        genres_b: Genres of item B

    Returns:
        Float between 0.0 and 1.0
    """
    if not genres_a or not genres_b:
        return 0.0

    set_a = {g.lower() for g in genres_a}
    set_b = {g.lower() for g in genres_b}
    union = set_a | set_b

    return round(len(set_a & set_b) / len(union), 4) if union else 0.0


def combined_similarity(
    text_a: str,
    text_b: str,
    genres_a: list[str] | None = None,
    genres_b: list[str] | None = None,
    weights: dict[str, float] | None = None,
) -> float:
    """
    Compute weighted combined similarity score.

    Default weights:
      - jaccard:  0.4
      - keywords: 0.4
      - genres:   0.2

    Returns:
        Float between 0.0 and 1.0
    """
    w = weights or {"jaccard": 0.4, "keywords": 0.4, "genres": 0.2}

    j_score  = jaccard_similarity(text_a, text_b)
    kw_score = keyword_overlap_score(text_a, text_b)
    g_score  = genre_overlap_score(genres_a or [], genres_b or [])

    total = (
        w.get("jaccard",  0.4) * j_score +
        w.get("keywords", 0.4) * kw_score +
        w.get("genres",   0.2) * g_score
    )
    return round(min(total, 1.0), 4)
