"""
CineVerse ML — response_helpers.py
Standard JSON response builders for FastAPI endpoints.

Author: Koushik-31368
"""

from typing import Any, Dict, List, Optional
import time


def ok(data: Any, message: str = "ok") -> Dict[str, Any]:
    """200 success response."""
    return {
        "success":   True,
        "message":   message,
        "data":      data,
        "timestamp": int(time.time()),
    }


def error(message: str, code: int = 400, details: Optional[Any] = None) -> Dict[str, Any]:
    """Error response body."""
    payload: Dict[str, Any] = {
        "success":   False,
        "message":   message,
        "code":      code,
        "timestamp": int(time.time()),
    }
    if details is not None:
        payload["details"] = details
    return payload


def paginated(
    data:       List[Any],
    page:       int,
    page_size:  int,
    total:      int,
    message:    str = "ok",
) -> Dict[str, Any]:
    """Paginated list response."""
    total_pages = max(1, -(-total // page_size))   # ceiling division
    return {
        "success":     True,
        "message":     message,
        "data":        data,
        "pagination":  {
            "page":        page,
            "page_size":   page_size,
            "total":       total,
            "total_pages": total_pages,
            "has_next":    page < total_pages,
            "has_prev":    page > 1,
        },
        "timestamp": int(time.time()),
    }
