"""
CineVerse ML Service — Logging middleware.

Adds structured request/response logging to all FastAPI endpoints.
Logs method, path, status code, and response time in milliseconds.

Added by: Koushik-31368
"""

import time
import logging
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("cineverse.ml")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    ASGI middleware that logs each HTTP request with timing information.

    Log format:
        --> GET /vibe-match [req_id=abc123]
        <-- 200 GET /vibe-match [req_id=abc123] [42.3ms]
    """

    async def dispatch(self, request: Request, call_next):
        req_id = str(uuid.uuid4())[:8]
        start = time.perf_counter()

        logger.info(
            "--> %s %s [req_id=%s] [ip=%s]",
            request.method,
            request.url.path,
            req_id,
            request.client.host if request.client else "unknown",
        )

        try:
            response = await call_next(request)
        except Exception as exc:
            elapsed_ms = (time.perf_counter() - start) * 1000
            logger.error(
                "<!- %s %s [req_id=%s] [%.1fms] EXCEPTION: %s",
                request.method,
                request.url.path,
                req_id,
                elapsed_ms,
                str(exc),
            )
            raise

        elapsed_ms = (time.perf_counter() - start) * 1000
        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            level,
            "<-- %d %s %s [req_id=%s] [%.1fms]",
            response.status_code,
            request.method,
            request.url.path,
            req_id,
            elapsed_ms,
        )
        return response
