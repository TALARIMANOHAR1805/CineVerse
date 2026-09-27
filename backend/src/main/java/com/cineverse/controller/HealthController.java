package com.cineverse.controller;

import com.cineverse.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * HealthController — Enhanced health and info endpoints.
 *
 * Endpoints:
 *   GET /api/health       — basic liveness check
 *   GET /api/health/info  — detailed service information
 *
 * Improved by: Koushik-31368
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private static final String VERSION = "1.0.0";
    private static final long START_TIME = System.currentTimeMillis();

    /**
     * GET /api/health
     * Liveness probe — confirms the service is up and responding.
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = Map.of(
            "status",    "UP",
            "service",   "cineverse-backend",
            "version",   VERSION,
            "timestamp", Instant.now().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(data, "Service is healthy"));
    }

    /**
     * GET /api/health/info
     * Returns detailed runtime information about the backend service.
     */
    @GetMapping("/health/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> info() {
        long uptimeMs = System.currentTimeMillis() - START_TIME;
        long uptimeSec = uptimeMs / 1000;

        Runtime rt = Runtime.getRuntime();
        long usedMemoryMb  = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
        long totalMemoryMb = rt.totalMemory() / (1024 * 1024);

        Map<String, Object> data = Map.of(
            "service",         "cineverse-backend",
            "version",         VERSION,
            "javaVersion",     System.getProperty("java.version"),
            "uptimeSeconds",   uptimeSec,
            "memoryUsedMb",    usedMemoryMb,
            "memoryTotalMb",   totalMemoryMb,
            "availableProc",   rt.availableProcessors(),
            "timestamp",       Instant.now().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
