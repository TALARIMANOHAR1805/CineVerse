package com.cineverse.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TMDB API Client — Phase 1
 * Full multi-result search with poster, rating, genres.
 */
@Service
public class TmdbService {

    private static final String IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
    private final RestClient restClient;
    private final String apiKey;

    public TmdbService(
            RestClient.Builder restClientBuilder,
            org.springframework.beans.factory.annotation.Value("${tmdb.api.base-url}") String baseUrl,
            org.springframework.beans.factory.annotation.Value("${tmdb.api.key}") String apiKey) {

        this.restClient = restClientBuilder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    /** Search movies — returns up to 20 results. */
    @SuppressWarnings("unchecked")
    public List<MediaResult> searchMovies(String query) {
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
    }

    /** Get a single movie by TMDB id (includes genres). */
    @SuppressWarnings("unchecked")
    public MediaResult getMovieById(int tmdbId) {
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

        return new MediaResult(
                String.valueOf(r.get("id")),
                (String) r.getOrDefault("title", ""),
                "movie",
                toYear((String) r.get("release_date")),
                safeString(r.get("overview")),
                toImageUrl((String) r.get("poster_path")),
                toRating(r.get("vote_average")),
                genres
        );
    }

    // ── Helpers ────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private MediaResult toMediaResult(Map<String, Object> r, String type) {
        List<String> genres = Collections.emptyList(); // search endpoint doesn't return names
        return new MediaResult(
                String.valueOf(r.get("id")),
                safeString(r.getOrDefault("title", r.get("name"))),
                type,
                toYear((String) r.get("release_date")),
                safeString(r.get("overview")),
                toImageUrl((String) r.get("poster_path")),
                toRating(r.get("vote_average")),
                genres
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

    /** Unified DTO returned to the frontend for both movies and anime. */
    public record MediaResult(
            String id,
            String title,
            String type,        // "movie" | "anime"
            String year,
            String synopsis,
            String posterUrl,
            double rating,
            List<String> genres
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
