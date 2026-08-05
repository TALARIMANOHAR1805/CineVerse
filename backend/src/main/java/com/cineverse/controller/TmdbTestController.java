package com.cineverse.controller;

import com.cineverse.service.TmdbService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Temporary controller to test TMDB integration during Phase 0.
 */
@RestController
@RequestMapping("/api/tmdb")
public class TmdbTestController {

    private final TmdbService tmdbService;

    public TmdbTestController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @GetMapping("/search")
    public TmdbService.MovieSearchResult search(@RequestParam String title) {
        return tmdbService.searchMovie(title)
                .orElseThrow(() -> new RuntimeException("Movie not found!"));
    }
}
