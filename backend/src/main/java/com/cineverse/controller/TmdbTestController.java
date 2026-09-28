package com.cineverse.controller;

import com.cineverse.dto.ApiResponse;
import com.cineverse.service.TmdbService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * TmdbTestController — Smoke-test / legacy controller for TMDB integration.
 * Kept for backward-compatibility; SearchController is the canonical API.
 *
 * Fixed by: Koushik-31368 (updated to use searchMovies() from refactored TmdbService)
 */
@RestController
@RequestMapping("/api/tmdb")
public class TmdbTestController {

    private final TmdbService tmdbService;

    public TmdbTestController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    /**
     * GET /api/tmdb/search?title={title}
     * Returns the first matching TMDB result for the given title.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TmdbService.MediaResult>>> search(
        @RequestParam String title
    ) {
        if (title == null || title.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Parameter 'title' is required"));
        }
        List<TmdbService.MediaResult> results = tmdbService.searchMovies(title.trim());
        return ResponseEntity.ok(ApiResponse.success(results,
            results.isEmpty() ? "No results for: " + title : results.size() + " results found"));
    }
}
