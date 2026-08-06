package com.cineverse.controller;

import com.cineverse.service.GraphService;
import com.cineverse.service.TmdbService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * GraphController — Phase 3: Neo4j Graph Discovery
 *
 * GET /api/graph/related/movie/{tmdbId}
 *   Returns movies connected in the Neo4j graph via shared actors / franchise.
 *
 * POST /api/graph/ingest/movie/{tmdbId}
 *   Manually trigger ingest of a movie into the graph (async).
 *   The detail endpoint also auto-ingests, so this is for manual use.
 */
@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final GraphService graphService;
    private final TmdbService  tmdbService;

    public GraphController(GraphService graphService, TmdbService tmdbService) {
        this.graphService = graphService;
        this.tmdbService  = tmdbService;
    }

    /** Get graph-connected movies for a given TMDB movie id. */
    @GetMapping("/related/movie/{tmdbId}")
    public GraphService.GraphResult relatedMovies(@PathVariable String tmdbId) {
        try {
            return graphService.getRelated(tmdbId);
        } catch (Exception e) {
            System.err.println("[GraphController] relatedMovies error for id=" + tmdbId + ": " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Graph DB unavailable — try again later");
        }
    }

    /**
     * Trigger async ingestion of a movie into the Neo4j graph.
     * Returns immediately — ingest runs in background.
     */
    @PostMapping("/ingest/movie/{tmdbId}")
    public String ingestMovie(@PathVariable int tmdbId) {
        try {
            TmdbService.MediaResult movie = tmdbService.getMovieById(tmdbId);
            if (movie != null) {
                graphService.ingestMovie(movie);
                return "Ingest started for: " + movie.title();
            }
            return "Movie not found in TMDB";
        } catch (Exception e) {
            System.err.println("[GraphController] ingestMovie error for id=" + tmdbId + ": " + e.getMessage());
            return "TMDB API unavailable — could not fetch movie " + tmdbId;
        }
    }
}
