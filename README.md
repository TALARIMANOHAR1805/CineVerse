# CineVerse 🎬

> **Pre-watch decision tool for movies & anime** — Search a title, get a spoiler-free "should I watch this" summary, timeline placement, and graph-based discovery.

## Project Structure

```
CineVerse/
├── backend/      ← Spring Boot 3.x (Java 21, Maven) — Core API, Neo4j
├── ml/           ← FastAPI (Python 3.11) — ML/CV services (Phase 4-5)
├── frontend/     ← Vite + React — User interface
└── docker-compose.yml
```

## Quick Start (Local Dev)

### Prerequisites
- Java 21+
- Maven 3.9+
- Python 3.11+
- Node 18+
- Docker + Docker Compose (optional but recommended)

### With Docker Compose (recommended)
```bash
cp backend/.env.example backend/.env      # fill in your secrets
cp ml/.env.example ml/.env
cp frontend/.env.example frontend/.env
docker-compose up
```

### Without Docker
```bash
# Backend
cd backend && mvn spring-boot:run

# ML service
cd ml && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8001

# Frontend
cd frontend && npm install && npm run dev
```

## Health Checks
| Service   | URL                          |
|-----------|------------------------------|
| Backend   | http://localhost:8080/api/health |
| ML        | http://localhost:8001/health |
| Frontend  | http://localhost:5173         |

## Environment Variables
See `.env.example` files in each service directory. **Never commit `.env` files.**

## Phases
- **Phase 0** — Scaffolding, CI, deployment setup ← *you are here*
- **Phase 1** — Search + spoiler-free summaries (TMDB + Jikan)
- **Phase 2** — Timeline placement
- **Phase 3** — Neo4j graph discovery
- **Phase 4-5** — ML/CV features
