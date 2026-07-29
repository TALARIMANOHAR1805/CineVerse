"""
cineverse-ml — FastAPI skeleton service.

Phase 0: health-check only.
Phase 4-5: will add ML/CV endpoints (poster analysis, embeddings, etc.)
"""

from fastapi import FastAPI
from datetime import datetime, timezone

app = FastAPI(
    title="CineVerse ML Service",
    description="Machine learning and computer vision service for CineVerse",
    version="0.0.1",
)


@app.get("/health")
async def health():
    """
    Health check endpoint.
    Returns service status and current UTC timestamp.
    Called by Docker health checks and CI smoke tests.
    """
    return {
        "status": "UP",
        "service": "cineverse-ml",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint — returns a welcome message."""
    return {"message": "CineVerse ML Service is running. See /docs for API."}
