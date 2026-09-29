package com.cineverse.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * RequestLoggingInterceptor v2 — Logs every API request with timing.
 *
 * Log format:
 *   [REQ] GET /api/search?q=inception → 200 OK [42ms]
 *
 * Improved by: Koushik-31368
 */
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger("cineverse.access");
    private static final String ATTR_START = "req_start_ms";

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        req.setAttribute(ATTR_START, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object handler, Exception ex) {
        long start   = (Long) req.getAttribute(ATTR_START);
        long elapsed = System.currentTimeMillis() - start;
        int  status  = res.getStatus();
        String method = req.getMethod();
        String uri    = req.getRequestURI();
        String query  = req.getQueryString();

        String fullUri = query != null ? uri + "?" + query : uri;

        if (ex != null || status >= 500) {
            log.error("[REQ] {} {} → {} [{}ms] exception={}", method, fullUri, status, elapsed,
                ex != null ? ex.getMessage() : "none");
        } else if (status >= 400) {
            log.warn("[REQ] {} {} → {} [{}ms]", method, fullUri, status, elapsed);
        } else {
            log.info("[REQ] {} {} → {} [{}ms]", method, fullUri, status, elapsed);
        }
    }
}
