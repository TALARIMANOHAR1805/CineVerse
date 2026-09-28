"""
CineVerse ML — Dependency injection router for /api/ml endpoints.
Centralises all ML feature endpoints with consistent error handling.

Router file: app/router.py
Added by: Koushik-31368
"""

import logging
import httpx
from fastapi import APIRouter, HTTPException
from app.schemas import PosterAnalyzeRequest, PosterAnalyzeResponse, VibeDiscoverResponse
from app.cache import ml_cache
from app.utils import rgb_to_hex, clamp, safe_float

logger = logging.getLogger("cineverse.ml.router")

router = APIRouter(prefix="/api/ml", tags=["ML"])


# ──────────────────────────────────────────────────────────────
# POST /api/ml/poster/analyze
# ──────────────────────────────────────────────────────────────

@router.post("/poster/analyze", response_model=PosterAnalyzeResponse)
async def analyze_poster(request: PosterAnalyzeRequest):
    """
    Analyse a movie poster image and extract its dominant colours.

    - Checks the in-memory cache before downloading the image.
    - Returns the dominant hex colour and a small colour palette.
    """
    cache_key = f"poster:{request.posterUrl}"
    cached = ml_cache.get(cache_key)
    if cached:
        logger.debug("Cache HIT for poster: %s", request.posterUrl)
        return cached

    try:
        # Try to import PIL; fall back to a placeholder if not available
        from PIL import Image
        import io
        import colorsys

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(request.posterUrl, follow_redirects=True)
            resp.raise_for_status()

        img = Image.open(io.BytesIO(resp.content)).convert("RGB")
        img.thumbnail((80, 120))  # shrink for fast analysis

        # Count pixel colours
        pixels = list(img.getdata())
        colour_counts: dict[tuple, int] = {}
        for px in pixels:
            colour_counts[px] = colour_counts.get(px, 0) + 1

        total = len(pixels)
        top_colours = sorted(colour_counts.items(), key=lambda x: -x[1])[:5]
        palette = [
            {"hex": rgb_to_hex(rgb), "rgb": list(rgb), "percentage": round(count / total, 3)}
            for rgb, count in top_colours
        ]
        dominant = palette[0]["hex"] if palette else None

        result = PosterAnalyzeResponse(
            dominantColor=dominant,
            palette=palette,
            posterUrl=request.posterUrl,
        )
        ml_cache.set(cache_key, result, ttl=3600)
        return result

    except ImportError:
        # PIL not installed — return a best-effort placeholder
        logger.warning("Pillow not installed; returning placeholder colour")
        result = PosterAnalyzeResponse(
            dominantColor="#7c6fff",
            palette=[],
            posterUrl=request.posterUrl,
        )
        ml_cache.set(cache_key, result, ttl=300)
        return result

    except Exception as exc:
        logger.error("Poster analysis failed for %s: %s", request.posterUrl, exc)
        raise HTTPException(status_code=502, detail=f"Failed to analyse poster: {exc}")


# ──────────────────────────────────────────────────────────────
# POST /api/ml/recommend
# ──────────────────────────────────────────────────────────────

@router.post("/recommend")
async def recommend(payload: dict):
    """
    Return ML recommendations similar to the provided title.
    Placeholder — returns empty list until the TF-IDF model is wired.
    """
    title = payload.get("title", "")
    limit = int(payload.get("limit", 8))
    logger.info("Recommend request for: %s (limit=%d)", title, limit)
    return {"recommendations": [], "query": title}


# ──────────────────────────────────────────────────────────────
# GET /api/ml/discover/vibe/{vibe}
# ──────────────────────────────────────────────────────────────

VALID_VIBES = {"dark", "moody", "intense", "vibrant", "neutral", "bright", "energetic"}

@router.get("/discover/vibe/{vibe}", response_model=VibeDiscoverResponse)
async def discover_by_vibe(vibe: str):
    """
    Return movies matching the given aesthetic vibe.
    Placeholder — returns empty results until colour-cluster model is loaded.
    """
    if vibe not in VALID_VIBES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown vibe '{vibe}'. Valid options: {sorted(VALID_VIBES)}"
        )
    logger.info("Vibe discovery requested: %s", vibe)
    return VibeDiscoverResponse(vibe=vibe, results=[], total=0)
