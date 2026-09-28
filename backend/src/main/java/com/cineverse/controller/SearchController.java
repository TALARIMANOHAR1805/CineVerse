package com.cineverse.controller;

import com.cineverse.dto.ApiResponse;
import com.cineverse.service.TmdbService;
import com.cineverse.service.JikanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * SearchController v2 — Unified search across movies (TMDB) and anime (Jikan).
 *
 * Endpoints:
 *   GET /api/search?q={query}&type={all|movie|anime}
 *   GET /api/search/movies?q={query}
 *   GET /api/search/anime?q={query}
 *
 * Improved by: Koushik-31368
 */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final TmdbService tmdbService;
    private final JikanService jikanService;

    public SearchController(TmdbService tmdbService, JikanService jikanService) {
        this.tmdbService  = tmdbService;
        this.jikanService = jikanService;
    }

    /**
     * Unified search — returns movies + anime depending on the type filter.
     *
     * @param q    The search query (required, min 1 char)
     * @param type Filter: "all", "movie", or "anime" (default: "all")
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
        @RequestParam String q,
        @RequestParam(defaultValue = "all") String type
    ) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Query parameter 'q' is required and cannot be blank"));
        }

        List<TmdbService.MediaResult> movies = List.of();
        List<JikanService.AnimeResult> anime  = List.of();

        if ("all".equalsIgnoreCase(type) || "movie".equalsIgnoreCase(type)) {
            movies = tmdbService.searchMovies(q.trim());
        }
        if ("all".equalsIgnoreCase(type) || "anime".equalsIgnoreCase(type)) {
            anime = jikanService.searchAnime(q.trim());
        }

        Map<String, Object> payload = Map.of(
            "query",  q,
            "type",   type,
            "movies", movies,
            "anime",  anime,
            "total",  movies.size() + anime.size()
        );

        return ResponseEntity.ok(ApiResponse.success(payload));
    }

    /**
     * Movie-only search shortcut.
     */
    @GetMapping("/movies")
    public ResponseEntity<ApiResponse<List<TmdbService.MediaResult>>> searchMovies(
        @RequestParam String q
    ) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Query parameter 'q' is required"));
        }
        List<TmdbService.MediaResult> results = tmdbService.searchMovies(q.trim());
        return ResponseEntity.ok(ApiResponse.success(results,
            results.isEmpty() ? "No movies found" : results.size() + " movies found"));
    }

    /**
     * Anime-only search shortcut.
     */
    @GetMapping("/anime")
    public ResponseEntity<ApiResponse<List<JikanService.AnimeResult>>> searchAnime(
        @RequestParam String q
    ) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Query parameter 'q' is required"));
        }
        List<JikanService.AnimeResult> results = jikanService.searchAnime(q.trim());
        return ResponseEntity.ok(ApiResponse.success(results,
            results.isEmpty() ? "No anime found" : results.size() + " anime found"));
    }
}
