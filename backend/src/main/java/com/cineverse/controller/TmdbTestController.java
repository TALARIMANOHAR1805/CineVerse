package com.cineverse.controller;

import com.cineverse.service.TmdbService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Legacy Phase-0 smoke-test controller for TMDB integration.
 * Kept for backward-compat; SearchController is the canonical search API.
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
        try {
            return tmdbService.searchMovie(title)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND, "No TMDB results for: " + title));
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            System.err.println("[TmdbTestController] search error for title='" + title + "': " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "TMDB API unavailable — try again later");
        }
    }
}
