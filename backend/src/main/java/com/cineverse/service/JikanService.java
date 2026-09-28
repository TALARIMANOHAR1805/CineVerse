package com.cineverse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * JikanService — Wraps Jikan v4 API (unofficial MyAnimeList REST API).
 * Handles anime search and detail lookup with CacheService integration.
 * Improved by: Koushik-31368
 */
@Service
public class JikanService {

    private static final Logger log = LoggerFactory.getLogger(JikanService.class);
    private static final String BASE = "https://api.jikan.moe/v4";

    private final RestTemplate restTemplate;
    private final CacheService cache;

    public JikanService(CacheService cache) {
        this.restTemplate = new RestTemplate();
        this.cache        = cache;
    }

    public record AnimeResult(
        int id, String title, String year, double rating,
        String posterUrl, String type, String synopsis, List<String> genres
    ) {}

    @SuppressWarnings("unchecked")
    public List<AnimeResult> searchAnime(String query) {
        String cacheKey = "jikan:search:" + query.toLowerCase().trim();
        List<AnimeResult> cached = cache.get(cacheKey);
        if (cached != null) return cached;
        try {
            String url = String.format("%s/anime?q=%s&sfw=true&limit=10", BASE, query.replace(" ", "%20"));
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return List.of();
            List<Map<String, Object>> data = (List<Map<String, Object>>) resp.getBody().get("data");
            if (data == null) return List.of();
            List<AnimeResult> results = data.stream()
                .filter(a -> getImages(a) != null).limit(10)
                .map(this::toAnimeResult).toList();
            cache.put(cacheKey, results);
            return results;
        } catch (RestClientException e) {
            log.warn("Jikan search failed for '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    public Optional<AnimeResult> getAnimeById(int malId) {
        String cacheKey = "jikan:detail:" + malId;
        AnimeResult cached = cache.get(cacheKey);
        if (cached != null) return Optional.of(cached);
        try {
            String url = String.format("%s/anime/%d", BASE, malId);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);
            if (!resp.getStatusCode().is2xxSuccessful() || resp.getBody() == null) return Optional.empty();
            Map<String, Object> data = (Map<String, Object>) resp.getBody().get("data");
            if (data == null) return Optional.empty();
            AnimeResult result = toAnimeResult(data);
            cache.put(cacheKey, result);
            return Optional.of(result);
        } catch (RestClientException e) {
            log.warn("Jikan detail failed for id {}: {}", malId, e.getMessage());
            return Optional.empty();
        }
    }

    @SuppressWarnings("unchecked")
    private AnimeResult toAnimeResult(Map<String, Object> a) {
        String posterUrl = null;
        Map<String, Object> images = getImages(a);
        if (images != null) {
            Map<String, Object> jpg = (Map<String, Object>) images.get("jpg");
            if (jpg != null) posterUrl = (String) jpg.get("large_image_url");
        }
        int    id       = ((Number) a.getOrDefault("mal_id", 0)).intValue();
        String title    = (String) a.getOrDefault("title_english", a.getOrDefault("title", "Unknown"));
        String synopsis = (String) a.getOrDefault("synopsis", "");
        double score    = ((Number) a.getOrDefault("score", 0)).doubleValue();
        String year     = "—";
        Map<String, Object> aired = (Map<String, Object>) a.get("aired");
        if (aired != null) {
            Map<String, Object> prop = (Map<String, Object>) aired.get("prop");
            if (prop != null) {
                Map<String, Object> from = (Map<String, Object>) prop.get("from");
                if (from != null && from.get("year") != null) year = String.valueOf(from.get("year"));
            }
        }
        List<Map<String, Object>> genreList = (List<Map<String, Object>>) a.getOrDefault("genres", List.of());
        List<String> genres = genreList.stream()
            .map(g -> (String) g.getOrDefault("name", "")).filter(g -> !g.isBlank()).toList();
        return new AnimeResult(id, title, year, Math.round(score * 10.0) / 10.0, posterUrl, "anime", synopsis, genres);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getImages(Map<String, Object> a) {
        return (Map<String, Object>) a.get("images");
    }

    /**
     * Build an anime timeline (PREQUEL → root → SEQUEL chain) for a given MAL ID.
     * Called by TimelineService to construct the watch-order view.
     *
     * @param malId  MyAnimeList ID of the currently-viewed anime
     * @return TimelineService.TimelineResponse, or null if not found
     */
    @SuppressWarnings("unchecked")
    public com.cineverse.service.TimelineService.TimelineResponse getAnimeTimeline(int malId) {
        String cacheKey = "jikan:timeline:" + malId;
        com.cineverse.service.TimelineService.TimelineResponse cached = cache.get(cacheKey);
        if (cached != null) return cached;

        try {
            // Fetch the anime entry to get its title for the franchise name
            Optional<AnimeResult> root = getAnimeById(malId);
            if (root.isEmpty()) return null;

            // Fetch related entries (sequels, prequels) from Jikan
            String url = String.format("%s/anime/%d/relations", BASE, malId);
            ResponseEntity<Map> resp = restTemplate.getForEntity(url, Map.class);

            List<com.cineverse.service.TimelineService.TimelineEntry> entries = new java.util.ArrayList<>();

            // Always include the root entry
            AnimeResult r = root.get();
            entries.add(new com.cineverse.service.TimelineService.TimelineEntry(
                String.valueOf(r.id()), r.title(), r.year(), r.posterUrl(), r.rating(), 1, true
            ));

            // If relations available, add sequels
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                List<Map<String, Object>> data = (List<Map<String, Object>>) resp.getBody().get("data");
                if (data != null) {
                    for (Map<String, Object> rel : data) {
                        String relType = (String) rel.get("relation");
                        if (!"Sequel".equalsIgnoreCase(relType) && !"Prequel".equalsIgnoreCase(relType)) continue;
                        List<Map<String, Object>> items = (List<Map<String, Object>>) rel.get("entry");
                        if (items == null) continue;
                        for (Map<String, Object> item : items) {
                            int relId = ((Number) item.getOrDefault("mal_id", 0)).intValue();
                            if (relId == 0 || relId == malId) continue;
                            getAnimeById(relId).ifPresent(a ->
                                entries.add(new com.cineverse.service.TimelineService.TimelineEntry(
                                    String.valueOf(a.id()), a.title(), a.year(), a.posterUrl(), a.rating(), entries.size() + 1, false
                                ))
                            );
                        }
                    }
                }
            }

            var result = new com.cineverse.service.TimelineService.TimelineResponse(
                r.title(), "anime", String.valueOf(malId), entries
            );
            cache.put(cacheKey, result);
            return result;
        } catch (Exception e) {
            log.warn("Failed to build anime timeline for malId={}: {}", malId, e.getMessage());
            return null;
        }
    }
}
