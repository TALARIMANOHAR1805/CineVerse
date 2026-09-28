"""
CineVerse ML — Additional unit tests for cache and schemas.

Run with: pytest tests/ -v

Added by: Koushik-31368
"""

import pytest
import time
from app.cache import MLCache


# ──────────────────────────────────────────────────────────────
# MLCache Tests
# ──────────────────────────────────────────────────────────────

class TestMLCache:
    """Unit tests for the MLCache in-memory TTL store."""

    def setup_method(self):
        self.cache = MLCache(default_ttl=60)

    def test_set_and_get(self):
        """Cache should return the stored value."""
        self.cache.set("key1", {"score": 0.95})
        result = self.cache.get("key1")
        assert result == {"score": 0.95}

    def test_miss_returns_none(self):
        """Cache miss should return None."""
        assert self.cache.get("nonexistent") is None

    def test_expired_entry_returns_none(self):
        """Entries past their TTL should not be returned."""
        self.cache.set("short", "value", ttl=0.01)
        time.sleep(0.05)
        assert self.cache.get("short") is None

    def test_delete_removes_entry(self):
        """Deleted entries should not be retrievable."""
        self.cache.set("del_key", "data")
        self.cache.delete("del_key")
        assert self.cache.get("del_key") is None

    def test_clear_removes_all(self):
        """clear() should remove all entries and return count."""
        self.cache.set("a", 1)
        self.cache.set("b", 2)
        removed = self.cache.clear()
        assert removed == 2
        assert self.cache.size() == 0

    def test_size_excludes_expired(self):
        """size() should not count expired entries."""
        self.cache.set("live",    "ok",   ttl=60)
        self.cache.set("expired", "gone", ttl=0.01)
        time.sleep(0.05)
        assert self.cache.size() == 1

    def test_evict_expired_returns_count(self):
        """evict_expired() should return the number of entries removed."""
        self.cache.set("x", 1, ttl=0.01)
        self.cache.set("y", 2, ttl=0.01)
        time.sleep(0.05)
        evicted = self.cache.evict_expired()
        assert evicted == 2


# ──────────────────────────────────────────────────────────────
# Schema Validation Tests
# ──────────────────────────────────────────────────────────────

class TestSchemas:
    """Unit tests for Pydantic schema models."""

    def test_poster_request_valid_url(self):
        """PosterAnalyzeRequest should accept valid http URL."""
        from app.schemas import PosterAnalyzeRequest
        req = PosterAnalyzeRequest(posterUrl="https://image.tmdb.org/t/p/w500/abc.jpg")
        assert req.posterUrl.startswith("https://")

    def test_poster_request_invalid_url(self):
        """PosterAnalyzeRequest should reject non-HTTP URLs."""
        from pydantic import ValidationError
        from app.schemas import PosterAnalyzeRequest
        with pytest.raises(ValidationError):
            PosterAnalyzeRequest(posterUrl="ftp://invalid.url/image.jpg")

    def test_poster_response_model(self):
        """PosterAnalyzeResponse should serialise correctly."""
        from app.schemas import PosterAnalyzeResponse, ColourEntry
        resp = PosterAnalyzeResponse(
            dominantColor="#f72585",
            palette=[ColourEntry(hex="#f72585", rgb=[247, 37, 133], percentage=0.42)],
            posterUrl="https://example.com/poster.jpg"
        )
        data = resp.model_dump()
        assert data["dominantColor"] == "#f72585"
        assert len(data["palette"]) == 1

    def test_vibe_response_model(self):
        """VibeDiscoverResponse should default to empty results."""
        from app.schemas import VibeDiscoverResponse
        resp = VibeDiscoverResponse(vibe="dark")
        assert resp.total == 0
        assert resp.results == []
