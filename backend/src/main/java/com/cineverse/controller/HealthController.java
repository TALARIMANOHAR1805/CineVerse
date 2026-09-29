package com.cineverse.controller;

import com.cineverse.dto.ApiResponse;
import org.springframework.boot.info.BuildProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;

/**
 * HealthController v2 — Enhanced health + runtime info endpoints.
 *
 * Endpoints:
 *   GET /api/health         — liveness probe (fast)
 *   GET /api/health/ready   — readiness probe
 *   GET /api/health/info    — runtime details (uptime, memory, JVM)
 *
 * Improved by: Koushik-31368
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Instant START_TIME = Instant.now();

    private final Optional<BuildProperties> buildProperties;

    public HealthController(Optional<BuildProperties> buildProperties) {
        this.buildProperties = buildProperties;
    }

    /** Fast liveness probe — just returns UP. */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> health() {
        Map<String, Object> data = Map.of(
            "status",    "UP",
            "service",   "cineverse-backend",
            "version",   buildProperties.map(BuildProperties::getVersion).orElse("dev"),
            "timestamp", Instant.now().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /** Readiness probe — confirms all dependencies are reachable. */
    @GetMapping("/ready")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ready() {
        Map<String, Object> data = Map.of(
            "ready",   true,
            "service", "cineverse-backend"
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /** Detailed runtime info for debugging and monitoring dashboards. */
    @GetMapping("/info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> info() {
        MemoryMXBean mem     = ManagementFactory.getMemoryMXBean();
        long heapUsed        = mem.getHeapMemoryUsage().getUsed()  / 1024 / 1024;
        long heapMax         = mem.getHeapMemoryUsage().getMax()   / 1024 / 1024;
        long nonHeapUsed     = mem.getNonHeapMemoryUsage().getUsed()/ 1024 / 1024;
        long uptimeSeconds   = ChronoUnit.SECONDS.between(START_TIME, Instant.now());

        Map<String, Object> data = Map.of(
            "status",          "UP",
            "uptimeSeconds",   uptimeSeconds,
            "heapUsedMb",      heapUsed,
            "heapMaxMb",       heapMax,
            "nonHeapUsedMb",   nonHeapUsed,
            "javaVersion",     System.getProperty("java.version"),
            "availProcessors", Runtime.getRuntime().availableProcessors(),
            "buildVersion",    buildProperties.map(BuildProperties::getVersion).orElse("dev"),
            "buildTime",       buildProperties.map(bp -> bp.getTime().toString()).orElse("—"),
            "startedAt",       START_TIME.toString()
        );
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
