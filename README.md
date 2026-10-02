# CineVerse — Professional Movie & Anime Discovery Platform

<div align="center">

![CineVerse Logo](https://img.shields.io/badge/🎬_CineVerse-Premium_Discovery-7c6fff?style=for-the-badge&labelColor=080b14)

[![CI](https://github.com/TALARIMANOHAR1805/CineVerse/actions/workflows/ci.yml/badge.svg)](https://github.com/TALARIMANOHAR1805/CineVerse/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-7c6fff?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)](https://vitejs.dev)

**Search millions of movies and anime. Find where to stream. Build your watchlist.**

[Live Demo](https://cineverse-frontend.vercel.app) · [Report Bug](https://github.com/TALARIMANOHAR1805/CineVerse/issues) · [Request Feature](https://github.com/TALARIMANOHAR1805/CineVerse/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **Universal Search** | Search movies and anime simultaneously via TMDB + Jikan APIs |
| 🔥 **Trending** | Live trending movies and top anime on the homepage |
| 🧭 **Discover** | Browse by category (Popular / Top Rated / In Theaters) and 13+ genres |
| 📺 **Watch Where** | Find streaming providers via JustWatch / TMDB data |
| 📚 **Watchlist** | Save titles, mark as watched, track progress — persisted in localStorage |
| 📊 **Stats Dashboard** | Visual stats: Total / Movies / Anime / Watched / Progress bar |
| 🎭 **Detail Panel** | Slide-in sidebar with poster, genres, overview, similar titles, timeline |
| ⌨️ **Keyboard Shortcuts** | `H` Home · `D` Discover · `W` Watchlist · `/` Search · `Esc` Close |
| 🌙 **Dark Mode** | Premium dark UI with glassmorphism, gradients, and micro-animations |

---

## 🏗️ Architecture

```
CineVerse/
├── frontend/          # React 18 + Vite 5 SPA
│   ├── src/
│   │   ├── App.jsx              # Main app + MediaCard + DetailPanel + Navbar
│   │   ├── DiscoverPage.jsx     # Browse by category + genre
│   │   ├── WatchlistPage.jsx    # Saved list with stats dashboard
│   │   ├── WatchlistContext.jsx # Global state (React Context + localStorage)
│   │   ├── api.js               # Unified API layer (TMDB + Jikan)
│   │   ├── index.css            # Professional design system v6
│   │   └── ...hooks, components
│   └── vite.config.js
├── backend/           # Spring Boot REST API (optional)
│   └── src/main/java/...
├── ml/                # FastAPI ML service
│   ├── app/
│   │   ├── genre_classifier.py  # Genre scoring
│   │   ├── mood_analyzer.py     # Mood detection
│   │   ├── recommender.py       # Recommendation engine
│   │   └── vibe_engine.py       # Vibe-based search
│   └── tests/         # 80+ unit tests
└── .github/workflows/ # CI/CD pipelines
```

---

## 🚀 Getting Started

### Frontend (No backend needed!)

```bash
cd frontend
npm install
# Optional: add TMDB key for full features
echo "VITE_TMDB_API_KEY=your_key_here" > .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

> **Note:** Without a TMDB API key, anime search (via Jikan) still works. Get a free key at [themoviedb.org](https://www.themoviedb.org/settings/api).

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.arguments="--tmdb.api.key=YOUR_KEY"
```

### ML Service (FastAPI)

```bash
cd ml
pip install -r requirements.txt
uvicorn app.main:app --reload
# Tests:
pytest tests/ -v
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `H` | Go to Home |
| `D` | Go to Discover |
| `W` | Go to Watchlist |
| `Esc` | Close detail panel |

---

## 🛠️ Tech Stack

**Frontend**
- React 18, Vite 5, vanilla CSS
- TMDB API (movies), Jikan API (anime)
- JustWatch via TMDB watch/providers endpoint

**Backend** (optional)
- Spring Boot 3, Java 21
- TMDB REST integration, franchise timeline logic

**ML Service** (optional)
- FastAPI, Python 3.12
- Genre classifier, mood analyzer, vibe-based recommendations

**CI/CD**
- GitHub Actions: lint, test, build
- Vercel (frontend), Railway/Render (backend + ML)

---

## 📋 Development Journal

| Day | Focus | Commits |
|-----|-------|---------|
| Day 1 | Project setup, CI/CD, basic search | 10 |
| Day 2 | Watchlist, localStorage, TMDB integration | 15 |
| Day 3 | Anime search (Jikan), detail panel, timeline | 20 |
| Day 4 | Backend Spring Boot, ML FastAPI foundation | 18 |
| Day 5 | Discover page, watch providers, similar titles | 25 |
| Day 6 | **Professional redesign, design system v6** | **20+** |

---

## 📜 License

MIT © [CineVerse Contributors](https://github.com/TALARIMANOHAR1805/CineVerse)

---

<div align="center">
  <sub>Movie data powered by <a href="https://www.themoviedb.org">TMDB</a> · Anime data by <a href="https://jikan.moe">Jikan/MAL</a></sub>
</div>
