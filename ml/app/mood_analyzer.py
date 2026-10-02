"""
mood_analyzer.py — CineVerse ML Mood Analysis Module

Analyzes the emotional tone of a movie/anime description or user query
and maps it to watch-ready mood categories.

Mood Categories:
  - excited    (high energy, intense)
  - relaxed    (calm, easy-watching)
  - emotional  (touching, tear-jerker)
  - adventurous (exploration, journey)
  - scary      (horror, tension)
  - funny      (comedy, lighthearted)
  - romantic   (love, relationship)
  - thoughtful (deep, philosophical)

Author: Koushik-31368
"""

from .text_utils import normalize_text, tokenize

# ── Mood keyword maps ──────────────────────────────────────────
MOOD_KEYWORDS: dict[str, list[str]] = {
    "excited": [
        "intense", "explosive", "thrilling", "epic", "action", "fast",
        "adrenaline", "battle", "fight", "chase", "tournament", "power",
    ],
    "relaxed": [
        "calm", "peaceful", "gentle", "slice of life", "cozy", "slow",
        "everyday", "relaxing", "soothing", "school", "daily",
    ],
    "emotional": [
        "emotional", "sad", "cry", "tears", "touching", "heartwarming",
        "grief", "loss", "bittersweet", "moving", "poignant", "family",
    ],
    "adventurous": [
        "adventure", "journey", "quest", "explore", "travel", "discover",
        "world", "ancient", "mystery", "dungeon", "expedition",
    ],
    "scary": [
        "horror", "scary", "dark", "ghost", "fear", "terror", "monster",
        "supernatural", "cursed", "haunted", "demon", "creepy",
    ],
    "funny": [
        "comedy", "funny", "laugh", "humor", "hilarious", "satire",
        "joke", "silly", "absurd", "parody", "witty",
    ],
    "romantic": [
        "romance", "love", "relationship", "couple", "confession",
        "heart", "affection", "kissing", "dating", "soulmate",
    ],
    "thoughtful": [
        "philosophy", "deep", "meaning", "existential", "society",
        "human", "morality", "consciousness", "psychological", "mind",
    ],
}


def analyze_mood(text: str) -> dict[str, float]:
    """
    Analyze the mood of a text passage.

    Returns:
        Dict of mood -> confidence score (0.0 to 1.0)
    """
    if not text:
        return {}

    normalized = normalize_text(text)
    tokens = set(tokenize(normalized))

    scores: dict[str, float] = {}
    for mood, keywords in MOOD_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in normalized or kw in tokens)
        if matches > 0:
            scores[mood] = round(min(matches / max(len(keywords) * 0.4, 1), 1.0), 3)

    return scores


def get_dominant_mood(text: str) -> str | None:
    """
    Get the single dominant mood for a text.

    Returns:
        Mood name string, or None if no mood detected
    """
    scores = analyze_mood(text)
    if not scores:
        return None
    return max(scores, key=scores.get)


def get_mood_emoji(mood: str) -> str:
    """Map a mood name to an emoji."""
    MOOD_EMOJIS = {
        "excited":     "⚡",
        "relaxed":     "🌸",
        "emotional":   "🥺",
        "adventurous": "🗺️",
        "scary":       "👻",
        "funny":       "😄",
        "romantic":    "💕",
        "thoughtful":  "🤔",
    }
    return MOOD_EMOJIS.get(mood.lower(), "🎬")


def suggest_by_mood(mood: str) -> list[str]:
    """
    Suggest genre keywords for a given mood.

    Returns:
        List of genre/keyword strings for search or filtering
    """
    MOOD_TO_GENRES: dict[str, list[str]] = {
        "excited":     ["action", "thriller", "adventure"],
        "relaxed":     ["slice of life", "animation", "comedy"],
        "emotional":   ["drama", "family", "romance"],
        "adventurous": ["adventure", "fantasy", "sci-fi"],
        "scary":       ["horror", "thriller", "mystery"],
        "funny":       ["comedy", "animation", "family"],
        "romantic":    ["romance", "drama"],
        "thoughtful":  ["sci-fi", "drama", "documentary"],
    }
    return MOOD_TO_GENRES.get(mood.lower(), [])
