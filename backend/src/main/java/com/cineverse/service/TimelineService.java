package com.cineverse.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * TimelineService — Phase 2
 *
 * Orchestrates timeline construction for movies (via TMDB collections)
 * and anime (via Jikan sequel chains).
 */
@Service
public class TimelineService {

    private final TmdbService tmdbService;
    private final JikanService jikanService;

    public TimelineService(TmdbService tmdbService, JikanService jikanService) {
        this.tmdbService = tmdbService;
        this.jikanService = jikanService;
    }

    /**
     * Movie timeline — fetches the TMDB collection for a movie.
     * If the movie has no collection it returns a single-entry timeline.
     */
    public TimelineResponse getMovieTimeline(int tmdbId) {
        TmdbService.MediaResult movie = tmdbService.getMovieById(tmdbId);
        if (movie == null) return null;

        // Standalone movie — no collection
        if (movie.collectionId() == null) {
            return new TimelineResponse(
                    movie.title(),
                    "movie",
                    String.valueOf(tmdbId),
                    List.of(new TimelineEntry(
                            movie.id(), movie.title(), movie.year(),
                            movie.posterUrl(), movie.rating(), 1, true
                    ))
            );
        }

        // Fetch the full collection
        TmdbService.CollectionResult col = tmdbService.getCollection(movie.collectionId());
        if (col == null || col.parts().isEmpty()) {
            return new TimelineResponse(
                    movie.title(), "movie", String.valueOf(tmdbId),
                    List.of(new TimelineEntry(
                            movie.id(), movie.title(), movie.year(),
                            movie.posterUrl(), movie.rating(), 1, true
                    ))
            );
        }

        String currentId = String.valueOf(tmdbId);
        List<TmdbService.MediaResult> parts = col.parts();

        List<TimelineEntry> entries = IntStream.range(0, parts.size())
                .mapToObj(i -> {
                    TmdbService.MediaResult p = parts.get(i);
                    return new TimelineEntry(
                            p.id(), p.title(), p.year(), p.posterUrl(),
                            p.rating(), i + 1, p.id().equals(currentId)
                    );
                })
                .collect(Collectors.toList());

        return new TimelineResponse(col.name(), "movie", currentId, entries);
    }

    /**
     * Anime timeline — delegates to JikanService to walk the
     * PREQUEL → root → SEQUEL chain.
     */
    public TimelineResponse getAnimeTimeline(int malId) {
        TimelineResponse raw = jikanService.getAnimeTimeline(malId);
        if (raw == null) return null;

        // Number the entries (JikanService returns them in order)
        String currentId = String.valueOf(malId);
        List<TimelineEntry> numbered = IntStream.range(0, raw.entries().size())
                .mapToObj(i -> {
                    TimelineEntry e = raw.entries().get(i);
                    return new TimelineEntry(
                            e.id(), e.title(), e.year(), e.posterUrl(),
                            e.rating(), i + 1, e.id().equals(currentId)
                    );
                })
                .collect(Collectors.toList());

        return new TimelineResponse(raw.franchiseName(), "anime", currentId, numbered);
    }

    // ── Response DTOs ──────────────────────────────────────────

    public record TimelineEntry(
            String id,
            String title,
            String year,
            String posterUrl,
            double rating,
            int position,
            boolean isCurrent
    ) {}

    public record TimelineResponse(
            String franchiseName,
            String type,
            String currentId,
            List<TimelineEntry> entries
    ) {}
}
