"""
CineVerse ML — Poster colour schema and validation models.

Defines Pydantic models for the /poster/analyze endpoint
to ensure consistent request/response contracts.

Added by: Koushik-31368
"""

from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional


class PosterAnalyzeRequest(BaseModel):
    """
    Request body for POST /poster/analyze.

    Attributes:
        posterUrl: A valid HTTPS image URL pointing to a movie/anime poster.
    """
    posterUrl: str

    @field_validator("posterUrl")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith("http"):
            raise ValueError("posterUrl must be a valid HTTP/HTTPS URL")
        return v.strip()


class ColourEntry(BaseModel):
    """
    A single dominant colour extracted from a poster image.

    Attributes:
        hex:        Hex string, e.g. '#f72585'
        rgb:        RGB tuple [R, G, B]
        percentage: Approximate share of this colour in the image (0.0–1.0)
    """
    hex: str
    rgb: list[int]
    percentage: float


class PosterAnalyzeResponse(BaseModel):
    """
    Response body for POST /poster/analyze.

    Attributes:
        dominantColor:  Hex of the single most dominant colour.
        palette:        Top-N colours extracted from the poster.
        posterUrl:      The original URL that was analysed.
    """
    dominantColor: Optional[str] = None
    palette: list[ColourEntry] = []
    posterUrl: str


class VibeDiscoverResponse(BaseModel):
    """
    Response body for GET /discover/vibe/{vibe}.

    Attributes:
        vibe:    The requested vibe identifier.
        results: List of matching media items.
        total:   Total number of results returned.
    """
    vibe: str
    results: list[dict] = []
    total: int = 0
