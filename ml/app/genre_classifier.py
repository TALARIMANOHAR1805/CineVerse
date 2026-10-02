"""
genre_classifier.py — CineVerse ML Genre Classification Utility

Provides lightweight genre scoring using keyword matching and
text similarity without requiring external ML libraries.

Author: Koushik-31368
"""

from typing import Optional
from .text_utils import normalize_text, tokenize, extract_keywords

# ── Genre keyword maps ─────────────────────────────────────────
MOVIE_GENRE_KEYWORDS: dict[str, list[str]] = {
    "action":     ["action", "fight", "battle", "explosion", "hero", "combat", "warrior", "chase"],
    "comedy":     ["comedy", "funny", "humor", "laugh", "hilarious", "witty", "satire", "joke"],
    "drama":      ["drama", "emotional", "story", "life", "struggle", "family", "relationship"],
    "horror":     ["horror", "scary", "terror", "ghost", "monster", "fear", "dark", "supernatural"],
    "romance":    ["romance", "love", "relationship", "couple", "heart", "passion", "affection"],
    "sci-fi":     ["sci-fi", "science", "space", "future", "robot", "alien", "technology", "dystopia"],
    "thriller":   ["thriller", "suspense", "mystery", "tension", "crime", "detective", "twist"],
    "animation":  ["animation", "animated", "cartoon", "pixar", "anime", "studio"],
    "fantasy":    ["fantasy", "magic", "wizard", "dragon", "mythical", "enchanted", "kingdom"],
    "documentary":["documentary", "real", "true", "history", "facts", "world", "nature"],
}

ANIME_GENRE_KEYWORDS: dict[str, list[str]] = {
    "shonen":    ["shonen", "battle", "power", "training", "friendship", "protagonist"],
    "isekai":    ["isekai", "another world", "transported", "reincarnated", "summoned"],
    "romance":   ["romance", "love", "school", "confession", "relationship", "couple"],
    "slice-of-life": ["slice", "daily", "school life", "peaceful", "everyday"],
    "mecha":     ["mecha", "robot", "gundam", "pilot", "machine", "giant"],
    "magic":     ["magic", "spell", "wizard", "witch", "mage", "grimoire"],
    "horror":    ["horror", "ghost", "dark", "curse", "demon", "supernatural"],
    "sports":    ["sports", "baseball", "soccer", "basketball", "tournament", "team"],
}


def score_genres(text: str, media_type: str = "movie") -> dict[str, float]:
    """
    Score genres for a given text.

    Args:
        text: Description, synopsis or query text
        media_type: 'movie' or 'anime'

    Returns:
        Dict mapping genre -> score (0.0 to 1.0)
    """
    if not text:
        return {}

    normalized = normalize_text(text)
    tokens = set(tokenize(normalized))
    genre_map = MOVIE_GENRE_KEYWORDS if media_type == "movie" else ANIME_GENRE_KEYWORDS

    scores: dict[str, float] = {}
    for genre, keywords in genre_map.items():
        matches = sum(1 for kw in keywords if kw in normalized or kw in tokens)
        if matches > 0:
            scores[genre] = round(min(matches / len(keywords), 1.0), 3)

    return scores


def classify_top_genres(text: str, media_type: str = "movie", top_n: int = 3) -> list[str]:
    """
    Return the top N genre labels for a given text.

    Args:
        text: Description text
        media_type: 'movie' or 'anime'
        top_n: Number of genres to return

    Returns:
        Sorted list of genre names by score (highest first)
    """
    scores = score_genres(text, media_type)
    sorted_genres = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    return [g for g, _ in sorted_genres[:top_n]]


def get_genre_confidence(text: str, genre: str, media_type: str = "movie") -> float:
    """
    Get the confidence score for a specific genre.

    Args:
        text: Description text
        genre: Target genre name
        media_type: 'movie' or 'anime'

    Returns:
        Confidence score between 0.0 and 1.0
    """
    scores = score_genres(text, media_type)
    return scores.get(genre.lower(), 0.0)
