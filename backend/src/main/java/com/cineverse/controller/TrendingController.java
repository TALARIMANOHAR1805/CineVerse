package com.cineverse.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * TrendingController — /api/trending endpoints.
 *
 * GET /api/trending/movies?window=day|week&page=1
 * GET /api/trending/anime
 *
 * Author: Koushik-31368
 */
@RestController
@RequestMapping("/api/trending")
@CrossOrigin
public class TrendingController {

    /** Trending movies (day or week) */
    @GetMapping("/movies")
    public ResponseEntity<Map<String, Object>> trendingMovies(
            @RequestParam(defaultValue = "week") String window,
            @RequestParam(defaultValue = "1")    int    page) {

        if (!window.equals("day") && !window.equals("week")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "window must be 'day' or 'week'"
            ));
        }

        // Real impl would call TmdbServiceV2.getTrending(window, page)
        return ResponseEntity.ok(Map.of(
                "window", window,
                "page",   page,
                "data",   List.of(),
                "source", "tmdb-trending-stub"
        ));
    }

    /** Trending / top airing anime */
    @GetMapping("/anime")
    public ResponseEntity<Map<String, Object>> trendingAnime(
            @RequestParam(defaultValue = "airing") String filter,
            @RequestParam(defaultValue = "1")      int    page) {

        return ResponseEntity.ok(Map.of(
                "filter", filter,
                "page",   page,
                "data",   List.of(),
                "source", "jikan-trending-stub"
        ));
    }
}
