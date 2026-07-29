package com.cineverse.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * HealthController — Phase 0 smoke-test endpoint.
 *
 * @RestController = @Controller + @ResponseBody
 *   Every method return value is serialized to JSON automatically.
 *
 * @RequestMapping("/api") means all routes here are prefixed /api/
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * GET /api/health
     * Returns a simple JSON object so we can confirm the service is up.
     * Spring's Jackson library auto-converts Map → JSON.
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status",    "UP",
            "service",   "cineverse-backend",
            "timestamp", Instant.now().toString()
        );
    }
}
