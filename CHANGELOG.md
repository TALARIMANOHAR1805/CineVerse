# Changelog 📝

All notable changes to CineVerse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `CONTRIBUTING.md` — contributor guidelines and setup instructions
- `SECURITY.md` — security policy and vulnerability reporting
- `CHANGELOG.md` — this file, for tracking version history
- `.env.example` files for all services (backend, frontend, ml)
- GitHub Actions CI/CD workflow
- `LoadingSpinner` React component for async state feedback
- `ErrorBoundary` React component for graceful error handling
- `NotFound` (404) React page
- `GlobalExceptionHandler` in Spring Boot backend
- Health check endpoint at `/api/health`
- Input validation annotations on backend DTOs
- API rate limiting configuration
- Structured logging with request/response interceptor
- `/health` endpoint in FastAPI ML service
- Improved error responses in ML service
- Docstrings added to all ML service functions
- Docker healthcheck configurations in `docker-compose.yml`

### Changed
- Improved `README.md` with badges, setup guide, and API docs
- Refactored frontend components for better code reuse

### Fixed
- Edge case null handling in graph traversal
- Spoiler shield endpoint input validation

---

## [1.0.0] - 2026-09-01

### Added
- Initial full-stack implementation
- Search for Movies and Anime (TMDB + Jikan APIs)
- Before You Watch — prequel/sequel timeline placement
- Six-Degrees Pathfinding using Neo4j `shortestPath()`
- Spoiler-Shield Toggle for anime episode progress
- Reverse-Recommendation Watch Paths
- Vibe Match with poster color analysis (FastAPI + ML)
- Docker Compose setup for all services
- Render.yaml deployment configuration
- Spring Boot load tests (avg ~0.023s per request)
- Neo4j graph query performance (avg ~0.009s per query)
