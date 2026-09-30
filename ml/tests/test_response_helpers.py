"""
test_response_helpers.py — Tests for response builder functions.

Author: Koushik-31368
"""
import pytest
from app.response_helpers import ok, error, paginated


class TestOk:
    def test_success_true(self):
        r = ok({"id": 1})
        assert r["success"] is True

    def test_data_preserved(self):
        data = [1, 2, 3]
        r = ok(data)
        assert r["data"] == data

    def test_has_timestamp(self):
        r = ok(None)
        assert "timestamp" in r
        assert isinstance(r["timestamp"], int)

    def test_default_message(self):
        r = ok({})
        assert r["message"] == "ok"

    def test_custom_message(self):
        r = ok({}, message="created")
        assert r["message"] == "created"


class TestError:
    def test_success_false(self):
        r = error("something broke")
        assert r["success"] is False

    def test_default_code_400(self):
        r = error("bad")
        assert r["code"] == 400

    def test_custom_code(self):
        r = error("not found", code=404)
        assert r["code"] == 404

    def test_details_omitted_when_none(self):
        r = error("msg")
        assert "details" not in r

    def test_details_present_when_given(self):
        r = error("msg", details={"field": "q"})
        assert r["details"] == {"field": "q"}


class TestPaginated:
    def test_pagination_keys(self):
        r = paginated([], 1, 20, 100)
        p = r["pagination"]
        assert "page" in p
        assert "total" in p
        assert "has_next" in p
        assert "has_prev" in p

    def test_has_next_true(self):
        r = paginated([], 1, 20, 100)
        assert r["pagination"]["has_next"] is True

    def test_has_prev_false_on_first(self):
        r = paginated([], 1, 20, 100)
        assert r["pagination"]["has_prev"] is False

    def test_total_pages(self):
        r = paginated([], 1, 10, 25)
        assert r["pagination"]["total_pages"] == 3
