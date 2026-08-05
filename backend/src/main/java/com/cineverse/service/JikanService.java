package com.cineverse.service;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Jikan API v4 Client — Phase 1 + Phase 2
 * Anime search, detail, and watch-order timeline via relations.
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

    /**
     * Phase 2 — Build anime watch-order timeline.
     *
     * Strategy: start from the given MAL id, walk PREQUEL links to find
     * the series root, then walk SEQUEL links forward to collect all entries.
     * Depth-limited to 20 hops to avoid cycles.
     */
    public TimelineService.TimelineResponse getAnimeTimeline(int startMalId) {
        // Step 1 — walk back to find the root of the series
        int rootId = findSeriesRoot(startMalId, new HashSet<>(), 0);

        // Step 2 — walk forward from root collecting SEQUEL chain
        List<TimelineService.TimelineEntry> entries = new ArrayList<>();
        collectSequels(rootId, entries, new HashSet<>(), 0);

        // Step 3 — find series name from root entry
        TmdbService.MediaResult root = getAnimeById(rootId);
        String seriesName = root != null ? root.title() : "Anime Series";

        return new TimelineService.TimelineResponse(
                seriesName,
                "anime",
                String.valueOf(startMalId),
                entries
        );
    }

    // ── Private helpers ─────────────────────────────────────────

    private int findSeriesRoot(int malId, Set<Integer> visited, int depth) {
        if (depth > 10 || visited.contains(malId)) return malId;
        visited.add(malId);

        List<Map<String, Object>> relations = fetchRelations(malId);
        for (Map<String, Object> rel : relations) {
            if ("Prequel".equalsIgnoreCase((String) rel.get("relation"))) {
                List<Map<String, Object>> entries = getEntryList(rel);
                for (Map<String, Object> e : entries) {
                    if ("anime".equalsIgnoreCase((String) e.get("type"))) {
                        int preId = ((Number) e.get("mal_id")).intValue();
                        return findSeriesRoot(preId, visited, depth + 1);
                    }
                }
            }
        }
        return malId;
    }

    private void collectSequels(int malId, List<TimelineService.TimelineEntry> collected,
                                Set<Integer> visited, int depth) {
        if (depth > 15 || visited.contains(malId)) return;
        visited.add(malId);

        // Fetch entry detail for poster/rating
        TmdbService.MediaResult detail = getAnimeById(malId);
        if (detail != null) {
            collected.add(new TimelineService.TimelineEntry(
                    String.valueOf(malId),
                    detail.title(),
                    detail.year(),
                    detail.posterUrl(),
                    detail.rating(),
                    0,     // position assigned by TimelineService
                    false  // isCurrent assigned by TimelineService
            ));
        }

        // Sleep briefly to respect Jikan 3 req/s limit
        try { Thread.sleep(350); } catch (InterruptedException ignored) {}

        // Find sequels and recurse
        List<Map<String, Object>> relations = fetchRelations(malId);
        for (Map<String, Object> rel : relations) {
            if ("Sequel".equalsIgnoreCase((String) rel.get("relation"))) {
                for (Map<String, Object> e : getEntryList(rel)) {
                    if ("anime".equalsIgnoreCase((String) e.get("type"))) {
                        int seqId = ((Number) e.get("mal_id")).intValue();
                        collectSequels(seqId, collected, visited, depth + 1);
                    }
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchRelations(int malId) {
        try {
            Map<String, Object> resp = restClient.get()
                    .uri(u -> u.path("/anime/{id}/relations").build(malId))
                    .retrieve()
                    .body(Map.class);
            if (resp == null) return Collections.emptyList();
            return (List<Map<String, Object>>) resp.getOrDefault("data", Collections.emptyList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getEntryList(Map<String, Object> rel) {
        Object entries = rel.get("entry");
        if (entries instanceof List<?> list) return (List<Map<String, Object>>) list;
        return Collections.emptyList();
    }

    // ── Mapping ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private TmdbService.MediaResult toMediaResult(Map<String, Object> r) {
        List<Map<String, Object>> genreMaps =
                (List<Map<String, Object>>) r.getOrDefault("genres", Collections.emptyList());
        List<String> genres = genreMaps.stream()
                .map(g -> (String) g.get("name"))
                .collect(Collectors.toList());

        Map<String, Object> images = (Map<String, Object>) r.getOrDefault("images", Collections.emptyMap());
        Map<String, Object> jpg = (Map<String, Object>) images.getOrDefault("jpg", Collections.emptyMap());
        String poster = (String) jpg.getOrDefault("large_image_url", jpg.get("image_url"));

        Map<String, Object> aired = (Map<String, Object>) r.getOrDefault("aired", Collections.emptyMap());
        Map<String, Object> prop = (Map<String, Object>) aired.getOrDefault("prop", Collections.emptyMap());
        Map<String, Object> from = (Map<String, Object>) prop.getOrDefault("from", Collections.emptyMap());
        String year = from.containsKey("year") && from.get("year") != null
                ? String.valueOf(((Number) from.get("year")).intValue()) : "—";

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
                genres,
                null  // no TMDB collectionId for anime
        );
    }

    /** Lightweight internal record — NOT needed, using TimelineService.TimelineEntry instead. */
    // (removed to avoid duplicate type conflict)
}
