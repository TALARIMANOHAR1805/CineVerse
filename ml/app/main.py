"""
CineVerse ML — main.py v2

FastAPI application entry point.
Registers the ML router and health endpoints.

Author: Koushik-31368
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.logging_config import configure_logging
from app.router import router
import os

configure_logging()
logger = logging.getLogger("cineverse.ml")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    logger.info("CineVerse ML service starting up")
    yield
    logger.info("CineVerse ML service shutting down")


app = FastAPI(
    title="CineVerse ML Service",
    description="Poster colour analysis, vibe discovery, and recommendation API",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,https://cineverse-frontend.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ────────────────────────────────────────────────────
app.include_router(router)


@app.get("/health", tags=["Health"])
async def health():
    """Liveness probe."""
    return {"status": "ok", "service": "cineverse-ml"}


@app.get("/health/ready", tags=["Health"])
async def ready():
    """Readiness probe."""
    return {"ready": True}
