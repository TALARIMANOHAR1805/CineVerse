package com.cineverse.controller;

import com.cineverse.service.JikanService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * AnimeController — Phase C
 *
 * GET /api/anime/{id}/spoiler-safe?upToEpisode=12
 *
 * Returns anime metadata filtered to be safe for a viewer who has
 * only seen up to episode N.
 *
 * ── What the spoiler shield actually does ──────────────────────────
 * Jikan provides ONE series-level synopsis blob. There is no per-episode
 * synopsis data available at series granularity. Therefore:
 *
 *   spoilerShieldActive = (upToEpisode < totalEpisodes)
 *
 * When active:
 *   • synopsis → null (suppressed, not truncated)
 *   • safeEpisodes → episode titles up to N (genuinely safe)
 *   • genres, rating, poster → always returned (metadata only)
 *
 * When inactive (user has seen everything):
 *   • synopsis → full series synopsis returned
 *
 * This is NOT string-chopping. It is suppression-based filtering at
 * the series level, which is the maximum resolution Jikan supports.
 */
@RestController
@RequestMapping("/api/anime")
public class AnimeController {

    private final JikanService jikanService;

    public AnimeController(JikanService jikanService) {
        this.jikanService = jikanService;
    }

    /**
     * GET /api/anime/{id}/spoiler-safe?upToEpisode=N
     *
     * @param id            MAL id of the anime
     * @param upToEpisode   highest episode the user has watched (inclusive)
     */
    @GetMapping("/{id}/spoiler-safe")
    public JikanService.SpoilerSafeResponse spoilerSafe(
            @PathVariable int id,
            @RequestParam(defaultValue = "0") int upToEpisode) {

        if (upToEpisode < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "upToEpisode must be >= 0");
        }

        try {
            JikanService.SpoilerSafeResponse result = jikanService.getSpoilerSafeAnime(id, upToEpisode);
            if (result == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Anime not found on Jikan: " + id);
            }
            return result;
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception e) {
            System.err.println("[AnimeController] spoilerSafe error for id=" + id + ": " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Jikan API unavailable — try again later");
        }
    }
}
