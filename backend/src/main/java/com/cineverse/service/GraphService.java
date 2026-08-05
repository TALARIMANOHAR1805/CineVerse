package com.cineverse.service;

import com.cineverse.model.Movie;
import com.cineverse.model.Person;
import com.cineverse.repository.MovieGraphProjection;
import com.cineverse.repository.MovieRepository;
import com.cineverse.repository.PersonRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * GraphService — Phase 3: Neo4j Graph Discovery
 *
 * Responsibilities:
 *  1. Ingest a TMDB movie + its cast into the Neo4j graph (async, non-blocking)
 *  2. Query the graph for related movies via shared actors or same franchise
 */
@Service
public class GraphService {

    private final TmdbService    tmdbService;
    private final MovieRepository movieRepository;
    private final PersonRepository personRepository;

    public GraphService(TmdbService tmdbService,
                        MovieRepository movieRepository,
                        PersonRepository personRepository) {
        this.tmdbService      = tmdbService;
        this.movieRepository  = movieRepository;
        this.personRepository = personRepository;
    }

    // ── Ingest ─────────────────────────────────────────────────

    /**
     * Saves a movie and its top cast to Neo4j.
     * Called async so it never blocks the search/detail response.
     * Idempotent — skips if the movie is already in the graph.
     */
    @Async
    public void ingestMovie(TmdbService.MediaResult media) {
        try {
            String tmdbId = media.id();
            if (movieRepository.findByTmdbId(tmdbId).isPresent()) return;

            // Persist movie node
            Movie movie = new Movie();
            movie.setTmdbId(tmdbId);
            movie.setTitle(media.title());
            movie.setYear(media.year());
            movie.setPosterUrl(media.posterUrl());
            movie.setRating(media.rating());
            movieRepository.save(movie);

            // Fetch and persist cast
            List<TmdbService.CastMember> credits = tmdbService.getMovieCredits(
                    Integer.parseInt(tmdbId)
            );

            for (TmdbService.CastMember cast : credits) {
                // Find existing person or create new
                Optional<Person> existing = personRepository.findByName(cast.name());
                Person person = existing.orElseGet(() -> {
                    Person p = new Person(cast.name());
                    return personRepository.save(p);
                });
                movie.addCastMember(person, cast.character());
            }

            movieRepository.save(movie);   // save with ACTED_IN edges
        } catch (Exception e) {
            // Non-critical — graph enrichment failure should never break the API
            System.err.println("[GraphService] ingest failed for " + media.id() + ": " + e.getMessage());
        }
    }

    // ── Query ──────────────────────────────────────────────────

    /**
     * Find movies related to the given TMDB id via the Neo4j graph.
     * Combines shared-actor connections + franchise siblings.
     * Returns an empty list if the movie hasn't been ingested yet.
     */
    public GraphResult getRelated(String tmdbId) {
        List<MovieGraphProjection> actorLinks = Collections.emptyList();
        List<MovieGraphProjection> siblings   = Collections.emptyList();

        try {
            actorLinks = movieRepository.findRelatedBySharedActors(tmdbId);
        } catch (Exception e) {
            System.err.println("[GraphService] actor query failed: " + e.getMessage());
        }

        try {
            siblings = movieRepository.findFranchiseSiblings(tmdbId);
        } catch (Exception e) {
            System.err.println("[GraphService] franchise query failed: " + e.getMessage());
        }

        List<Connection> connections = actorLinks.stream()
                .map(p -> new Connection(
                        p.getTmdbId(),
                        p.getTitle(),
                        p.getYear(),
                        p.getPosterUrl(),
                        p.getRating() != null ? p.getRating() : 0.0,
                        "actor",
                        p.getSharedActors() != null ? p.getSharedActors() : Collections.emptyList()
                ))
                .collect(Collectors.toList());

        // Add franchise siblings not already present
        List<String> seen = connections.stream().map(Connection::tmdbId).collect(Collectors.toList());
        siblings.stream()
                .filter(s -> !seen.contains(s.getTmdbId()))
                .map(s -> new Connection(
                        s.getTmdbId(),
                        s.getTitle(),
                        s.getYear(),
                        s.getPosterUrl(),
                        s.getRating() != null ? s.getRating() : 0.0,
                        "franchise",
                        Collections.emptyList()
                ))
                .forEach(connections::add);

        return new GraphResult(tmdbId, connections, !connections.isEmpty());
    }

    // ── DTOs ───────────────────────────────────────────────────

    public record Connection(
            String tmdbId,
            String title,
            String year,
            String posterUrl,
            double rating,
            String connectionType,     // "actor" | "franchise"
            List<String> sharedActors  // names of actors linking the two movies
    ) {}

    public record GraphResult(
            String sourceTmdbId,
            List<Connection> connections,
            boolean hasGraph            // false if movie not yet ingested
    ) {}
}
