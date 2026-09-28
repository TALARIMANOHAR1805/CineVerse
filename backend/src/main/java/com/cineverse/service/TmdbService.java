package com.cineverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * TmdbService — Wraps TMDB REST API calls.
 * Handles movie search, detail fetch, and cast retrieval.
 * Results are automatically cached in CacheService.
 * Improved by: Koushik-31368
 */
@Service
public class TmdbService {

    @Value("${tmdb.api.key:}")
    private String apiKey;

    private static final String BASE = "https://api.themoviedb.org/3";
    private static final String IMG  = "https://image.tmdb.org/t/p/w500";

    private final RestTemplate restTemplate;
    private final CacheService cache;

    public TmdbService(CacheService cache) {
        this.restTemplate = new RestTemplate();
        this.cache        = cache;
    }

    public record MediaResult(
        int id, String title, String year, double rating,
        String posterUrl, String type, String synopsis, List<String> genres
    ) {}

    @SuppressWarnings("unchecked")
    public List<MediaResult> searchMovies(String query) {
        String cacheKey = "tmdb:search:" + query.toLowerCase().trim();
        List<MediaResult> cached = cache.get(cacheKey);
        if (cached != null) return cached;
        try {
            String url = String.format("%s/search/movie?api_key=%s&query=%s&include_adult=false",
                BASE, apiKey, query.replace(" ", "%20"));
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return List.of();
            List<Map<String, Object>> rawResults = (List<Map<String, Object>>) resp.getBody().get("results");
            if (rawResults == null) return List.of();
            List<MediaResult> results = rawResults.stream()
                .filter(m -> m.get("poster_path") != null).limit(10)
                .map(m -> toMediaResult(m, "movie")).toList();
            cache.put(cacheKey, results);
            return results;
        } catch (RestClientException e) { return List.of(); }
    }

    @SuppressWarnings("unchecked")
    public Optional<MediaResult> getMovieById(int tmdbId) {
        String cacheKey = "tmdb:detail:" + tmdbId;
        MediaResult cached = cache.get(cacheKey);
        if (cached != null) return Optional.of(cached);
        try {
            String url = String.format("%s/movie/%d?api_key=%s", BASE, tmdbId, apiKey);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return Optional.empty();
            MediaResult result = toMediaResult(resp.getBody(), "movie");
            cache.put(cacheKey, result);
            return Optional.of(result);
        } catch (RestClientException e) { return Optional.empty(); }
    }

    @SuppressWarnings("unchecked")
    public List<String> getMovieCast(int tmdbId) {
        String cacheKey = "tmdb:cast:" + tmdbId;
        List<String> cached = cache.get(cacheKey);
        if (cached != null) return cached;
        try {
            String url = String.format("%s/movie/%d/credits?api_key=%s", BASE, tmdbId, apiKey);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return List.of();
            List<Map<String, Object>> cast = (List<Map<String, Object>>) resp.getBody().get("cast");
            if (cast == null) return List.of();
            List<String> actors = cast.stream()
                .filter(c -> c.get("name") != null).limit(10)
                .map(c -> (String) c.get("name")).toList();
            cache.put(cacheKey, actors);
            return actors;
        } catch (RestClientException e) { return List.of(); }
    }

    @SuppressWarnings("unchecked")
    private MediaResult toMediaResult(Map<String, Object> m, String type) {
        String posterPath  = (String) m.get("poster_path");
        String posterUrl   = posterPath != null ? IMG + posterPath : null;
        String title       = (String) m.getOrDefault("title", m.getOrDefault("name", "Unknown"));
        String releaseDate = (String) m.getOrDefault("release_date", "");
        String year        = releaseDate.length() >= 4 ? releaseDate.substring(0, 4) : "—";
        double rating      = ((Number) m.getOrDefault("vote_average", 0)).doubleValue();
        String synopsis    = (String) m.getOrDefault("overview", "");
        List<Integer> genreIds = (List<Integer>) m.getOrDefault("genre_ids", List.of());
        List<String> genres    = genreIds.stream().map(id -> GENRE_MAP.getOrDefault(id, "")).filter(g -> !g.isBlank()).toList();
        int id = ((Number) m.getOrDefault("id", 0)).intValue();
        return new MediaResult(id, title, year, Math.round(rating * 10.0) / 10.0, posterUrl, type, synopsis, genres);
    }

    private static final Map<Integer, String> GENRE_MAP = Map.ofEntries(
        Map.entry(28, "Action"), Map.entry(12, "Adventure"), Map.entry(16, "Animation"),
        Map.entry(35, "Comedy"), Map.entry(80, "Crime"), Map.entry(99, "Documentary"),
        Map.entry(18, "Drama"), Map.entry(10751, "Family"), Map.entry(14, "Fantasy"),
        Map.entry(36, "History"), Map.entry(27, "Horror"), Map.entry(10402, "Music"),
        Map.entry(9648, "Mystery"), Map.entry(10749, "Romance"), Map.entry(878, "Sci-Fi"),
        Map.entry(10770, "TV Movie"), Map.entry(53, "Thriller"), Map.entry(10752, "War"),
        Map.entry(37, "Western")
    );
}
