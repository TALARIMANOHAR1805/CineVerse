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
        String id, String title, String year, double rating,
        String posterUrl, String type, String synopsis, List<String> genres,
        String collectionId
    ) {}

    public record CastMember(String name, String character) {}

    public record CollectionResult(String id, String name, List<MediaResult> parts) {}

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
    public MediaResult getMovieById(int tmdbId) {
        String cacheKey = "tmdb:detail:" + tmdbId;
        MediaResult cached = cache.get(cacheKey);
        if (cached != null) return cached;
        try {
            String url = String.format("%s/movie/%d?api_key=%s", BASE, tmdbId, apiKey);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return null;
            MediaResult result = toMediaResult(resp.getBody(), "movie");
            cache.put(cacheKey, result);
            return result;
        } catch (RestClientException e) { return null; }
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
    public List<CastMember> getMovieCredits(int tmdbId) {
        String cacheKey = "tmdb:credits:" + tmdbId;
        List<CastMember> cached = cache.get(cacheKey);
        if (cached != null) return cached;
        try {
            String url = String.format("%s/movie/%d/credits?api_key=%s", BASE, tmdbId, apiKey);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return List.of();
            List<Map<String, Object>> cast = (List<Map<String, Object>>) resp.getBody().get("cast");
            if (cast == null) return List.of();
            List<CastMember> credits = cast.stream()
                .filter(c -> c.get("name") != null)
                .limit(10)
                .map(c -> new CastMember(
                    String.valueOf(c.get("name")),
                    c.get("character") != null ? String.valueOf(c.get("character")) : ""
                ))
                .toList();
            cache.put(cacheKey, credits);
            return credits;
        } catch (RestClientException e) {
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    public CollectionResult getCollection(String collectionId) {
        if (collectionId == null || collectionId.isBlank()) return null;
        String normalizedId = collectionId.trim();
        String cacheKey = "tmdb:collection:" + normalizedId;
        CollectionResult cached = cache.get(cacheKey);
        if (cached != null) return cached;
        try {
            String url = String.format("%s/collection/%s?api_key=%s", BASE, normalizedId, apiKey);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return null;
            Map<String, Object> body = resp.getBody();
            String name = body.get("name") != null ? String.valueOf(body.get("name")) : "";
            List<Map<String, Object>> rawParts = (List<Map<String, Object>>) body.getOrDefault("parts", List.of());
            List<MediaResult> parts = rawParts.stream()
                .map(p -> toMediaResult(p, "movie", normalizedId))
                .toList();
            CollectionResult result = new CollectionResult(normalizedId, name, parts);
            cache.put(cacheKey, result);
            return result;
        } catch (RestClientException e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private MediaResult toMediaResult(Map<String, Object> m, String type) {
        return toMediaResult(m, type, extractCollectionId(m));
    }

    @SuppressWarnings("unchecked")
    private MediaResult toMediaResult(Map<String, Object> m, String type, String fallbackCollectionId) {
        String posterPath  = (String) m.get("poster_path");
        String posterUrl   = posterPath != null ? IMG + posterPath : null;
        String title       = (String) m.getOrDefault("title", m.getOrDefault("name", "Unknown"));
        String releaseDate = (String) m.getOrDefault("release_date", "");
        String year        = releaseDate.length() >= 4 ? releaseDate.substring(0, 4) : "—";
        double rating      = ((Number) m.getOrDefault("vote_average", 0)).doubleValue();
        String synopsis    = (String) m.getOrDefault("overview", "");
        List<String> genres    = extractGenres(m);
        int id = ((Number) m.getOrDefault("id", 0)).intValue();
        String collectionId = fallbackCollectionId != null ? fallbackCollectionId : extractCollectionId(m);
        return new MediaResult(String.valueOf(id), title, year, Math.round(rating * 10.0) / 10.0, posterUrl, type, synopsis, genres, collectionId);
    }

    @SuppressWarnings("unchecked")
    private String extractCollectionId(Map<String, Object> m) {
        Object rawCollection = m.get("belongs_to_collection");
        if (rawCollection instanceof Map<?, ?> col && col.get("id") != null) {
            return String.valueOf(col.get("id"));
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private List<String> extractGenres(Map<String, Object> m) {
        Object rawGenreIds = m.get("genre_ids");
        if (rawGenreIds instanceof List<?> genreIdList) {
            return genreIdList.stream()
                .filter(Number.class::isInstance)
                .map(Number.class::cast)
                .map(Number::intValue)
                .map(id -> GENRE_MAP.getOrDefault(id, ""))
                .filter(g -> !g.isBlank())
                .toList();
        }

        Object rawGenres = m.get("genres");
        if (rawGenres instanceof List<?> genreMaps) {
            return genreMaps.stream()
                .filter(Map.class::isInstance)
                .map(Map.class::cast)
                .map(g -> g.get("name"))
                .filter(Objects::nonNull)
                .map(String::valueOf)
                .filter(g -> !g.isBlank())
                .toList();
        }

        return List.of();
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
