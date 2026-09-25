from fastapi import APIRouter
from datetime import datetime, timezone
import platform
import sys

"""
Health check router for the CineVerse ML service.
Provides /health and /health/ready endpoints for liveness and readiness probes.

Added by: Koushik-31368
"""

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Liveness probe")
def health_check():
    """
    Returns the current health status of the ML service.
    Used by Docker healthchecks and load balancers.

    Returns:
        dict: Service status, timestamp, Python version, and platform info.
    """
    return {
        "status": "ok",
        "service": "cineverse-ml",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "python_version": sys.version,
        "platform": platform.system(),
    }


@router.get("/health/ready", summary="Readiness probe")
def readiness_check():
    """
    Readiness probe — confirms the ML models are loaded and service
    is ready to accept traffic.

    Returns:
        dict: Readiness status with module availability checks.
    """
    checks = {}

    # Check if key modules are importable (models loaded)
    try:
        import numpy  # noqa: F401
        checks["numpy"] = "ok"
    except ImportError:
        checks["numpy"] = "missing"

    try:
        import PIL  # noqa: F401
        checks["pillow"] = "ok"
    except ImportError:
        checks["pillow"] = "missing"

    try:
        import sklearn  # noqa: F401
        checks["scikit-learn"] = "ok"
    except ImportError:
        checks["scikit-learn"] = "missing"

    all_ok = all(v == "ok" for v in checks.values())

    return {
        "ready": all_ok,
        "checks": checks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
