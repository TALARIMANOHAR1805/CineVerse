"""
CineVerse ML — In-memory cache for ML service responses.

Caches expensive operations like poster downloads and colour analysis
to avoid redundant HTTP calls for the same poster URL.

Added by: Koushik-31368
"""

import time
import threading
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


class MLCache:
    """
    Thread-safe TTL cache for the CineVerse ML service.

    Usage:
        cache = MLCache(default_ttl=600)
        cache.set("poster:http://...", result)
        result = cache.get("poster:http://...")
    """

    def __init__(self, default_ttl: float = 600.0):
        """
        Args:
            default_ttl: Default time-to-live in seconds (default: 10 minutes).
        """
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock  = threading.Lock()
        self.default_ttl = default_ttl

    def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        """
        Store a value in the cache.

        Args:
            key:   Cache key string.
            value: Any JSON-serialisable value.
            ttl:   Time-to-live in seconds (uses default_ttl if None).
        """
        expires_at = time.monotonic() + (ttl if ttl is not None else self.default_ttl)
        with self._lock:
            self._store[key] = (value, expires_at)
        logger.debug("Cache SET: %s (expires in %.0fs)", key, ttl or self.default_ttl)

    def get(self, key: str) -> Optional[Any]:
        """
        Retrieve a value from the cache.

        Returns:
            Cached value, or None if not found / expired.
        """
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expires_at = entry
            if time.monotonic() > expires_at:
                del self._store[key]
                logger.debug("Cache EXPIRED: %s", key)
                return None
        logger.debug("Cache HIT: %s", key)
        return value

    def delete(self, key: str) -> None:
        """Explicitly remove a key from the cache."""
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> int:
        """Clear all cached entries. Returns number of entries removed."""
        with self._lock:
            count = len(self._store)
            self._store.clear()
        logger.info("Cache cleared: %d entries removed", count)
        return count

    def evict_expired(self) -> int:
        """Remove all expired entries. Returns number evicted."""
        now = time.monotonic()
        with self._lock:
            expired = [k for k, (_, exp) in self._store.items() if now > exp]
            for k in expired:
                del self._store[k]
        if expired:
            logger.debug("Cache evicted %d expired entries", len(expired))
        return len(expired)

    def size(self) -> int:
        """Return the number of live (non-expired) cache entries."""
        self.evict_expired()
        with self._lock:
            return len(self._store)


# Global singleton cache for the ML service
ml_cache = MLCache(default_ttl=600)
