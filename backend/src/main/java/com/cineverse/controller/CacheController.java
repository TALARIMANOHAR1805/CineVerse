package com.cineverse.controller;

import com.cineverse.dto.ApiResponse;
import com.cineverse.service.CacheService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * CacheController — Admin endpoints for inspecting and managing the in-memory cache.
 *
 * Endpoints:
 *   GET  /api/admin/cache/stats   — returns current cache size
 *   POST /api/admin/cache/clear   — clears all cached entries
 *
 * Added by: Koushik-31368
 */
@RestController
@RequestMapping("/api/admin")
public class CacheController {

    private final CacheService cacheService;

    public CacheController(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    /**
     * GET /api/admin/cache/stats
     * Returns how many entries are currently alive in the in-memory cache.
     */
    @GetMapping("/cache/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cacheStats() {
        Map<String, Object> data = Map.of(
            "liveEntries", cacheService.size(),
            "description", "In-memory TTL cache for TMDB and Jikan API responses"
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * POST /api/admin/cache/clear
     * Clears all cached entries. Useful after updating API data or during debugging.
     */
    @PostMapping("/cache/clear")
    public ResponseEntity<ApiResponse<String>> clearCache() {
        cacheService.clear();
        return ResponseEntity.ok(ApiResponse.success("Cache cleared successfully"));
    }
}
