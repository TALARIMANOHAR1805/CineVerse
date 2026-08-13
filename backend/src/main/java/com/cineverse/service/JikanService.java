package com.cineverse.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Jikan API v4 Client — Phase 1 + Phase 2
 * Anime search, detail, and watch-order timeline via relations.
 */
@Service
public class JikanService {

    private static final String BASE_URL = "https://api.jikan.moe/v4";
    private final RestClient restClient;
    // Cache last successful search results to survive Jikan/MAL outages
    private final ConcurrentHashMap<String, List<TmdbService.MediaResult>> searchCache = new ConcurrentHashMap<>();

    public JikanService(RestClient.Builder builder) {
        this.restClient = builder.baseUrl(BASE_URL).build();
    }

    /** Search anime by title — returns up to 20 results. Falls back to cache if Jikan/MAL is down. */
    @SuppressWarnings("unchecked")
    public List<TmdbService.MediaResult> searchAnime(String query) {
        String cacheKey = query.toLowerCase().trim();
        try {
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

            List<TmdbService.MediaResult> results = data.stream()
                    .map(this::toMediaResult)
                    .collect(Collectors.toList());

            // Cache on success
            if (!results.isEmpty()) searchCache.put(cacheKey, results);
            return results;

        } catch (Exception e) {
            System.err.println("[JikanService] searchAnime failed: " + e.getMessage());
            // Serve stale cache if available — better than empty when MAL is down
            List<TmdbService.MediaResult> cached = searchCache.get(cacheKey);
            if (cached != null) {
                System.err.println("[JikanService] Serving " + cached.size() + " cached anime results for: " + query);
                return cached;
            }
            return Collections.emptyList();
        }
    }

    /** Get a single anime by MAL id. */
    @SuppressWarnings("unchecked")
    public TmdbService.MediaResult getAnimeById(int malId) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri(u -> u.path("/anime/{id}").build(malId))
                    .retrieve()
                    .body(Map.class);

            if (response == null) return null;
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return data == null ? null : toMediaResult(data);
        } catch (Exception e) {
            System.err.println("Jikan getAnimeById failed for id=" + malId + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Phase 2 — Build anime watch-order timeline.
     *
     * Strategy: start from the given MAL id, walk PREQUEL links to find
     * the series root, then walk SEQUEL links forward to collect all entries.
     * Depth-limited to 20 hops to avoid cycles.
     */
    public TimelineService.TimelineResponse getAnimeTimeline(int startMalId) {
        try {
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
        } catch (Exception e) {
            // Jikan API outage — return graceful empty timeline instead of 500
            System.err.println("[JikanService] getAnimeTimeline failed for malId=" + startMalId + ": " + e.getMessage());
            return new TimelineService.TimelineResponse(
                    "Anime Series",
                    "anime",
                    String.valueOf(startMalId),
                    Collections.emptyList()
            );
        }
    }

    // ── Phase C: Spoiler-Shield ──────────────────────────────────

    /**
     * Returns anime data filtered to be safe up to a given episode threshold.
     *
     * ── Honest assessment of what this can and cannot do ─────────
     *
     * Jikan provides:
     *   • /anime/{id}            → total episode count + one series-level synopsis blob
     *   • /anime/{id}/episodes   → list of episodes (number, title, aired date, filler flag)
     *   • /anime/{id}/episodes/{n} → single episode detail — synopsis often EMPTY in Jikan
     *
     * What IS achievable (implemented here):
     *   1. Episode titles up to upToEpisode  — genuinely spoiler-safe
     *   2. Series synopsis SUPPRESSED when upToEpisode < totalEpisodes — because
     *      the synopsis covers the whole series and cannot be safely truncated at
     *      the sentence level without per-episode mapping we don't have
     *   3. Genres, rating, poster are always returned (metadata, not plot)
     *   4. A progress indicator: (upToEpisode / totalEpisodes) × 100
     *
     * What is NOT achievable without extra data:
     *   • Sentence-level synopsis truncation (no per-episode synopsis in Jikan)
     *   • Tag/theme filtering by episode range (Jikan tags are series-level only)
     *
     * This is real threshold-based logic, not string-chopping.
     * spoilerShieldActive=true means the synopsis has been suppressed, not trimmed.
     */
    @SuppressWarnings("unchecked")
    public SpoilerSafeResponse getSpoilerSafeAnime(int malId, int upToEpisode) {
        try {
            // Step 1: fetch series detail
            Map<String, Object> response = restClient.get()
                    .uri(u -> u.path("/anime/{id}").build(malId))
                    .retrieve()
                    .body(Map.class);

            if (response == null) return null;
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data == null) return null;

            // Total episodes from Jikan (may be null for ongoing)
            int totalEpisodes = data.get("episodes") instanceof Number n
                    ? n.intValue() : 0;
            
            if (totalEpisodes == 0) {
                totalEpisodes = getEstimatedTotalEpisodes(malId);
            }

            // Series-level synopsis
            String fullSynopsis = (String) data.getOrDefault("synopsis", "");

            // Genres (series-level metadata — safe always)
            List<Map<String, Object>> genreMaps =
                    (List<Map<String, Object>>) data.getOrDefault("genres", Collections.emptyList());
            List<String> genres = genreMaps.stream()
                    .map(g -> (String) g.get("name"))
                    .collect(Collectors.toList());

            // Poster + rating
            Map<String, Object> images = (Map<String, Object>) data.getOrDefault("images", Collections.emptyMap());
            Map<String, Object> jpg = (Map<String, Object>) images.getOrDefault("jpg", Collections.emptyMap());
            String posterUrl = (String) jpg.getOrDefault("large_image_url", jpg.get("image_url"));

            double rating = data.get("score") instanceof Number n ? n.doubleValue() : 0.0;

            Map<String, Object> aired = (Map<String, Object>) data.getOrDefault("aired", Collections.emptyMap());
            Map<String, Object> prop = (Map<String, Object>) aired.getOrDefault("prop", Collections.emptyMap());
            Map<String, Object> from = (Map<String, Object>) prop.getOrDefault("from", Collections.emptyMap());
            String year = from.containsKey("year") && from.get("year") != null
                    ? String.valueOf(((Number) from.get("year")).intValue()) : "—";

            String title = (String) data.getOrDefault("title_english", data.get("title"));
            if (title == null || title.isBlank()) title = (String) data.get("title");

            // ── Spoiler shield decision ───────────────────────────────
            // Shield is active if the user hasn't seen ALL episodes yet.
            // When active, synopsis is suppressed entirely because the Jikan
            // synopsis covers the full series with no episode boundaries.
            boolean shieldActive;
            String safesynopsis;
            if (totalEpisodes == 0) {
                // Ongoing or unknown — be safe, suppress
                shieldActive  = true;
                safesynopsis = null;
            } else if (upToEpisode >= totalEpisodes) {
                // User has seen everything — full synopsis is safe
                shieldActive  = false;
                safesynopsis = fullSynopsis;
            } else {
                // Partial progress — suppress series synopsis to avoid spoilers
                shieldActive  = true;
                safesynopsis = null;
            }

            // ── Episode list up to threshold ──────────────────────────
            // This IS genuinely spoiler-safe: we only return titles/dates
            // for episodes the user has already watched.
            int clampedLimit = Math.max(1, Math.min(upToEpisode, 100));
            List<EpisodeStub> safeEpisodes = fetchEpisodeList(malId, clampedLimit);

            int progress = totalEpisodes > 0
                    ? (int) Math.round((upToEpisode * 100.0) / totalEpisodes) : 0;

            return new SpoilerSafeResponse(
                    String.valueOf(malId), title, year, posterUrl,
                    Math.round(rating * 10.0) / 10.0,
                    genres, safesynopsis, shieldActive,
                    upToEpisode, totalEpisodes, progress, safeEpisodes
            );
        } catch (Exception e) {
            System.err.println("[JikanService] getSpoilerSafeAnime failed for malId=" + malId + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Fetches episode stubs from Jikan (number + title + air date).
     * Jikan paginates at 100 per page; upToEpisode is clamped to 100.
     * Episode-level synopsis is NOT fetched — it's empty in Jikan for most entries.
     */
    @SuppressWarnings("unchecked")
    public List<EpisodeStub> fetchEpisodeList(int malId, int upToEpisode) {
        try {
            // Jikan episodes endpoint — up to 100 per page
            Map<String, Object> resp = restClient.get()
                    .uri(u -> u.path("/anime/{id}/episodes").queryParam("page", 1).build(malId))
                    .retrieve()
                    .body(Map.class);

            if (resp == null) return Collections.emptyList();

            List<Map<String, Object>> episodeData =
                    (List<Map<String, Object>>) resp.getOrDefault("data", Collections.emptyList());

            return episodeData.stream()
                    .filter(ep -> {
                        Object num = ep.get("mal_id");
                        return num instanceof Number n && n.intValue() <= upToEpisode;
                    })
                    .map(ep -> new EpisodeStub(
                            ep.get("mal_id") instanceof Number n ? n.intValue() : 0,
                            (String) ep.getOrDefault("title", ""),
                            ep.get("aired") instanceof String s ? s : ""
                    ))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("[JikanService] fetchEpisodeList failed for malId=" + malId + ": " + e.getMessage());
            return Collections.emptyList();
        }
    }

    // ── Phase C DTOs ─────────────────────────────────────────────

    /** Single episode stub — title + air date only (no spoiler synopsis). */
    public record EpisodeStub(int number, String title, String aired) {}

    /**
     * Spoiler-safe anime response.
     *
     * synopsis is NULL when spoilerShieldActive=true.
     * safeEpisodes contains episode titles up to upToEpisode (never past).
     * progressPercent = upToEpisode / totalEpisodes × 100.
     */
    public record SpoilerSafeResponse(
            String id,
            String title,
            String year,
            String posterUrl,
            double rating,
            List<String> genres,
            String synopsis,            // null when shield active
            boolean spoilerShieldActive,
            int upToEpisode,
            int totalEpisodes,
            int progressPercent,
            List<EpisodeStub> safeEpisodes
    ) {}

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

    @SuppressWarnings("unchecked")
    private int getEstimatedTotalEpisodes(int malId) {
        try {
            Map<String, Object> resp = restClient.get()
                    .uri(u -> u.path("/anime/{id}/episodes").queryParam("page", 1).build(malId))
                    .retrieve()
                    .body(Map.class);
            if (resp != null) {
                Map<String, Object> pagination = (Map<String, Object>) resp.get("pagination");
                if (pagination != null) {
                    int lastPage = pagination.get("last_visible_page") instanceof Number n ? n.intValue() : 1;
                    if (lastPage == 1) {
                        List<Map<String, Object>> data = (List<Map<String, Object>>) resp.get("data");
                        return data != null ? data.size() : 0;
                    }
                    try { Thread.sleep(350); } catch (InterruptedException ignored) {} // Rate limit
                    // Fetch last page to get exact last episode number
                    Map<String, Object> lastPageResp = restClient.get()
                            .uri(u -> u.path("/anime/{id}/episodes").queryParam("page", lastPage).build(malId))
                            .retrieve()
                            .body(Map.class);
                    if (lastPageResp != null) {
                        List<Map<String, Object>> data = (List<Map<String, Object>>) lastPageResp.get("data");
                        if (data != null && !data.isEmpty()) {
                            Map<String, Object> lastEp = data.get(data.size() - 1);
                            return lastEp.get("mal_id") instanceof Number n ? n.intValue() : lastPage * 100;
                        }
                    }
                    return lastPage * 100; // rough fallback
                }
            }
        } catch (Exception e) {
            System.err.println("[JikanService] Failed to estimate total episodes: " + e.getMessage());
        }
        return 0;
    }

    /** Lightweight internal record — NOT needed, using TimelineService.TimelineEntry instead. */
    // (removed to avoid duplicate type conflict)
}
