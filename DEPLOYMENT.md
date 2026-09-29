# CineVerse — Deployment Guide

## 🚀 Deploy Frontend (Vercel — Recommended, Free)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import `TALARIMANOHAR1805/CineVerse`
3. Set **Root Directory** → `frontend`
4. Set **Build Command** → `npm run build`
5. Set **Output Directory** → `dist`
6. Add **Environment Variables**:

   | Variable | Value | Required |
   |----------|-------|----------|
   | `VITE_TMDB_API_KEY` | Your TMDB key from [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) | ✅ For movie search |
   | `VITE_API_BASE_URL` | Your Render backend URL | ❌ Optional |

7. Click **Deploy** → done! ✅

> **Anime search works without any API keys** via Jikan.  
> **Movie search needs VITE_TMDB_API_KEY** (free from TMDB).

---

## 🚀 Deploy Backend (Render — Free Tier)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect `TALARIMANOHAR1805/CineVerse`
3. Set **Root Directory** → `backend`
4. Set **Build Command** → `mvn clean package -DskipTests`
5. Set **Start Command** → `java -jar target/cineverse-backend-0.0.1-SNAPSHOT.jar`
6. Set **Environment** → Java 21
7. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `TMDB_API_KEY` | Your TMDB API key |
   | `SPRING_NEO4J_URI` | `bolt+ssc://xxxx.databases.neo4j.io` |
   | `SPRING_NEO4J_AUTHENTICATION_USERNAME` | `neo4j` |
   | `SPRING_NEO4J_AUTHENTICATION_PASSWORD` | Your password |

---

## 🚀 Deploy ML Service (Render — Free Tier)

1. **New Web Service** → Root Directory → `ml`
2. **Build Command** → `pip install -r requirements.txt`
3. **Start Command** → `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **Environment** → Python 3.11

---

## ✅ Quick Test After Deploy

```bash
# Backend health
curl https://your-backend.onrender.com/api/health

# Search movies
curl "https://your-backend.onrender.com/api/search?q=inception&type=movie"

# ML health
curl https://your-ml.onrender.com/health
```

> **Note:** Render free tier has ~30s cold start on first request.
