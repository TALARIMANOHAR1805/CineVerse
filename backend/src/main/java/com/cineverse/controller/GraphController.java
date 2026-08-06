package com.cineverse.controller;

import com.cineverse.service.GraphPathService;
import com.cineverse.service.GraphService;
import com.cineverse.service.TmdbService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * GraphController — Phase 3 + Phase B
 *
 * GET  /api/graph/related/movie/{tmdbId}
 *   1-hop: movies connected via shared actors / franchise siblings.
 *
 * GET  /api/graph/path?from={id}&to={id}
 *   Six-degrees: shortest-path traversal between any two Movie/Person nodes.
 *   Uses Neo4j shortestPath() up to 6 hops via ACTED_IN and PART_OF.
 *   from/to accept: tmdbId for movies, or person name (case-insensitive).
 *
 * POST /api/graph/ingest/movie/{tmdbId}
 *   Manually trigger async ingest of a movie into the graph.
 */
@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final GraphService     graphService;
    private final TmdbService      tmdbService;
    private final GraphPathService pathService;

    public GraphController(GraphService graphService,
                           TmdbService tmdbService,
                           GraphPathService pathService) {
        this.graphService = graphService;
        this.tmdbService  = tmdbService;
        this.pathService  = pathService;
    }

    /** Get graph-connected movies for a given TMDB movie id (1-hop). */
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
     * Six-degrees shortest-path finder.
     *
     * GET /api/graph/path?from={fromId}&to={toId}
     *
     * Both `from` and `to` can be:
     *   • a TMDB movie id  (e.g. "27205" for Inception)
     *   • a person name   (e.g. "Cillian Murphy")
     *
     * Returns PathResult with:
     *   found=false + empty lists  → no connection within 6 hops (not a 500)
     *   found=true  + nodes/rels   → ordered path for step-by-step animation
     *
     * The 'nodes' and 'relationships' arrays interleave for the frontend:
     *   nodes[0] --rels[0]--> nodes[1] --rels[1]--> nodes[2] ...
     */
    @GetMapping("/path")
    public GraphPathService.PathResult shortestPath(
            @RequestParam String from,
            @RequestParam String to) {

        if (from == null || from.isBlank() || to == null || to.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Both 'from' and 'to' query parameters are required");
        }
        try {
            return pathService.findShortestPath(from.strip(), to.strip());
        } catch (Exception e) {
            System.err.println("[GraphController] path error from='" + from + "' to='" + to + "': " + e.getMessage());
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
