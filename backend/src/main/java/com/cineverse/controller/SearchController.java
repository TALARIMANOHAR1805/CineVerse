package com.cineverse.controller;

import com.cineverse.service.JikanService;
import com.cineverse.service.TmdbService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * SearchController — Phase 1 unified search API.
 *
 * GET /api/search?q=inception&type=all   → both movies + anime
 * GET /api/search?q=naruto&type=anime    → anime only
 * GET /api/search?q=inception&type=movie → movies only
 * GET /api/movies/{id}                   → single movie detail
 * GET /api/anime/{id}                    → single anime detail
 */
@RestController
@RequestMapping("/api")
public class SearchController {

    private final TmdbService tmdbService;
    private final JikanService jikanService;

    public SearchController(TmdbService tmdbService, JikanService jikanService) {
        this.tmdbService = tmdbService;
        this.jikanService = jikanService;
    }

    /** Unified search — type: "all" | "movie" | "anime" */
    @GetMapping("/search")
    public Map<String, Object> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "all") String type) {

        List<TmdbService.MediaResult> movies = new ArrayList<>();
        List<TmdbService.MediaResult> anime  = new ArrayList<>();

        if ("all".equals(type) || "movie".equals(type)) {
            movies = tmdbService.searchMovies(q);
        }
        if ("all".equals(type) || "anime".equals(type)) {
            anime = jikanService.searchAnime(q);
        }

        return Map.of(
                "query",  q,
                "type",   type,
                "movies", movies,
                "anime",  anime,
                "total",  movies.size() + anime.size()
        );
    }

    /** Single movie detail by TMDB id */
    @GetMapping("/movies/{id}")
    public TmdbService.MediaResult movieDetail(@PathVariable int id) {
        TmdbService.MediaResult result = tmdbService.getMovieById(id);
        if (result == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + id);
        return result;
    }

    /** Single anime detail by MAL id */
    @GetMapping("/anime/{id}")
    public TmdbService.MediaResult animeDetail(@PathVariable int id) {
        TmdbService.MediaResult result = jikanService.getAnimeById(id);
        if (result == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime not found: " + id);
        return result;
    }
}
