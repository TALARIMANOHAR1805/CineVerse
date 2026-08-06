"""
recommend.py — Phase 4: Content-based recommendation engine.

Strategy:
  1. Fetches movie search results from TMDB (via the Spring Boot backend)
  2. Builds a TF-IDF matrix from synopses + genre text
  3. Computes cosine similarity to the seed movie
  4. Returns top-N similar movies

This runs entirely in-memory (no model file), so it's stateless and
works immediately without training.
"""

import os
import asyncio
import httpx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.poster import analyze_poster

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8080/api")
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"


async def get_recommendations(
    seed_title: str,
    seed_synopsis: str,
    seed_genres: list[str],
    limit: int = 8,
) -> list[dict]:
    """
    Given a seed movie, finds similar movies using TF-IDF + cosine similarity
    on synopsis text and genre overlap.
    """
    # Fetch candidates: search TMDB for movies with similar keywords
    candidates = await _fetch_candidates(seed_title)
    if not candidates:
        return []

    # Build corpus: seed + candidates
    seed_text = _build_text(seed_synopsis, seed_genres)
    corpus = [seed_text]
    for c in candidates:
        corpus.append(_build_text(c.get("overview", ""), c.get("genre_names", [])))

    # TF-IDF vectorize
    vectorizer = TfidfVectorizer(
        stop_words="english",
        max_features=5000,
        ngram_range=(1, 2),
    )
    tfidf_matrix = vectorizer.fit_transform(corpus)

    # Cosine similarity of seed (index 0) vs all candidates
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

    # Rank and return top results
    scored = list(zip(candidates, similarities))
    scored.sort(key=lambda x: x[1], reverse=True)

    results = []
    for candidate, score in scored[:limit]:
        if score < 0.01:
            continue  # skip irrelevant results
        results.append({
            "id": str(candidate.get("id", "")),
            "title": candidate.get("title", ""),
            "year": _extract_year(candidate.get("release_date", "")),
            "synopsis": candidate.get("overview", ""),
            "posterUrl": _poster_url(candidate.get("poster_path")),
            "rating": round(candidate.get("vote_average", 0), 1),
            "genres": candidate.get("genre_names", []),
            "similarityScore": round(float(score), 3),
        })

    return results


def _build_text(synopsis: str, genres: list[str]) -> str:
    """Combine synopsis and genres into a single text blob for TF-IDF."""
    genre_text = " ".join(genres) if genres else ""
    # Weight genres by repeating them (boosts genre matching)
    return f"{synopsis} {genre_text} {genre_text} {genre_text}"


async def _fetch_candidates(seed_title: str) -> list[dict]:
    """
    Fetches candidate movies from TMDB.
    Uses the first word of the title as a broad search, plus
    genre-based discovery via /discover/movie.
    """
    candidates = []
    genre_map = await _get_genre_map()

    async with httpx.AsyncClient(timeout=15) as client:
        # Strategy 1: Search by first meaningful word
        words = seed_title.split()
        query = words[0] if words else seed_title
        try:
            resp = await client.get(
                f"{TMDB_BASE}/search/movie",
                params={"query": query, "api_key": TMDB_API_KEY, "include_adult": False},
            )
            if resp.status_code == 200:
                data = resp.json()
                for m in data.get("results", [])[:15]:
                    m["genre_names"] = [genre_map.get(gid, "") for gid in m.get("genre_ids", [])]
                    candidates.append(m)
        except Exception:
            pass

        # Strategy 2: Broader search with full title
        try:
            resp = await client.get(
                f"{TMDB_BASE}/search/movie",
                params={"query": seed_title, "api_key": TMDB_API_KEY, "include_adult": False},
            )
            if resp.status_code == 200:
                data = resp.json()
                seen_ids = {c["id"] for c in candidates}
                for m in data.get("results", [])[:10]:
                    if m["id"] not in seen_ids:
                        m["genre_names"] = [genre_map.get(gid, "") for gid in m.get("genre_ids", [])]
                        candidates.append(m)
        except Exception:
            pass

    return candidates


async def _get_genre_map() -> dict[int, str]:
    """Fetch TMDB genre id → name mapping."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{TMDB_BASE}/genre/movie/list",
                params={"api_key": TMDB_API_KEY},
            )
            if resp.status_code == 200:
                return {g["id"]: g["name"] for g in resp.json().get("genres", [])}
    except Exception:
        pass
    return {}


def _extract_year(date_str: str) -> str:
    return date_str[:4] if date_str and len(date_str) >= 4 else "—"


def _poster_url(path: str | None) -> str | None:
    return f"https://image.tmdb.org/t/p/w500{path}" if path else None

async def discover_movies_by_vibe(vibe: str, limit: int = 12) -> list[dict]:
    """
    Fetches trending/popular movies, analyzes their posters concurrently,
    and filters them by the requested visual vibe.
    """
    candidates = []
    genre_map = await _get_genre_map()
    
    # Fetch a larger pool of trending movies to ensure we get enough matches
    async with httpx.AsyncClient(timeout=15) as client:
        for page in range(1, 4):
            try:
                resp = await client.get(
                    f"{TMDB_BASE}/trending/movie/week",
                    params={"api_key": TMDB_API_KEY, "page": page},
                )
                if resp.status_code == 200:
                    data = resp.json()
                    for m in data.get("results", []):
                        if m.get("poster_path"):
                            m["genre_names"] = [genre_map.get(gid, "") for gid in m.get("genre_ids", [])]
                            candidates.append(m)
            except Exception:
                pass
                
    # Define a helper for concurrent analysis
    async def _analyze_and_filter(m: dict) -> dict | None:
        p_url = _poster_url(m.get("poster_path"))
        if not p_url: return None
        analysis = await analyze_poster(p_url)
        if analysis.get("vibe") == vibe:
            return {
                "id": str(m.get("id", "")),
                "type": "movie",
                "title": m.get("title", ""),
                "year": _extract_year(m.get("release_date", "")),
                "synopsis": m.get("overview", ""),
                "posterUrl": p_url,
                "rating": round(m.get("vote_average", 0), 1),
                "genres": m.get("genre_names", []),
                "dominantColor": analysis.get("dominantColor"),
            }
        return None

    # Run analysis concurrently
    tasks = [_analyze_and_filter(m) for m in candidates]
    results = await asyncio.gather(*tasks)
    
    # Filter out None and return up to `limit`
    valid_results = [r for r in results if r is not None]
    return valid_results[:limit]
