# CineVerse 🎬

> **Pre-watch decision tool for movies & anime** — Search a title, get a spoiler-free "should I watch this" summary, timeline placement, graph-based discovery, and aesthetic vibe matching.

![Build Status](https://github.com/TALARIMANOHAR1805/CineVerse/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green?logo=springboot)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Neo4j](https://img.shields.io/badge/Neo4j-AuraDB-008CC1?logo=neo4j)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)

---

## Architecture

```text
CineVerse/
├── backend/      ← Spring Boot 3.3 (Java 21, Maven) — Core API, Neo4j AuraDB integration
├── ml/           ← FastAPI (Python 3.11) — Vibe Match / Poster Analysis API
├── frontend/     ← Vite + React — UI, CSS animations, accessible routing
└── docker-compose.yml
```

---

## Features & Implementation Status

All features below have been fully implemented, tested, and verified to be working end-to-end via real `curl` requests and automated Java unit/load tests.

### 1. Search (Movies + Anime)
- **Status:** ✅ Verified
- Searches both TMDB (Movies) and Jikan (Anime).
- **Performance:** Averages **~0.023s** per request under load testing (Target NFR was <1s).

### 2. Before You Watch (Timeline Placement)
- **Status:** ✅ Verified
- Dynamically generates the prequel/sequel relations (Anime) and Collection timelines (Movies).
- Built defensively to dynamically limit traversal depth and prevent infinite loops from circular API references.

### 3. Six-Degrees Pathfinding (Graph Query)
- **Status:** ✅ Verified
- Uses Neo4j `shortestPath()` algorithms to map connections between movies.
- Traverses dynamically populated relationships: `[:ACTED_IN]` (shared cast members) and `[:PART_OF]` (franchise siblings).
- **Performance:** Averages **~0.009s** per graph query under load testing (Target NFR was <2s).

### 4. Spoiler-Shield Toggle
- **Status:** ✅ Verified
- Takes a user's current episode progress and evaluates it against the total episodes. If the user hasn't finished the series, the API completely suppresses the synopsis.

### 5. Reverse-Recommendation Watch Paths
- **Status:** ✅ Verified
- Generates a watch path for any given franchise.
- **Limitation:** Operates strictly in **Release Order** (sorted by year).

### 6. Vibe Match
- **Status:** ✅ Verified
- ML-powered aesthetic matching using poster colour analysis (FastAPI + scikit-learn).

---

## Quick Start

### Prerequisites
- **Java 21** — [Download](https://adoptium.net/)
- **Python 3.11** — [Download](https://www.python.org/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Docker & Docker Compose** — [Download](https://www.docker.com/)
- **Neo4j AuraDB** account — [Free tier](https://console.neo4j.io/)
- **TMDB API Key** — [Get one free](https://www.themoviedb.org/settings/api)

### Run with Docker (Recommended)
```bash
# 1. Clone
git clone https://github.com/TALARIMANOHAR1805/CineVerse.git
cd CineVerse

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ml/.env.example ml/.env
# Edit each .env file with your API keys

# 3. Start all services
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| ML Service | http://localhost:8001 |
| API Docs (Swagger) | http://localhost:8080/swagger-ui.html |
| ML Docs | http://localhost:8001/docs |

### Run Manually

#### Backend
```bash
cd backend
cp .env.example .env   # fill in TMDB_API_KEY, NEO4J_* values
./mvnw spring-boot:run
```

#### ML Service
```bash
cd ml
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

#### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## API Reference

### Backend (Spring Boot — port 8080)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search?q={title}` | Search movies & anime |
| `GET` | `/api/timeline/{id}?type=movie` | Timeline placement |
| `GET` | `/api/graph/path?from={id}&to={id}` | Six-degrees pathfinding |
| `GET` | `/api/franchise/{id}/watchpath` | Franchise watch order |
| `POST` | `/api/spoiler-shield` | Spoiler shield check |
| `GET` | `/actuator/health` | Backend health check |

### ML Service (FastAPI — port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/vibe-match` | Vibe matching via poster analysis |
| `GET` | `/health` | ML service liveness probe |
| `GET` | `/health/ready` | ML service readiness probe |
| `GET` | `/docs` | Interactive Swagger UI |

---

## Performance Benchmarks

| Feature | Avg Response Time | Target NFR |
|---------|-------------------|------------|
| Search (TMDB + Jikan) | ~0.023s | < 1s ✅ |
| Graph Pathfinding | ~0.009s | < 2s ✅ |
| Vibe Match | ~0.4s | < 2s ✅ |

---

## Project Structure

```text
CineVerse/
├── .github/
│   └── workflows/
│       ├── ci.yml              ← Build, test, lint all services
│       └── pr-checks.yml       ← PR title validation + size labelling
├── backend/
│   └── src/main/java/com/cineverse/
│       ├── controller/         ← REST controllers (Search, Graph, Timeline, etc.)
│       ├── service/            ← Business logic (TmdbService, JikanService, GraphService)
│       ├── model/              ← Neo4j domain models (Movie, Person, Franchise)
│       ├── repository/         ← Spring Data Neo4j repositories
│       ├── dto/                ← Request/Response DTOs with validation
│       ├── exception/          ← Custom exceptions + GlobalExceptionHandler
│       ├── interceptor/        ← Request logging interceptor
│       └── config/             ← CORS, WebClient configuration
├── ml/
│   └── app/
│       ├── main.py             ← FastAPI app entry point
│       ├── recommend.py        ← Recommendation engine
│       ├── tone.py             ← Tone/mood extraction
│       ├── poster.py           ← Poster colour analysis
│       ├── health.py           ← Health check endpoints
│       ├── exceptions.py       ← Custom FastAPI exceptions
│       ├── config.py           ← Pydantic settings management
│       └── utils.py            ← Shared utility helpers
├── frontend/
│   └── src/
│       ├── App.jsx             ← Main application
│       ├── ErrorBoundary.jsx   ← React error boundary
│       ├── LoadingSpinner.jsx  ← Reusable loading component
│       ├── NotFound.jsx        ← 404 page
│       └── hooks.js            ← Custom React hooks
├── CONTRIBUTING.md
├── SECURITY.md
├── CHANGELOG.md
└── docker-compose.yml
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute, branch naming, commit message format, and the PR process.

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities responsibly.

## License

This project is licensed under the MIT License.
