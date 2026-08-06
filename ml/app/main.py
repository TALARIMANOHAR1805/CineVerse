"""
cineverse-ml — FastAPI ML Service  (Phase 4)

Endpoints:
  GET  /health                     → service health check
  POST /api/ml/recommend           → content-based movie recommendations
  POST /api/ml/poster/analyze      → poster image analysis (colors, mood)
  GET  /api/ml/vibe/{vibe}         → discover movies by visual vibe
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

from app.recommend import get_recommendations, discover_movies_by_vibe
from app.poster import analyze_poster

app = FastAPI(
    title="CineVerse ML Service",
    description="Machine learning, recommendations, and computer vision for CineVerse",
    version="0.4.0",
)

# CORS — allow frontend + backend to call this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://cine-verse-khaki.vercel.app",
        os.getenv("CORS_ALLOWED_ORIGINS", ""),
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────

class RecommendRequest(BaseModel):
    title: str
    synopsis: str = ""
    genres: list[str] = []
    limit: int = 8


class PosterAnalyzeRequest(BaseModel):
    posterUrl: str


# ── Endpoints ───────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "UP",
        "service": "cineverse-ml",
        "version": "0.4.0",
        "features": ["recommendations", "poster-analysis"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    return {"message": "CineVerse ML Service v0.4.0. See /docs for API."}


@app.post("/api/ml/recommend")
async def recommend(req: RecommendRequest):
    """
    Content-based movie recommendations.
    
    Takes a seed movie (title + synopsis + genres) and returns
    similar movies ranked by TF-IDF cosine similarity.
    """
    try:
        results = await get_recommendations(
            seed_title=req.title,
            seed_synopsis=req.synopsis,
            seed_genres=req.genres,
            limit=req.limit,
        )
        return {
            "seedTitle": req.title,
            "recommendations": results,
            "count": len(results),
            "algorithm": "tfidf-cosine",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ml/poster/analyze")
async def poster_analyze(req: PosterAnalyzeRequest):
    """
    Analyze a movie poster image.
    
    Extracts dominant color, 5-color palette, brightness,
    and mood classification.
    """
    if not req.posterUrl:
        raise HTTPException(status_code=400, detail="posterUrl is required")

    result = await analyze_poster(req.posterUrl)
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])

    return result


@app.get("/api/ml/vibe/{vibe}")
async def vibe_info(vibe: str):
    """
    Returns the vibe classification info.
    Available vibes: dark, moody, intense, vibrant, neutral, bright, energetic.
    """
    valid_vibes = ["dark", "moody", "intense", "vibrant", "neutral", "bright", "energetic"]
    if vibe.lower() not in valid_vibes:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown vibe '{vibe}'. Valid: {', '.join(valid_vibes)}"
        )
    return {
        "vibe": vibe.lower(),
        "description": _vibe_description(vibe.lower()),
        "validVibes": valid_vibes,
    }

@app.get("/api/ml/discover/vibe/{vibe}")
async def discover_by_vibe(vibe: str):
    """
    Returns movies matching the specified visual vibe.
    """
    valid_vibes = ["dark", "moody", "intense", "vibrant", "neutral", "bright", "energetic"]
    if vibe.lower() not in valid_vibes:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown vibe '{vibe}'. Valid: {', '.join(valid_vibes)}"
        )
    try:
        movies = await discover_movies_by_vibe(vibe.lower(), limit=12)
        return {
            "vibe": vibe.lower(),
            "description": _vibe_description(vibe.lower()),
            "count": len(movies),
            "results": movies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _vibe_description(vibe: str) -> str:
    return {
        "dark": "Films with dark, shadowy posters — thrillers, horror, noir",
        "moody": "Low-key, atmospheric visuals — drama, mystery",
        "intense": "Dark but saturated — action, war, intense drama",
        "vibrant": "Rich, colorful imagery — adventure, animation, comedy",
        "neutral": "Balanced tones — drama, biographical, indie",
        "bright": "Light, pastel tones — romance, family, feel-good",
        "energetic": "Bright and highly saturated — action-comedy, animation, superhero",
    }.get(vibe, "")

