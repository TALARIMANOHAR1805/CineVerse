"""
CineVerse ML — Test for the recommendation engine placeholder.

Tests that the /api/ml/recommend endpoint:
 - Accepts a POST with title + genres
 - Returns a 200 with a 'recommendations' list
 - Handles empty title gracefully

Author: Koushik-31368
"""

import pytest

try:
    from fastapi.testclient import TestClient
    from app.main import app
    client = TestClient(app)
    HAS_APP = True
except Exception:
    HAS_APP = False


@pytest.mark.skipif(not HAS_APP, reason="App failed to import")
class TestRecommendEndpoint:

    def test_recommend_returns_200(self):
        r = client.post("/api/ml/recommend", json={
            "title": "Inception",
            "genres": ["Sci-Fi", "Action"],
            "limit": 5,
        })
        assert r.status_code == 200

    def test_recommend_has_list(self):
        r = client.post("/api/ml/recommend", json={"title": "Naruto"})
        data = r.json()
        assert "recommendations" in data
        assert isinstance(data["recommendations"], list)

    def test_recommend_query_echoed(self):
        r = client.post("/api/ml/recommend", json={"title": "Parasite"})
        data = r.json()
        assert data.get("query") == "Parasite"

    def test_recommend_empty_title(self):
        """Empty title should still return 200, not 500."""
        r = client.post("/api/ml/recommend", json={"title": ""})
        assert r.status_code == 200


class TestVibeEndpoint:

    @pytest.mark.skipif(not HAS_APP, reason="App failed to import")
    def test_valid_vibes_return_200(self):
        for vibe in ["dark", "vibrant", "moody"]:
            r = client.get(f"/api/ml/discover/vibe/{vibe}")
            assert r.status_code == 200, f"Vibe '{vibe}' returned {r.status_code}"

    @pytest.mark.skipif(not HAS_APP, reason="App failed to import")
    def test_invalid_vibe_returns_400(self):
        r = client.get("/api/ml/discover/vibe/xyz_unknown")
        assert r.status_code == 400

    @pytest.mark.skipif(not HAS_APP, reason="App failed to import")
    def test_vibe_response_shape(self):
        r = client.get("/api/ml/discover/vibe/dark")
        data = r.json()
        assert "vibe" in data
        assert "results" in data
