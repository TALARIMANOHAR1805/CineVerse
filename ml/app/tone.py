"""
tone.py — Phase E2: NLP Tone/Trope Tagging (keyword rule engine)

Design rationale:
  - Zero-shot transformers (bart-large-mnli) need ~1.5 GB RAM → NOT feasible on Render 512MB.
  - deberta-v3-small needs ~300 MB → borderline, too risky for free tier.
  - This keyword engine uses < 5 MB RAM, has zero cold-start latency, and
    produces meaningfully better tags than genre-only labels.

Approach:
  1. Tokenize the synopsis into lowercase words.
  2. Match against a curated ~200-keyword dictionary grouped by tone/trope.
  3. Also factor in TMDB genres (already available) for structural tags.
  4. Return a ranked list of tags (sorted by match count descending).

Tag categories:
  - Tone:  dark, uplifting, tense, whimsical, melancholic, intense, ...
  - Trope: heist, revenge, coming-of-age, redemption, fish-out-of-water, ...
  - Theme: family, identity, power, survival, love, loss, war, ...
"""

import re
from typing import List

# ── Tag dictionary ─────────────────────────────────────────────────────────────
# Each entry: (tag_name, [keywords_that_trigger_it], weight)
# Weight 2 = strong signal, 1 = weak/supporting signal

TAG_RULES: list[tuple[str, list[str], int]] = [
    # TONES
    ("dark",           ["dark", "brutal", "grim", "sinister", "disturbing", "horrifying",
                        "nightmare", "shadow", "corrupt", "bleak", "gritty"], 2),
    ("uplifting",      ["inspire", "inspiring", "hope", "hopeful", "triumph", "overcome",
                        "redemption", "heartwarming", "courage", "persevere", "rise"], 2),
    ("tense",          ["tension", "suspense", "thriller", "edge", "nerve-wracking",
                        "race against", "hunted", "chase", "paranoia", "paranoid"], 2),
    ("whimsical",      ["whimsical", "fantastical", "magical", "enchanting", "fairy",
                        "wonder", "imagination", "playful", "quirky", "colorful"], 2),
    ("melancholic",    ["grief", "loss", "mourning", "lonely", "loneliness", "tragic",
                        "tragedy", "heartbreak", "sorrow", "regret", "nostalgia"], 2),
    ("intense",        ["intense", "explosive", "relentless", "brutal", "combat",
                        "violence", "fierce", "adrenaline", "extreme"], 1),
    ("humorous",       ["comedy", "funny", "hilarious", "laugh", "comic", "witty",
                        "satire", "sarcastic", "parody", "absurd", "ridiculous"], 2),
    ("romantic",       ["love", "romance", "fall in love", "relationship", "heart",
                        "couple", "passion", "desire", "attraction", "affair"], 2),
    ("mysterious",     ["mystery", "mysterious", "enigmatic", "secret", "hidden",
                        "uncovered", "unknown", "puzzle", "riddle", "clue"], 2),
    ("epic",           ["epic", "grand", "sprawling", "massive", "legendary",
                        "war", "battle", "kingdom", "empire", "destiny"], 2),

    # TROPES
    ("heist",          ["heist", "robbery", "steal", "stolen", "vault", "scheme",
                        "con", "con man", "scam", "caper", "theft"], 3),
    ("revenge",        ["revenge", "vengeance", "avenge", "retaliation", "payback",
                        "vendetta", "retribution"], 3),
    ("coming-of-age",  ["young", "teenager", "adolescent", "grow up", "growing up",
                        "coming of age", "childhood", "school", "first love", "discover identity"], 3),
    ("redemption",     ["redemption", "redeem", "second chance", "atone", "forgiveness",
                        "guilt", "make amends", "past mistakes"], 3),
    ("anti-hero",      ["anti-hero", "antihero", "morally grey", "morally ambiguous",
                        "outlaw", "villain protagonist", "criminal", "vigilante"], 3),
    ("fish-out-of-water", ["unfamiliar", "new world", "stranger", "outsider", "adapt",
                           "foreign", "displaced", "lost", "out of place"], 2),
    ("buddy",          ["unlikely pair", "unlikely duo", "partnership", "odd couple",
                        "two strangers", "forced together", "buddy"], 2),
    ("underdog",       ["underdog", "against the odds", "impossible odds", "no one believed",
                        "unlikely hero", "overlooked", "unlikely champion"], 3),
    ("time-travel",    ["time travel", "time machine", "past", "future", "paradox",
                        "timeline", "alternate timeline", "time loop"], 3),
    ("apocalyptic",    ["apocalypse", "apocalyptic", "end of the world", "extinction",
                        "collapse of civilization", "aftermath", "post-apocalyptic",
                        "survivors", "wasteland"], 3),
    ("spy",            ["spy", "agent", "intelligence", "espionage", "covert",
                        "mission", "classified", "double agent", "undercover"], 3),
    ("survival",       ["survival", "survive", "stranded", "alone", "wilderness",
                        "fight to survive", "isolation", "desperate"], 2),
    ("twisty",         ["twist", "unexpected", "shocking revelation", "surprise ending",
                        "plot twist", "betrayal", "not what it seems", "double cross"], 3),
    ("psychological",  ["psychological", "mind", "manipulation", "gaslighting", "delusion",
                        "hallucination", "reality", "identity crisis", "paranoia",
                        "obsession", "psyche"], 3),

    # THEMES
    ("family",         ["family", "father", "mother", "son", "daughter", "sibling",
                        "parent", "brother", "sister", "home"], 1),
    ("identity",       ["identity", "who am i", "self-discovery", "true self",
                        "belonging", "purpose", "worth"], 2),
    ("power",          ["power", "corruption", "control", "authority", "political",
                        "government", "totalitarian", "regime", "manipulation"], 2),
    ("war",            ["war", "warfare", "battlefield", "soldier", "military",
                        "conflict", "troops", "veteran", "combat"], 2),
    ("technology",     ["technology", "artificial intelligence", "robot", "android",
                        "cyborg", "hacker", "digital", "virtual reality", "simulation"], 2),
    ("nature",         ["nature", "wilderness", "environment", "planet", "ecosystem",
                        "climate", "animal", "forest", "ocean"], 1),
    ("class",          ["class", "wealth", "poverty", "inequality", "social class",
                        "elite", "underclass", "privilege", "disparity"], 2),
]

# Genre → structural tags mapping
GENRE_TAGS: dict[str, list[str]] = {
    "Action":          ["action-packed"],
    "Animation":       ["animated"],
    "Comedy":          ["humorous"],
    "Crime":           ["crime-thriller"],
    "Documentary":     ["documentary"],
    "Drama":           ["dramatic"],
    "Fantasy":         ["fantasy"],
    "Horror":          ["horror"],
    "Mystery":         ["mysterious"],
    "Romance":         ["romantic"],
    "Science Fiction": ["sci-fi"],
    "Thriller":        ["tense"],
    "Western":         ["western"],
    "Adventure":       ["adventurous"],
    "Family":          ["family-friendly"],
    "History":         ["historical"],
    "Music":           ["musical"],
    "War":             ["war"],
}


def tag_synopsis(synopsis: str, genres: list[str]) -> list[dict]:
    """
    Analyse a synopsis and list of genres, return ranked tone/trope tags.

    Returns list of {tag, score, matchedKeywords} sorted by score desc.
    """
    if not synopsis:
        return _genre_tags_only(genres)

    text = synopsis.lower()
    # Tokenize: split on word boundaries, keep phrases up to 3 words
    words = re.findall(r'\b\w+\b', text)
    word_set = set(words)

    tag_scores: dict[str, dict] = {}

    for tag_name, keywords, weight in TAG_RULES:
        matched = []
        for kw in keywords:
            kw_lower = kw.lower()
            if " " in kw_lower:
                # Phrase match
                if kw_lower in text:
                    matched.append(kw)
            else:
                # Word match
                if kw_lower in word_set:
                    matched.append(kw)

        if matched:
            score = len(matched) * weight
            if tag_name not in tag_scores or tag_scores[tag_name]["score"] < score:
                tag_scores[tag_name] = {"tag": tag_name, "score": score, "matchedKeywords": matched}

    # Add genre-based structural tags (lower priority)
    for genre in genres:
        genre_tag_list = GENRE_TAGS.get(genre, [])
        for gt in genre_tag_list:
            if gt not in tag_scores:
                tag_scores[gt] = {"tag": gt, "score": 1, "matchedKeywords": [f"genre:{genre}"]}

    results = list(tag_scores.values())
    results.sort(key=lambda x: x["score"], reverse=True)

    # Return top 8 tags max
    return results[:8]


def _genre_tags_only(genres: list[str]) -> list[dict]:
    """Fallback when no synopsis is available."""
    tags = []
    for genre in genres:
        for gt in GENRE_TAGS.get(genre, []):
            tags.append({"tag": gt, "score": 1, "matchedKeywords": [f"genre:{genre}"]})
    return tags
