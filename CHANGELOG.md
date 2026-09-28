## [Unreleased]

### Added (Day 3 — 2026-09-28)
- **Frontend:** Full App.jsx v3 overhaul — integrated WatchlistContext, Toast, Skeleton, Footer, Navbar with live watchlist count badge
- **Frontend:** Bookmark (+ Save) button on every MediaCard and in the detail panel header
- **Frontend:** Skeleton loading grid (`<SkeletonGrid>`) replaces plain spinner during search
- **Frontend:** Escape key closes the detail panel
- **Frontend:** Retry button shown on search error state
- **Frontend:** Keyboard `/` shortcut focuses the search input from anywhere
- **Frontend:** Clear (✕) button inside search input to reset query
- **Frontend:** Lazy timeline loading — only fetched when Timeline tab is opened
- **Frontend:** Poster dominant colour displayed in the Details tab
- **App.css v3:** Complete CSS rewrite — card bookmark button, mobile responsive, graph/vibe sections, panel animations
- **Backend:** `CacheController` — admin endpoints `/api/admin/cache/stats` and `/api/admin/cache/clear`
- **Backend:** `SearchResponseDTO` — strongly-typed search response model
- **ML:** `schemas.py` — Pydantic models for `PosterAnalyzeRequest/Response` and `VibeDiscoverResponse`
- **ML:** `cache.py` — thread-safe TTL `MLCache` singleton with eviction, clear, and size
- **ML:** `logging_config.py` — centralised structured logging setup
- **ML:** `test_cache_and_schemas.py` — 11 new unit tests for cache TTL and schema validation
- **Docs:** `FAQ.md` — answers to 8 common user questions

### Fixed (Day 2 — 2026-09-27)
- **CI:** Replace `./mvnw` with system `mvn` — fixes `ClassNotFoundException: MavenWrapperMain`
- **Backend:** Rename `WebConfig.java` → `WebMvcConfig.java` to match public class name
- **Backend:** Add `spring-boot-starter-validation` to `pom.xml` for `jakarta.validation` support
- **gitignore:** Un-ignore `maven-wrapper.jar` (commented out) to allow CI to use wrapper

### Added (Day 2 — 2026-09-27)
- **CI:** Fixed `ci.yml` — use `setup-java@v4`, `chmod +x mvnw`, `continue-on-error` for DB-dependent tests
- **Frontend:** `index.css` v2 — skeleton shimmer, toast, scrollbar, utility classes, animations
- **Frontend:** `Toast.jsx` — event-bus toast notification system
- **Frontend:** `Skeleton.jsx` — SkeletonCard / SkeletonGrid / SkeletonDetail
- **Frontend:** `SearchBar.jsx` — type filter tabs, keyboard shortcut, clear button, loading spinner
- **Frontend:** `Navbar.jsx` — live API health dot, scroll-aware blur, GitHub link
- **Frontend:** `Footer.jsx` — tech stack chips, external links
- **Frontend:** `WatchlistContext.jsx` — global React Context + localStorage watchlist
- **Frontend:** `WatchlistPage.jsx` — saved items grid with remove/clear
- **Backend:** `WebMvcConfig.java` — CORS + interceptor registration via `WebMvcConfigurer`
- **Backend:** Enhanced `HealthController` — `/api/health/info` with uptime, memory, JVM version
- **Backend:** `CacheService.java` — thread-safe TTL in-memory cache
- **Backend:** `ScheduledTaskService.java` — cache cleanup and heartbeat jobs
- **ML:** `middleware.py` — ASGI request logging middleware
- **ML:** `tests/test_ml.py` — 12 pytest unit tests
- **Docker:** `docker-compose.yml` — healthchecks, restart policies, shared network

### Added (Day 1 — 2026-09-25)
- **Docs:** Rewrote `README.md` with badges, quick-start, API reference, benchmarks
- **Docs:** Added `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`
- **CI/CD:** Added `ci.yml` workflow (Backend / ML / Frontend) and `pr-checks.yml`
- **Backend:** `GlobalExceptionHandler`, `ResourceNotFoundException`, `ExternalApiException`
- **Backend:** `SearchRequestDTO`, `ApiResponse<T>` wrapper
- **Backend:** `RequestLoggingInterceptor`
- **Frontend:** `NotFound.jsx`, `ErrorBoundary.jsx`, `LoadingSpinner.jsx`, `hooks.js`
- **ML:** Health endpoints `/health`, `/health/ready`; `config.py`, `exceptions.py`, `utils.py`
