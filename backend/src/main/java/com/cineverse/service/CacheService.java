package com.cineverse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * CacheService — Simple in-memory TTL cache for API responses.
 * Reduces redundant calls to TMDB and Jikan APIs.
 *
 * This is a lightweight alternative to a full Redis/Caffeine setup,
 * suitable for development and small deployments.
 *
 * Added by: Koushik-31368
 */
@Service
public class CacheService {

    private static final Logger log = LoggerFactory.getLogger(CacheService.class);

    private record CacheEntry(Object value, long expiresAt) {
        boolean isExpired() { return System.currentTimeMillis() > expiresAt; }
    }

    private final ConcurrentHashMap<String, CacheEntry> store = new ConcurrentHashMap<>();

    // Default TTL: 10 minutes
    private static final long DEFAULT_TTL_MS = TimeUnit.MINUTES.toMillis(10);

    /**
     * Put a value in the cache with default TTL.
     *
     * @param key   Cache key (e.g. "search:movie:inception")
     * @param value Object to cache
     */
    public void put(String key, Object value) {
        put(key, value, DEFAULT_TTL_MS);
    }

    /**
     * Put a value in the cache with a custom TTL.
     *
     * @param key   Cache key
     * @param value Object to cache
     * @param ttlMs Time-to-live in milliseconds
     */
    public void put(String key, Object value, long ttlMs) {
        store.put(key, new CacheEntry(value, System.currentTimeMillis() + ttlMs));
        log.debug("Cache PUT: {} (TTL {}ms)", key, ttlMs);
    }

    /**
     * Retrieve a value from the cache.
     *
     * @param key Cache key
     * @return Cached value, or null if not found / expired
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String key) {
        CacheEntry entry = store.get(key);
        if (entry == null) {
            log.debug("Cache MISS: {}", key);
            return null;
        }
        if (entry.isExpired()) {
            store.remove(key);
            log.debug("Cache EXPIRED: {}", key);
            return null;
        }
        log.debug("Cache HIT: {}", key);
        return (T) entry.value();
    }

    /**
     * Check if a key exists and has not expired.
     */
    public boolean contains(String key) {
        return get(key) != null;
    }

    /**
     * Explicitly remove a key from the cache.
     */
    public void evict(String key) {
        store.remove(key);
        log.debug("Cache EVICT: {}", key);
    }

    /**
     * Clear all cached entries (useful for testing or manual refresh).
     */
    public void clear() {
        int size = store.size();
        store.clear();
        log.info("Cache CLEARED: removed {} entries", size);
    }

    /**
     * Remove all expired entries to free memory.
     * Should be called periodically via @Scheduled.
     */
    public void evictExpired() {
        int before = store.size();
        store.entrySet().removeIf(e -> e.getValue().isExpired());
        int removed = before - store.size();
        if (removed > 0) {
            log.debug("Cache cleanup: removed {} expired entries", removed);
        }
    }

    /**
     * Returns the number of live (non-expired) cache entries.
     */
    public int size() {
        store.entrySet().removeIf(e -> e.getValue().isExpired());
        return store.size();
    }
}
