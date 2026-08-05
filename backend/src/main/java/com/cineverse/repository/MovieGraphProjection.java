package com.cineverse.repository;

import org.springframework.data.neo4j.core.schema.Property;

import java.util.List;

/**
 * Spring Data Neo4j projection for graph query results.
 * Maps the map returned by @Query to a typed interface.
 */
public interface MovieGraphProjection {
    String getTmdbId();
    String getTitle();
    String getYear();
    String getPosterUrl();
    Double getRating();
    List<String> getSharedActors();   // null for franchise siblings
    Integer getConnectionCount();     // null for franchise siblings
}
