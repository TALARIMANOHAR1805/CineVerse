package com.cineverse.repository;

/**
 * Projection for similarity recommendation results.
 * Extends MovieGraphProjection with a numeric similarity score.
 */
public interface SimilarityProjection {
    String getTmdbId();
    String getTitle();
    String getYear();
    String getPosterUrl();
    Double getRating();
    java.util.List<String> getSharedActors();
    Long getScore();          // weighted similarity score (higher = more similar)
}
