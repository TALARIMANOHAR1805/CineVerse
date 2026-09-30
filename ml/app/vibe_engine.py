"""
CineVerse ML — vibe_engine.py
Genre-based "vibe" detection and content recommendation scoring.

Vibe → genre/mood mapping used by DiscoverPage + /api/ml/discover/vibe endpoint.

Author: Koushik-31368
"""

from typing import List, Dict, Any

# ── Vibe definitions ──────────────────────────────────────────
VIBE_MAP: Dict[str, Dict[str, Any]] = {
    "dark": {
        "label":       "Dark & Intense",
        "emoji":       "🖤",
        "tmdb_genres": [27, 53, 80],          # Horror, Thriller, Crime
        "jikan_genres":[14, 37],              # Horror, Supernatural
        "keywords":    ["dystopia", "noir", "psychological"],
        "palette":     ["#1a0a2e", "#0d001a", "#ff2d78"],
    },
    "vibrant": {
        "label":       "Vibrant & Fun",
        "emoji":       "🌈",
        "tmdb_genres": [35, 16, 10751],       # Comedy, Animation, Family
        "jikan_genres":[4, 36],               # Comedy, Slice of Life
        "keywords":    ["colorful", "upbeat", "heartwarming"],
        "palette":     ["#ff6b35", "#ffd700", "#00d4ff"],
    },
    "moody": {
        "label":       "Moody & Atmospheric",
        "emoji":       "🌙",
        "tmdb_genres": [18, 9648, 10749],     # Drama, Mystery, Romance
        "jikan_genres":[8, 22],               # Drama, Romance
        "keywords":    ["atmospheric", "melancholic", "slow-burn"],
        "palette":     ["#2d1b69", "#11998e", "#38ef7d"],
    },
    "epic": {
        "label":       "Epic & Adventurous",
        "emoji":       "⚔️",
        "tmdb_genres": [28, 12, 14],          # Action, Adventure, Fantasy
        "jikan_genres":[1, 10],               # Action, Fantasy
        "keywords":    ["epic", "battle", "quest", "hero"],
        "palette":     ["#f12711", "#f5af19", "#0b3d91"],
    },
    "cozy": {
        "label":       "Cozy & Relaxing",
        "emoji":       "☕",
        "tmdb_genres": [35, 10749, 10751],    # Comedy, Romance, Family
        "jikan_genres":[36, 22],              # Slice of Life, Romance
        "keywords":    ["wholesome", "relaxing", "feel-good"],
        "palette":     ["#ee9ca7", "#ffdde1", "#f6d365"],
    },
    "mindblown": {
        "label":       "Mind-Bending",
        "emoji":       "🌀",
        "tmdb_genres": [878, 9648, 53],       # Sci-Fi, Mystery, Thriller
        "jikan_genres":[24, 37],              # Sci-Fi, Supernatural
        "keywords":    ["mindbending", "twist", "mystery", "sci-fi"],
        "palette":     ["#4facfe", "#00f2fe", "#7c6fff"],
    },
}

VALID_VIBES = list(VIBE_MAP.keys())


def get_vibe(vibe_name: str) -> Dict[str, Any]:
    """Return vibe config dict, or raise ValueError for unknown vibe."""
    if vibe_name not in VIBE_MAP:
        raise ValueError(f"Unknown vibe '{vibe_name}'. Valid: {VALID_VIBES}")
    return VIBE_MAP[vibe_name]


def score_content_for_vibe(item_genres: List[str], vibe_name: str) -> float:
    """
    Score how well a content item fits a given vibe.
    Returns 0.0 (no match) to 1.0 (perfect match).
    """
    vibe = get_vibe(vibe_name)
    if not item_genres:
        return 0.0

    # Keywords we look for in genre names (simple string overlap)
    vibe_genre_names = set(w.lower() for w in vibe.get("keywords", []))
    item_genre_names = set(g.lower() for g in item_genres)

    overlap = len(vibe_genre_names & item_genre_names)
    if overlap == 0:
        return 0.0

    return min(overlap / len(vibe_genre_names), 1.0) if vibe_genre_names else 0.0


def rank_by_vibe(items: List[Dict[str, Any]], vibe_name: str) -> List[Dict[str, Any]]:
    """Sort a list of items (each with 'genres' key) by vibe match score."""
    for item in items:
        item["_vibe_score"] = score_content_for_vibe(
            item.get("genres", []), vibe_name
        )
    return sorted(items, key=lambda x: x["_vibe_score"], reverse=True)
