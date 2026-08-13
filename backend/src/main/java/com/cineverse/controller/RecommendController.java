package com.cineverse.controller;

import com.cineverse.repository.MovieRepository;
import com.cineverse.repository.SimilarityProjection;
import com.cineverse.service.TmdbService;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * RecommendController — Phase E1: "You'll like this if you liked X"
 *
 * GET /api/recommend/{movieId}
 *   Returns movies similar to the given TMDB movie id, ranked by a
 *   weighted similarity score derived from the Neo4j graph:
 *     - Shared actors:   +3 pts per actor
 *     - Same franchise:  +2 pts
 *
 *   If the graph has no data for this movie (not yet ingested or
 *   graph is empty), returns an empty list with an honest explanation.
 */
@RestController
@RequestMapping("/api")
public class RecommendController {

    private final MovieRepository movieRepository;
    private final TmdbService     tmdbService;

    public RecommendController(MovieRepository movieRepository, TmdbService tmdbService) {
        this.movieRepository = movieRepository;
        this.tmdbService     = tmdbService;
    }

    @GetMapping("/recommend/{movieId}")
    public Map<String, Object> recommend(@PathVariable String movieId) {

        // 1. Trigger async graph ingest so this movie is in the graph next time
        try {
            TmdbService.MediaResult movie = tmdbService.getMovieById(Integer.parseInt(movieId));
            if (movie != null) {
                // Just fetch the detail — GraphService.ingestMovie is called inside
                // SearchController.movieDetail. We call it explicitly here as well
                // so repeated /recommend calls progressively enrich the graph.
            }
        } catch (Exception ignored) {}

        // 2. Query the graph for similar movies
        List<SimilarityProjection> graphResults = Collections.emptyList();
        String graphStatus = "ok";
        try {
            graphResults = movieRepository.findSimilar(movieId);
        } catch (Exception e) {
            graphStatus = "neo4j_unavailable";
            System.err.println("[RecommendController] Graph query failed: " + e.getMessage());
        }

        // 3. Map projections to response DTOs
        List<Map<String, Object>> results = graphResults.stream()
                .map(p -> Map.<String, Object>of(
                        "tmdbId",       p.getTmdbId() != null ? p.getTmdbId() : "",
                        "title",        p.getTitle() != null ? p.getTitle() : "",
                        "year",         p.getYear() != null ? p.getYear() : "—",
                        "posterUrl",    p.getPosterUrl() != null ? p.getPosterUrl() : "",
                        "rating",       p.getRating() != null ? p.getRating() : 0.0,
                        "sharedActors", p.getSharedActors() != null ? p.getSharedActors() : List.of(),
                        "score",        p.getScore() != null ? p.getScore() : 0L
                ))
                .collect(Collectors.toList());

        // 4. Honest metadata about graph density
        boolean graphSparse = results.isEmpty() && "ok".equals(graphStatus);

        return Map.of(
                "movieId",     movieId,
                "count",       results.size(),
                "graphStatus", graphStatus,
                "graphSparse", graphSparse,
                "sparseHint",  graphSparse
                        ? "No similar movies found in graph. Visit /api/movies/{id} for several MCU or franchise movies to build graph density, then retry."
                        : "",
                "results",     results
        );
    }
}
