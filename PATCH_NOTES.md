## CineVerse — Day 5 Patch Notes

### Hotfix (2026-09-29)

- **fix(ml):** `test_ml.py` — updated `clamp()` calls to 3-argument form `(value, lo, hi)`, replaced non-existent `safe_int` with `safe_float` tests
- **fix(ci):** `dependency-review.yml` — pre-check for Dependency Graph availability; skip gracefully instead of hard-failing
- **fix(ci):** `vite.config.js` — `manualChunks` changed to function form (Rollup requirement)
- **fix(ci):** `requirements.txt` — removed invalid Python docstring, added `pytest` and `pytest-asyncio`
- **fix(ci):** `index.html` — removed JS comment before DOCTYPE declaration
- **feat(ml):** `pytest.ini` added for test discovery configuration

### Day 4 Summary (2026-09-29)

- **Search fixed** — `api.js` calls TMDB + Jikan directly; backend optional
- **Trending homepage** — shows trending movies + top airing anime on load
- **Detail panel** — cast, trailer link, episodes, studios, tagline
- All 12 frontend components updated to v2
- 30 commits total on `koushik/day4-working-search`
