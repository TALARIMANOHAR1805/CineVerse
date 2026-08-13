package com.cineverse.repository;

import com.cineverse.model.Movie;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieRepository extends Neo4jRepository<Movie, Long> {

    /** Find a movie by its TMDB id (natural key). */
    Optional<Movie> findByTmdbId(String tmdbId);

    /**
     * Phase 3 — Graph discovery query.
     *
     * Finds movies connected to the target movie via shared actors.
     * Returns each related movie along with the names of the actors
     * that link them, ordered by the number of shared connections desc.
     */
    @Query("""
            MATCH (target:Movie {tmdbId: $tmdbId})<-[:ACTED_IN]-(actor:Person)-[:ACTED_IN]->(related:Movie)
            WHERE related.tmdbId <> $tmdbId
            WITH related, COLLECT(DISTINCT actor.name) AS sharedActors
            RETURN related {
                .tmdbId, .title, .year, .posterUrl, .rating,
                sharedActors: sharedActors,
                connectionCount: SIZE(sharedActors)
            }
            ORDER BY SIZE(sharedActors) DESC
            LIMIT 12
            """)
    List<MovieGraphProjection> findRelatedBySharedActors(String tmdbId);

    /**
     * Phase 3 — Franchise neighbours.
     * Other movies in the same franchise (for non-collection TMDB movies).
     */
    @Query("""
            MATCH (target:Movie {tmdbId: $tmdbId})-[:PART_OF]->(f:Franchise)<-[:PART_OF]-(sibling:Movie)
            WHERE sibling.tmdbId <> $tmdbId
            RETURN sibling {.tmdbId, .title, .year, .posterUrl, .rating}
            LIMIT 8
            """)
    List<MovieGraphProjection> findFranchiseSiblings(String tmdbId);

    /**
     * Phase C — Watch-order query.
     * Returns all movies in a franchise ordered by release year (ascending).
     */
    @Query("""
            MATCH (f:Franchise {name: $franchiseName})<-[:PART_OF]-(m:Movie)
            RETURN m {.tmdbId, .title, .year, .posterUrl, .rating,
                      sharedActors: null, connectionCount: null}
            ORDER BY m.year ASC
            """)
    List<MovieGraphProjection> findMoviesByFranchiseName(String franchiseName);

    /**
     * Phase E1 — Similarity recommendations.
     *
     * Scoring:
     *   +3 pts per shared actor (ACTED_IN overlap)
     *   +2 pts if same franchise (PART_OF overlap)
     *
     * Returns top 10 candidates ranked by score descending.
     * Excludes the source movie itself.
     */
    @Query("""
            MATCH (source:Movie {tmdbId: $tmdbId})<-[:ACTED_IN]-(a:Person)-[:ACTED_IN]->(candidate:Movie)
            WHERE candidate.tmdbId <> $tmdbId
            WITH source, candidate,
                 COUNT(DISTINCT a) AS sharedActorCount,
                 COLLECT(DISTINCT a.name) AS actorNames
            OPTIONAL MATCH (source)-[:PART_OF]->(f:Franchise)<-[:PART_OF]-(candidate)
            WITH candidate,
                 sharedActorCount,
                 actorNames,
                 CASE WHEN f IS NOT NULL THEN 2 ELSE 0 END AS franchiseBonus
            WITH candidate,
                 (sharedActorCount * 3 + franchiseBonus) AS score,
                 actorNames
            WHERE score > 0
            RETURN candidate {
                .tmdbId, .title, .year, .posterUrl, .rating,
                sharedActors: actorNames,
                score: score
            }
            ORDER BY score DESC
            LIMIT 10
            """)
    List<SimilarityProjection> findSimilar(String tmdbId);
}
