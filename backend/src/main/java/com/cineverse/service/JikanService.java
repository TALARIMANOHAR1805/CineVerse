package com.cineverse.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Jikan API v4 Client — Anime search (no API key needed).
 * Rate-limited at 3 req/s by Jikan.
 */
@Service
public class JikanService {

    private static final String BASE_URL = "https://api.jikan.moe/v4";

    private final RestClient restClient;

    public JikanService(RestClient.Builder builder) {
        this.restClient = builder.baseUrl(BASE_URL).build();
    }

    /** Search anime by title — returns up to 20 results. */
    @SuppressWarnings("unchecked")
    public List<TmdbService.MediaResult> searchAnime(String query) {
        Map<String, Object> response = restClient.get()
                .uri(u -> u.path("/anime")
                        .queryParam("q", query)
                        .queryParam("limit", 20)
                        .queryParam("sfw", true)
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null) return Collections.emptyList();

        List<Map<String, Object>> data =
                (List<Map<String, Object>>) response.getOrDefault("data", Collections.emptyList());

        return data.stream()
                .map(this::toMediaResult)
                .collect(Collectors.toList());
    }

    /** Get a single anime by MAL id. */
    @SuppressWarnings("unchecked")
    public TmdbService.MediaResult getAnimeById(int malId) {
        Map<String, Object> response = restClient.get()
                .uri(u -> u.path("/anime/{id}").build(malId))
                .retrieve()
                .body(Map.class);

        if (response == null) return null;
        Map<String, Object> data = (Map<String, Object>) response.get("data");
        return data == null ? null : toMediaResult(data);
    }

    // ── Helpers ────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private TmdbService.MediaResult toMediaResult(Map<String, Object> r) {
        // Genres: [{name: "Action"}, ...]
        List<Map<String, Object>> genreMaps =
                (List<Map<String, Object>>) r.getOrDefault("genres", Collections.emptyList());
        List<String> genres = genreMaps.stream()
                .map(g -> (String) g.get("name"))
                .collect(Collectors.toList());

        // Images: {jpg: {image_url, large_image_url}}
        Map<String, Object> images = (Map<String, Object>) r.getOrDefault("images", Collections.emptyMap());
        Map<String, Object> jpg = (Map<String, Object>) images.getOrDefault("jpg", Collections.emptyMap());
        String poster = (String) jpg.getOrDefault("large_image_url", jpg.get("image_url"));

        // Year: aired.prop.from.year
        Map<String, Object> aired = (Map<String, Object>) r.getOrDefault("aired", Collections.emptyMap());
        Map<String, Object> prop = (Map<String, Object>) aired.getOrDefault("prop", Collections.emptyMap());
        Map<String, Object> from = (Map<String, Object>) prop.getOrDefault("from", Collections.emptyMap());
        String year = from.containsKey("year") && from.get("year") != null
                ? String.valueOf(((Number) from.get("year")).intValue())
                : "—";

        // Title
        String title = (String) r.getOrDefault("title_english", r.get("title"));
        if (title == null || title.isBlank()) title = (String) r.get("title");

        double score = r.get("score") instanceof Number n ? n.doubleValue() : 0.0;

        return new TmdbService.MediaResult(
                String.valueOf(((Number) r.get("mal_id")).intValue()),
                title,
                "anime",
                year,
                (String) r.getOrDefault("synopsis", ""),
                poster,
                Math.round(score * 10.0) / 10.0,
                genres
        );
    }
}
