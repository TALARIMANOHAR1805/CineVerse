"""
test_mood_analyzer.py — Unit tests for mood_analyzer module

Tests:
 - analyze_mood returns correct mood categories
 - get_dominant_mood identifies primary emotion
 - get_mood_emoji returns string
 - suggest_by_mood returns genre lists
 - Edge cases: empty text, unknown mood

Author: Koushik-31368
"""
import pytest
from app.mood_analyzer import analyze_mood, get_dominant_mood, get_mood_emoji, suggest_by_mood


class TestAnalyzeMood:
    def test_returns_dict(self):
        result = analyze_mood("scary horror ghost dark")
        assert isinstance(result, dict)

    def test_scary_mood_detected(self):
        result = analyze_mood("ghost monster horror dark supernatural fear terror")
        assert "scary" in result
        assert result["scary"] > 0.0

    def test_funny_mood_detected(self):
        result = analyze_mood("comedy funny laugh humor hilarious joke witty")
        assert "funny" in result

    def test_romantic_mood_detected(self):
        result = analyze_mood("romance love relationship couple confession heart")
        assert "romantic" in result

    def test_excited_mood_detected(self):
        result = analyze_mood("intense action epic battle fight adrenaline power")
        assert "excited" in result

    def test_empty_text_returns_empty(self):
        result = analyze_mood("")
        assert result == {}

    def test_scores_between_0_and_1(self):
        result = analyze_mood("emotional sad cry touching family loss grief")
        for score in result.values():
            assert 0.0 <= score <= 1.0

    def test_thoughtful_mood_detected(self):
        result = analyze_mood("philosophy meaning existential human consciousness")
        assert "thoughtful" in result


class TestGetDominantMood:
    def test_returns_string_or_none(self):
        mood = get_dominant_mood("action fight battle intense")
        assert mood is None or isinstance(mood, str)

    def test_dominant_is_excited_for_action(self):
        mood = get_dominant_mood("intense action epic battle fight adrenaline tournament power chase")
        assert mood == "excited"

    def test_empty_text_returns_none(self):
        mood = get_dominant_mood("")
        assert mood is None

    def test_dominant_scary_for_horror(self):
        mood = get_dominant_mood("ghost scary monster dark supernatural haunted demon cursed")
        assert mood == "scary"


class TestGetMoodEmoji:
    def test_returns_string(self):
        emoji = get_mood_emoji("excited")
        assert isinstance(emoji, str)

    def test_known_moods_have_emojis(self):
        for mood in ["excited", "relaxed", "emotional", "adventurous", "scary", "funny", "romantic", "thoughtful"]:
            emoji = get_mood_emoji(mood)
            assert emoji != ""

    def test_unknown_mood_returns_default(self):
        emoji = get_mood_emoji("unknownmood")
        assert emoji == "🎬"

    def test_case_insensitive(self):
        assert get_mood_emoji("EXCITED") == get_mood_emoji("excited")


class TestSuggestByMood:
    def test_returns_list(self):
        result = suggest_by_mood("funny")
        assert isinstance(result, list)

    def test_funny_suggests_comedy(self):
        result = suggest_by_mood("funny")
        assert "comedy" in result

    def test_scary_suggests_horror(self):
        result = suggest_by_mood("scary")
        assert "horror" in result

    def test_unknown_mood_returns_empty(self):
        result = suggest_by_mood("nonexistentmood")
        assert result == []

    def test_romantic_suggests_romance(self):
        result = suggest_by_mood("romantic")
        assert "romance" in result
