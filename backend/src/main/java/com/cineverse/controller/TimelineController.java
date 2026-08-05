package com.cineverse.controller;

import com.cineverse.service.TimelineService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * TimelineController — Phase 2
 *
 * GET /api/timeline/movie/{tmdbId}  → franchise/collection timeline for a movie
 * GET /api/timeline/anime/{malId}   → watch-order timeline for an anime series
 */
@RestController
@RequestMapping("/api/timeline")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping("/movie/{tmdbId}")
    public TimelineService.TimelineResponse movieTimeline(@PathVariable int tmdbId) {
        TimelineService.TimelineResponse result = timelineService.getMovieTimeline(tmdbId);
        if (result == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found: " + tmdbId);
        return result;
    }

    @GetMapping("/anime/{malId}")
    public TimelineService.TimelineResponse animeTimeline(@PathVariable int malId) {
        TimelineService.TimelineResponse result = timelineService.getAnimeTimeline(malId);
        if (result == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Anime not found: " + malId);
        return result;
    }
}
