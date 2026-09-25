package com.cineverse.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * RequestLoggingInterceptor — Logs incoming requests and outgoing responses
 * with timing information for performance monitoring.
 *
 * Logs format:
 *   --> GET /api/search?q=inception
 *   <-- 200 GET /api/search?q=inception [42ms]
 *
 * Added by: Koushik-31368
 */
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);
    private static final String START_TIME_ATTR = "cv_request_start";

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());

        if (log.isDebugEnabled()) {
            String queryString = request.getQueryString();
            String uri = request.getRequestURI()
                    + (queryString != null ? "?" + queryString : "");
            log.debug("--> {} {}", request.getMethod(), uri);
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        if (!log.isInfoEnabled()) return;

        Long startTime = (Long) request.getAttribute(START_TIME_ATTR);
        long elapsed   = startTime != null ? System.currentTimeMillis() - startTime : -1;

        String queryString = request.getQueryString();
        String uri = request.getRequestURI()
                + (queryString != null ? "?" + queryString : "");

        if (ex != null || response.getStatus() >= 400) {
            log.warn("<-- {} {} {} [{}ms] {}",
                    response.getStatus(),
                    request.getMethod(),
                    uri,
                    elapsed,
                    ex != null ? "| ERROR: " + ex.getMessage() : "");
        } else {
            log.info("<-- {} {} {} [{}ms]",
                    response.getStatus(),
                    request.getMethod(),
                    uri,
                    elapsed);
        }
    }
}
