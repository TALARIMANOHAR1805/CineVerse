package com.cineverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * TmdbService v2 — Upgraded with pagination, watch providers, and similar movies.
 *
 * Author: Koushik-31368
 */
@Service
public class TmdbServiceV2 {

    @Value("${tmdb.api.key:}")
    private String apiKey;

    private static final String BASE = "https://api.themoviedb.org/3";

    private final RestTemplate rest = new RestTemplate();

    /** Search movies by query */
    public List<Map<String, Object>> searchMovies(String query, int page) {
        if (apiKey == null || apiKey.isBlank()) return List.of();
        String url = UriComponentsBuilder.fromHttpUrl(BASE + "/search/movie")
                .queryParam("api_key", apiKey)
                .queryParam("query",   query)
                .queryParam("page",    page)
                .build().toUriString();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            if (resp == null) return List.of();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) resp.getOrDefault("results", List.of());
            return results;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Get trending movies (day or week) */
    public List<Map<String, Object>> getTrending(String window, int page) {
        if (apiKey == null || apiKey.isBlank()) return List.of();
        String url = UriComponentsBuilder.fromHttpUrl(BASE + "/trending/movie/" + window)
                .queryParam("api_key", apiKey)
                .queryParam("page",    page)
                .build().toUriString();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            if (resp == null) return List.of();
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) resp.getOrDefault("results", List.of());
            return results;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Get movies by category (popular, top_rated, now_playing, upcoming) */
    public List<Map<String, Object>> getByCategory(String category, int page) {
        if (apiKey == null || apiKey.isBlank()) return List.of();
        String url = UriComponentsBuilder.fromHttpUrl(BASE + "/movie/" + category)
                .queryParam("api_key", apiKey)
                .queryParam("page",    page)
                .build().toUriString();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results =
                resp != null ? (List<Map<String, Object>>) resp.getOrDefault("results", List.of()) : List.of();
            return results;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Get similar movies */
    public List<Map<String, Object>> getSimilar(String tmdbId, int page) {
        if (apiKey == null || apiKey.isBlank()) return List.of();
        String url = UriComponentsBuilder.fromHttpUrl(BASE + "/movie/" + tmdbId + "/similar")
                .queryParam("api_key", apiKey)
                .queryParam("page",    page)
                .build().toUriString();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results =
                resp != null ? (List<Map<String, Object>>) resp.getOrDefault("results", List.of()) : List.of();
            return results;
        } catch (Exception e) {
            return List.of();
        }
    }

    /** Get JustWatch streaming providers for a movie */
    public Map<String, Object> getWatchProviders(String tmdbId, String region) {
        if (apiKey == null || apiKey.isBlank()) return Map.of();
        String url = UriComponentsBuilder.fromHttpUrl(BASE + "/movie/" + tmdbId + "/watch/providers")
                .queryParam("api_key", apiKey)
                .build().toUriString();
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = rest.getForObject(url, Map.class);
            if (resp == null) return Map.of();
            @SuppressWarnings("unchecked")
            Map<String, Object> results = (Map<String, Object>) resp.getOrDefault("results", Map.of());
            @SuppressWarnings("unchecked")
            Map<String, Object> regionData =
                (Map<String, Object>) results.getOrDefault(region, results.getOrDefault("US", Map.of()));
            return regionData;
        } catch (Exception e) {
            return Map.of();
        }
    }
}
