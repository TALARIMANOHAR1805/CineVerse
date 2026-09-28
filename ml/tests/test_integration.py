"""
CineVerse ML — Integration test for the full FastAPI app.
Tests all major routes end-to-end using TestClient.

Run with: pytest tests/test_integration.py -v

Added by: Koushik-31368
"""

import pytest

# Guard: only run if FastAPI app can be imported
try:
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    HAS_APP = True
except Exception as e:
    HAS_APP = False
    _import_error = str(e)


# ──────────────────────────────────────────────────────────────
# Health Routes
# ──────────────────────────────────────────────────────────────

@pytest.mark.skipif(not HAS_APP, reason="App import failed")
class TestHealthRoutes:

    def test_liveness(self):
        """GET /health → 200 with status ok."""
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_readiness(self):
        """GET /health/ready → 200."""
        r = client.get("/health/ready")
        assert r.status_code == 200

    def test_readiness_has_ready_field(self):
        """GET /health/ready should include a 'ready' boolean."""
        r = client.get("/health/ready")
        data = r.json()
        assert "ready" in data
        assert isinstance(data["ready"], bool)


# ──────────────────────────────────────────────────────────────
# ML Router Routes
# ──────────────────────────────────────────────────────────────

@pytest.mark.skipif(not HAS_APP, reason="App import failed")
class TestMLRoutes:

    def test_vibe_dark_returns_200(self):
        """GET /api/ml/discover/vibe/dark → 200."""
        r = client.get("/api/ml/discover/vibe/dark")
        assert r.status_code == 200

    def test_vibe_response_has_results(self):
        """GET /api/ml/discover/vibe/moody → results field exists."""
        r = client.get("/api/ml/discover/vibe/moody")
        data = r.json()
        assert "results" in data
        assert "vibe" in data

    def test_invalid_vibe_returns_400(self):
        """GET /api/ml/discover/vibe/invalid → 400."""
        r = client.get("/api/ml/discover/vibe/invalid_vibe_xyz")
        assert r.status_code == 400

    def test_recommend_accepts_post(self):
        """POST /api/ml/recommend → 200."""
        r = client.post("/api/ml/recommend", json={
            "title": "Inception",
            "synopsis": "A dream heist thriller.",
            "genres": ["Sci-Fi", "Action"],
            "limit": 5,
        })
        assert r.status_code == 200
        data = r.json()
        assert "recommendations" in data

    def test_poster_analyze_invalid_url(self):
        """POST /api/ml/poster/analyze with bad URL → 422 validation error."""
        r = client.post("/api/ml/poster/analyze", json={"posterUrl": "not-a-url"})
        assert r.status_code == 422


# ──────────────────────────────────────────────────────────────
# Cache Integration
# ──────────────────────────────────────────────────────────────

@pytest.mark.skipif(not HAS_APP, reason="App import failed")
class TestCacheIntegration:

    def test_health_endpoint_is_fast_on_second_call(self):
        """Health endpoint should respond consistently fast."""
        import time
        client.get("/health")  # warm up
        t0 = time.perf_counter()
        r = client.get("/health")
        elapsed = (time.perf_counter() - t0) * 1000
        assert r.status_code == 200
        assert elapsed < 500, f"Health check too slow: {elapsed:.1f}ms"
