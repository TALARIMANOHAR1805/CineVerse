package com.cineverse.controller;

import com.cineverse.repository.MovieRepository;
import com.cineverse.repository.MovieGraphProjection;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * FranchiseController — Phase C
 *
 * GET /api/franchise/{name}/watch-order
 *
 * Returns the movies in a franchise ordered for viewing.
 *
 * ── Honest assessment of watch-order vs release-order ─────────────
 *
 * The current Neo4j schema has:
 *   (Movie)-[:PART_OF]->(Franchise)
 *
 * The PART_OF relationship has NO watch_order or position property.
 * The Movie node has: tmdbId, title, year, posterUrl, rating.
 *
 * Therefore: the ordering returned here is RELEASE ORDER (by year),
 * NOT a curated watch order. For franchises like the MCU or Star Wars
 * where release order != canonical watch order, this will be inaccurate.
 *
 * To support true curated watch order, the schema would need:
 *   (Movie)-[:PART_OF {watchOrder: 1, releaseOrder: 1}]->(Franchise)
 * and the ingest pipeline would need to populate those values from a
 * curated source (e.g., a manual mapping or a third-party watch-order API).
 *
 * ── Raw Cypher used ────────────────────────────────────────────────
 *
 *   MATCH (f:Franchise {name: $franchiseName})<-[:PART_OF]-(m:Movie)
 *   RETURN m {.tmdbId, .title, .year, .posterUrl, .rating}
 *   ORDER BY m.year ASC
 */
@RestController
@RequestMapping("/api/franchise")
public class FranchiseController {

    private final MovieRepository movieRepository;

    public FranchiseController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    /**
     * GET /api/franchise/{name}/watch-order
     *
     * @param name  Franchise name (URL-encoded), e.g. "Iron Man Collection"
     *              Must match the name stored in Neo4j exactly (from TMDB collection name).
     */
    @GetMapping("/{name}/watch-order")
    public WatchOrderResponse watchOrder(@PathVariable String name) {
        try {
            List<MovieGraphProjection> movies =
                    movieRepository.findMoviesByFranchiseName(name);

            if (movies.isEmpty()) {
                // Could be: franchise not ingested yet, or name mismatch
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Franchise '" + name + "' not found in graph. " +
                        "Ingest at least one movie from this franchise first via " +
                        "POST /api/graph/ingest/movie/{tmdbId}");
            }

            List<WatchEntry> entries = IntStream.range(0, movies.size())
                    .mapToObj(i -> {
                        MovieGraphProjection m = movies.get(i);
                        return new WatchEntry(
                                i + 1,
                                m.getTmdbId(),
                                m.getTitle(),
                                m.getYear(),
                                m.getPosterUrl(),
                                m.getRating() != null ? m.getRating() : 0.0
                        );
                    })
                    .collect(Collectors.toList());

            return new WatchOrderResponse(
                    name,
                    "release",      // orderType is honest: this IS release order
                    entries.size(),
                    entries,
                    // Transparent note about the ordering limitation
                    "Ordered by release year (ascending). No curated watch-order " +
                    "metadata exists in the current schema. To add franchise-specific " +
                    "viewing order, populate a watchOrder property on the PART_OF relationship."
            );

        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            System.err.println("[FranchiseController] watchOrder error for '" + name + "': " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Graph DB unavailable — try again later");
        }
    }

    // ── DTOs ───────────────────────────────────────────────────────

    public record WatchEntry(
            int position,
            String tmdbId,
            String title,
            String year,
            String posterUrl,
            double rating
    ) {}

    public record WatchOrderResponse(
            String franchiseName,
            String orderType,       // "release" — not "watch" until schema supports it
            int totalMovies,
            List<WatchEntry> movies,
            String note             // transparency note about ordering method
    ) {}
}
