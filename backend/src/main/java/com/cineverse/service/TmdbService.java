package com.cineverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TMDB API Client — Phase 1 + Phase 2
 * Full multi-result search with poster, rating, genres, and collectionId.
 */
@Service
public class TmdbService {

    private static final String IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    private final RestClient restClient;
    private final String apiKey;

    public TmdbService(
            RestClient.Builder restClientBuilder,
            @Value("${tmdb.api.base-url}") String baseUrl,
            @Value("${tmdb.api.key}") String apiKey) {

        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    /** Search movies — returns up to 20 results. */
    @SuppressWarnings("unchecked")
    public List<MediaResult> searchMovies(String query) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri(u -> u.path("/search/movie")
                            .queryParam("query", query)
                            .queryParam("api_key", apiKey)
                            .queryParam("include_adult", false)
                            .build())
                    .retrieve()
                    .body(Map.class);

            if (response == null) return Collections.emptyList();

            List<Map<String, Object>> results =
                    (List<Map<String, Object>>) response.getOrDefault("results", Collections.emptyList());

            return results.stream()
                    .limit(20)
                    .map(r -> toMediaResult(r, "movie"))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("TMDB API search failed: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /** Get a single movie by TMDB id — includes genres + collectionId. */
    @SuppressWarnings("unchecked")
    public MediaResult getMovieById(int tmdbId) {
        try {
            Map<String, Object> r = restClient.get()
                    .uri(u -> u.path("/movie/{id}")
                            .queryParam("api_key", apiKey)
                            .build(tmdbId))
                    .retrieve()
                    .body(Map.class);

            if (r == null) return null;

            List<Map<String, Object>> genreMaps =
                    (List<Map<String, Object>>) r.getOrDefault("genres", Collections.emptyList());
            List<String> genres = genreMaps.stream()
                    .map(g -> (String) g.get("name"))
                    .collect(Collectors.toList());

            // Extract collection id for timeline (null if standalone film)
            Map<String, Object> collection =
                    (Map<String, Object>) r.get("belongs_to_collection");
            Integer collectionId = null;
            if (collection != null && collection.get("id") instanceof Number n) {
                collectionId = n.intValue();
            }

            return new MediaResult(
                    String.valueOf(r.get("id")),
                    (String) r.getOrDefault("title", ""),
                    "movie",
                    toYear((String) r.get("release_date")),
                    safeString(r.get("overview")),
                    toImageUrl((String) r.get("poster_path")),
                    toRating(r.get("vote_average")),
                    genres,
                    collectionId
            );
        } catch (Exception e) {
            System.err.println("TMDB getMovieById failed for id=" + tmdbId + ": " + e.getMessage());
            return null;
        }
    }

    /** Fetch all parts of a TMDB collection sorted by release date. */
    @SuppressWarnings("unchecked")
    public CollectionResult getCollection(int collectionId) {
        try {
            Map<String, Object> r = restClient.get()
                    .uri(u -> u.path("/collection/{id}")
                            .queryParam("api_key", apiKey)
                            .build(collectionId))
                    .retrieve()
                    .body(Map.class);

            if (r == null) return null;

            String name = safeString(r.get("name"));
            List<Map<String, Object>> parts =
                    (List<Map<String, Object>>) r.getOrDefault("parts", Collections.emptyList());

            List<MediaResult> entries = parts.stream()
                    .sorted((a, b) -> {
                        String da = safeString(a.get("release_date"));
                        String db = safeString(b.get("release_date"));
                        return da.compareTo(db);
                    })
                    .map(p -> toMediaResult(p, "movie"))
                    .collect(Collectors.toList());

            return new CollectionResult(String.valueOf(collectionId), name, entries);
        } catch (Exception e) {
            System.err.println("TMDB getCollection failed for id=" + collectionId + ": " + e.getMessage());
            return null;
        }
    }

    /** Phase 3 — Fetch top cast members for graph ingestion. */
    @SuppressWarnings("unchecked")
    public List<CastMember> getMovieCredits(int tmdbId) {
        try {
            Map<String, Object> r = restClient.get()
                    .uri(u -> u.path("/movie/{id}/credits")
                            .queryParam("api_key", apiKey)
                            .build(tmdbId))
                    .retrieve()
                    .body(Map.class);

            if (r == null) return Collections.emptyList();

            List<Map<String, Object>> cast =
                    (List<Map<String, Object>>) r.getOrDefault("cast", Collections.emptyList());

            return cast.stream()
                    .limit(10)   // top-billed only to keep graph lean
                    .map(c -> new CastMember(
                            safeString(c.get("name")),
                            safeString(c.get("character"))
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("TMDB getMovieCredits failed for id=" + tmdbId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /** A single cast member from TMDB credits. */
    public record CastMember(String name, String character) {}

    // ── Helpers ────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private MediaResult toMediaResult(Map<String, Object> r, String type) {
        return new MediaResult(
                String.valueOf(r.get("id")),
                safeString(r.getOrDefault("title", r.get("name"))),
                type,
                toYear((String) r.get("release_date")),
                safeString(r.get("overview")),
                toImageUrl((String) r.get("poster_path")),
                toRating(r.get("vote_average")),
                Collections.emptyList(), // search endpoint doesn't return genre names
                null                     // collectionId unknown from search results
        );
    }

    private String toImageUrl(String path) {
        return (path != null && !path.isEmpty()) ? IMAGE_BASE + path : null;
    }

    private String toYear(String date) {
        return (date != null && date.length() >= 4) ? date.substring(0, 4) : "—";
    }

    private double toRating(Object v) {
        if (v instanceof Number n) return Math.round(n.doubleValue() * 10.0) / 10.0;
        return 0.0;
    }

    private String safeString(Object v) {
        return v instanceof String s ? s : "";
    }

    // ── DTOs ───────────────────────────────────────────────────

    /**
     * Unified DTO for movies and anime.
     * collectionId is non-null only for movies that belong to a TMDB collection.
     */
    public record MediaResult(
            String id,
            String title,
            String type,
            String year,
            String synopsis,
            String posterUrl,
            double rating,
            List<String> genres,
            Integer collectionId   // Phase 2: for timeline lookup (null = standalone)
    ) {}

    /** A TMDB collection (e.g. "Iron Man Collection") with its ordered parts. */
    public record CollectionResult(
            String id,
            String name,
            List<MediaResult> parts
    ) {}

    /** Keep old record for backward compat with TmdbTestController */
    public record MovieSearchResult(String title, String year, String synopsis) {}

    public java.util.Optional<MovieSearchResult> searchMovie(String title) {
        List<MediaResult> results = searchMovies(title);
        if (results.isEmpty()) return java.util.Optional.empty();
        MediaResult r = results.get(0);
        return java.util.Optional.of(new MovieSearchResult(r.title(), r.year(), r.synopsis()));
    }
}
