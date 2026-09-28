## CineVerse — API Reference

**Base URL:** `https://cineverse-backend.onrender.com/api`  
**Content-Type:** `application/json`  
**Response Wrapper:** All responses follow `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "timestamp": "2026-09-28T14:00:00Z"
}
```

---

### Health

#### `GET /health`
Liveness probe.

**Response:**
```json
{
  "data": {
    "status": "UP",
    "service": "cineverse-backend",
    "version": "1.0.0",
    "timestamp": "2026-09-28T14:00:00Z"
  }
}
```

#### `GET /health/info`
Runtime details (uptime, memory, Java version).

---

### Search

#### `GET /search?q={query}&type={all|movie|anime}`
Unified search across TMDB and Jikan.

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q`   | string | ✅ | — | Search query |
| `type` | string | ❌ | `all` | Filter: `all`, `movie`, `anime` |

**Example:** `GET /search?q=inception&type=movie`

**Response:**
```json
{
  "data": {
    "query": "inception",
    "type": "movie",
    "movies": [
      {
        "id": 27205,
        "title": "Inception",
        "year": "2010",
        "rating": 8.4,
        "posterUrl": "https://image.tmdb.org/t/p/w500/...",
        "type": "movie",
        "synopsis": "...",
        "genres": ["Action", "Sci-Fi", "Thriller"]
      }
    ],
    "anime": [],
    "total": 1
  }
}
```

#### `GET /search/movies?q={query}`
Movie-only shortcut.

#### `GET /search/anime?q={query}`
Anime-only shortcut.

---

### Admin

#### `GET /admin/cache/stats`
Returns current in-memory cache size.

#### `POST /admin/cache/clear`
Clears all cached API responses.

---

### ML Service

**ML Base URL:** `https://cineverse-ml.onrender.com/api/ml`

#### `POST /poster/analyze`
Extract dominant colour from a poster image.

**Request:**
```json
{ "posterUrl": "https://image.tmdb.org/t/p/w500/abc.jpg" }
```

**Response:**
```json
{
  "dominantColor": "#1a1a2e",
  "palette": [
    { "hex": "#1a1a2e", "rgb": [26, 26, 46], "percentage": 0.38 }
  ],
  "posterUrl": "https://..."
}
```

#### `GET /discover/vibe/{vibe}`
Returns movies matching the aesthetic vibe.

**Valid vibes:** `dark`, `moody`, `intense`, `vibrant`, `neutral`, `bright`, `energetic`

#### `POST /recommend`
TF-IDF based movie recommendations.

**Request:**
```json
{
  "title": "Inception",
  "synopsis": "...",
  "genres": ["Sci-Fi", "Action"],
  "limit": 8
}
```
