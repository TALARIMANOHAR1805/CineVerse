"""
CineVerse ML Service — Custom exception classes.

Provides structured, consistent error responses for all ML API failures.
Each exception maps to a specific HTTP status code via FastAPI's HTTPException.

Added by: Koushik-31368
"""

from fastapi import HTTPException


class VibeMatchException(HTTPException):
    """Raised when the Vibe Match / poster analysis pipeline fails."""

    def __init__(self, detail: str = "Vibe match analysis failed"):
        super().__init__(status_code=422, detail={"error": "VibeMatchError", "message": detail})


class PosterFetchException(HTTPException):
    """Raised when a movie poster URL cannot be fetched or decoded."""

    def __init__(self, url: str, detail: str = "Could not fetch poster image"):
        super().__init__(
            status_code=502,
            detail={
                "error": "PosterFetchError",
                "message": detail,
                "poster_url": url,
            },
        )


class InvalidToneException(HTTPException):
    """Raised when tone extraction receives an unsupported media type or empty result."""

    def __init__(self, detail: str = "Tone extraction failed — invalid or unsupported input"):
        super().__init__(status_code=422, detail={"error": "InvalidToneError", "message": detail})


class RecommendationException(HTTPException):
    """Raised when the recommendation engine cannot generate results."""

    def __init__(self, detail: str = "Could not generate recommendations"):
        super().__init__(
            status_code=500,
            detail={"error": "RecommendationError", "message": detail},
        )


class ModelNotLoadedException(HTTPException):
    """Raised when an ML model is required but not yet loaded into memory."""

    def __init__(self, model_name: str):
        super().__init__(
            status_code=503,
            detail={
                "error": "ModelNotLoaded",
                "message": f"ML model '{model_name}' is not loaded. Service may still be starting.",
            },
        )
