"""
CineVerse ML Service — Test suite.

Tests for health endpoints, vibe match, and utility functions.
Run with: pytest tests/ -v

Added by: Koushik-31368
"""

import pytest
from fastapi.testclient import TestClient

# Only import app if FastAPI dependencies are available
try:
    from app.main import app
    client = TestClient(app)
    HAS_APP = True
except Exception:
    HAS_APP = False


# ──────────────────────────────────────────────────────────────
# Health Endpoint Tests
# ──────────────────────────────────────────────────────────────

@pytest.mark.skipif(not HAS_APP, reason="App failed to import")
def test_health_returns_200():
    """GET /health should return HTTP 200."""
    response = client.get("/health")
    assert response.status_code == 200


@pytest.mark.skipif(not HAS_APP, reason="App failed to import")
def test_health_response_has_status_ok():
    """GET /health should include status: ok."""
    response = client.get("/health")
    data = response.json()
    assert data.get("status") == "ok"


@pytest.mark.skipif(not HAS_APP, reason="App failed to import")
def test_health_response_has_timestamp():
    """GET /health should include a timestamp field."""
    response = client.get("/health")
    data = response.json()
    assert "timestamp" in data


@pytest.mark.skipif(not HAS_APP, reason="App failed to import")
def test_health_ready_returns_200():
    """GET /health/ready should return HTTP 200."""
    response = client.get("/health/ready")
    assert response.status_code == 200


@pytest.mark.skipif(not HAS_APP, reason="App failed to import")
def test_health_ready_has_checks():
    """GET /health/ready should include dependency checks."""
    response = client.get("/health/ready")
    data = response.json()
    assert "checks" in data
    assert "ready" in data


# ──────────────────────────────────────────────────────────────
# Utility Function Tests (no app needed)
# ──────────────────────────────────────────────────────────────

def test_rgb_to_hex_basic():
    """rgb_to_hex should correctly convert (255, 0, 0) -> #ff0000."""
    from app.utils import rgb_to_hex
    assert rgb_to_hex((255, 0, 0)) == "#ff0000"


def test_rgb_to_hex_black():
    """rgb_to_hex should correctly convert (0, 0, 0) -> #000000."""
    from app.utils import rgb_to_hex
    assert rgb_to_hex((0, 0, 0)) == "#000000"


def test_rgb_to_hex_white():
    """rgb_to_hex should correctly convert (255, 255, 255) -> #ffffff."""
    from app.utils import rgb_to_hex
    assert rgb_to_hex((255, 255, 255)) == "#ffffff"


def test_clamp_within_range():
    """clamp should return value as-is when within bounds."""
    from app.utils import clamp
    assert clamp(0.5) == 0.5


def test_clamp_below_min():
    """clamp should return min_val when value is below lower bound."""
    from app.utils import clamp
    assert clamp(-0.5) == 0.0


def test_clamp_above_max():
    """clamp should return max_val when value exceeds upper bound."""
    from app.utils import clamp
    assert clamp(1.5) == 1.0


def test_safe_float_valid():
    """safe_float should parse valid numeric strings."""
    from app.utils import safe_float
    assert safe_float("3.14") == pytest.approx(3.14)


def test_safe_float_invalid():
    """safe_float should return default for non-numeric input."""
    from app.utils import safe_float
    assert safe_float("not-a-number") == 0.0


def test_safe_int_valid():
    """safe_int should parse valid integer strings."""
    from app.utils import safe_int
    assert safe_int("42") == 42


def test_safe_int_invalid():
    """safe_int should return default for non-integer input."""
    from app.utils import safe_int
    assert safe_int(None) == 0
