## CineVerse — Updated README

<div align="center">

# 🎬 CineVerse

**Should I watch this?**  
Search any movie or anime. Get spoiler-free details, timeline placement, ML recommendations.

[![CI](https://github.com/TALARIMANOHAR1805/CineVerse/actions/workflows/ci.yml/badge.svg)](https://github.com/TALARIMANOHAR1805/CineVerse/actions/workflows/ci.yml)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev)
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203-6DB33F?logo=spring)](https://spring.io)
[![ML](https://img.shields.io/badge/ML-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Movie Search** | Search via TMDB API — title, year, rating, genres, cast |
| 🎌 **Anime Search** | Search via Jikan (MyAnimeList) — no API key needed |
| 🔥 **Trending** | Trending movies this week from TMDB |
| 🌸 **Top Anime** | Currently airing anime from Jikan |
| 📅 **Timeline** | Watch-order placement (backend + Neo4j) |
| 🔖 **Watchlist** | Save items to browser localStorage — no login needed |
| 🤖 **ML Recs** | TF-IDF similarity recommendations (FastAPI) |
| 🎨 **Vibe Match** | Aesthetic colour-based discovery |
| 📡 **Health API** | Liveness, readiness, runtime info endpoints |

---

## 🚀 Quick Start (Local)

### Anime Search works instantly — no setup needed!

```bash
git clone https://github.com/TALARIMANOHAR1805/CineVerse.git
cd CineVerse/frontend
npm install

# Copy env file and add your TMDB key for movie search
cp .env.example .env
# Edit .env → add VITE_TMDB_API_KEY=your_key

npm run dev
# → http://localhost:5173
```

> Get a **free TMDB API key** at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)

### Full stack with Docker

```bash
docker compose up --build
```

---

## 🏗 Architecture

```
Browser (React + Vite)
       │
       ├── TMDB API (direct)    ─── Movie search, trending
       ├── Jikan API (direct)   ─── Anime search, top anime
       │
       └── Spring Boot Backend (optional)
                 │
                 ├── Neo4j AuraDB   ─── Timeline/graph
                 └── FastAPI ML     ─── Recommendations, vibe
```

---

## 📁 Project Structure

```
CineVerse/
├── frontend/     React 18 + Vite (deployed on Vercel)
├── backend/      Spring Boot 3 + Java 21 (Render)
├── ml/           FastAPI + Python 3.11 (Render)
├── .github/      CI/CD workflows
└── docker-compose.yml
```

---

## 📖 Documentation

| Doc | Description |
|-----|-------------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel + Render deploy guide |
| [LOCAL_DEV.md](LOCAL_DEV.md)   | Local setup instructions |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoint docs |
| [ARCHITECTURE.md](ARCHITECTURE.md)  | System design |
| [FAQ.md](FAQ.md)               | Common questions |
| [CHANGELOG.md](CHANGELOG.md)   | Version history |

---

## 👥 Contributors

- **TALARIMANOHAR1805** — Project owner
- **Koushik-31368** — Full-stack improvements, CI/CD, ML pipeline

---

*Movie data from [TMDB](https://www.themoviedb.org) · Anime from [Jikan](https://jikan.moe)*
