## CineVerse — Changelog (Updated)

## [Unreleased]

### Added (Day 4 — 2026-09-29)
- **Frontend:** `api.js` — Unified API layer: calls TMDB + Jikan **directly from the browser**; backend is optional fallback. **Fixes search "not found" issue completely.**
- **Frontend:** App.jsx v4 — trending movies on homepage, top airing anime, cast/trailer/episodes in detail panel, image error fallback
- **Frontend:** App.css v4 — hero badge, setup hint box, navbar, slideIn panel animation, retry button, mobile responsive
- **Frontend:** SearchBar v2 — disabled when empty, loading spinner in button, tabs
- **Frontend:** WatchlistPage v2 — filter tabs with counts, clear all with confirmation, remove X button
- **Frontend:** WatchlistContext v2 — `clearWatchlist()`, `getWatchlistByType()`, `savedAt` timestamp, v1→v2 migration
- **Frontend:** Toast v2 — max 4 toasts, click to dismiss, `aria-live` region
- **Frontend:** Skeleton v2 — section header skeleton, `SkeletonDetail`, `aria-busy`
- **Frontend:** Footer v2 — tech stack as links, GitHub link, copyright year
- **Frontend:** ErrorBoundary v2 — retry button, reload option, dev-only stack trace
- **Frontend:** index.css v3 — shimmer/fadeUp/spin keyframes, scrollbar, `focus-visible`, selection
- **Frontend:** vite.config.js v2 — dev proxy, vendor chunk split, chunk size warning
- **Frontend:** `.env.example` updated — TMDB key instructions, backend marked optional
- **Backend:** HealthController v2 — `/health/info` with heap MB, uptime, build version
- **Backend:** RequestLoggingInterceptor v2 — status-based log levels, exception logging
- **ML:** utils.py v2 — `hex_to_rgb`, `truncate`, `slugify`, `similarity_percent`, `is_valid_url`
- **ML:** `test_utils.py` — 30+ unit tests for all utils functions
- **ML:** `requirements.txt` — added Pillow, scikit-learn, numpy, httpx
- **CI:** `ci.yml` — cleaner names, `continue-on-error` for Neo4j, `VITE_TMDB_API_KEY` secret
- **Docs:** `README.md` rewrite — feature table, no-key quick start, architecture diagram
- **Docs:** `DEPLOYMENT.md` — Vercel + Render step-by-step guides

### Fixed (Day 3 — 2026-09-28)
- **CI:** `fix(ci)`: restore `getAnimeTimeline()` in JikanService
- **CI:** `fix(ci)`: `TmdbTestController` updated to use `searchMovies()`
- **Copilot fix:** Restored `SpoilerSafeResponse`, `CollectionResult`, `CastMember`, `getMovieById` nullable in TmdbService/JikanService
