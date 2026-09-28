## CineVerse — Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CineVerse Architecture                     │
└─────────────────────────────────────────────────────────────┘

                     ┌──────────────┐
                     │   Browser    │
                     │  React + Vite│
                     │  (Vercel)    │
                     └──────┬───────┘
                            │ REST (HTTPS)
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │  Spring Boot│  │   FastAPI   │  │  TMDB API   │
   │  Backend    │  │  ML Service │  │  (External) │
   │  (Render)   │  │  (Render)   │  └─────────────┘
   └──────┬──────┘  └──────┬──────┘
          │                │          ┌─────────────┐
          │                └─────────▶│  Jikan API  │
          │ Bolt (TLS)                │  (External) │
          ▼                           └─────────────┘
   ┌─────────────┐
   │  Neo4j      │
   │  AuraDB     │
   │  (Cloud)    │
   └─────────────┘
```

## Data Flow

### Search Request
1. User types query in React frontend
2. Frontend calls `GET /api/search?q=...&type=movie`
3. Spring Boot checks **CacheService** (in-memory TTL)
4. Cache miss → calls **TMDB API** (for movies) or **Jikan** (for anime)
5. Results stored in cache (10 min TTL) and returned
6. Frontend renders MediaCard grid with bookmark buttons

### Timeline Request
1. User clicks a MediaCard
2. Detail panel opens with **Synopsis** tab (immediate — no API call)
3. User clicks **Timeline** tab → `GET /api/timeline/movie/{id}`
4. Spring Boot queries **Neo4j graph** for franchise entry ordering
5. Timeline rendered as a horizontal scroll strip

### Vibe Match
1. User clicks a vibe button (e.g. "Dark & Gritty")
2. Frontend calls `GET /api/ml/discover/vibe/dark`
3. FastAPI ML service returns movies matching that aesthetic palette
4. Results shown in the same MediaCard grid

### ML Poster Analysis
1. Detail panel fetches `POST /api/ml/poster/analyze`
2. FastAPI downloads the poster image (cached after first call)
3. PIL extracts dominant colour → returned as hex string
4. Frontend tints the detail panel background with that colour

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Neo4j for timeline | Graph DB naturally represents franchise/sequel ordering relationships |
| In-memory cache (not Redis) | Sufficient for single-instance deploy; zero infra cost |
| FastAPI for ML | Python ecosystem for PIL/sklearn; async for concurrent poster analysis |
| Jikan for anime | Free, no API key needed; covers 90%+ of MyAnimeList catalogue |
| localStorage for watchlist | No login required; works offline; zero backend cost |
