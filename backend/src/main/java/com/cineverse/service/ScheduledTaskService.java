package com.cineverse.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * ScheduledTaskService — Runs background housekeeping jobs.
 *
 * Tasks:
 *  - Cache cleanup every 15 minutes
 *  - Health ping log every 30 minutes
 *
 * Added by: Koushik-31368
 */
@Service
public class ScheduledTaskService {

    private static final Logger log = LoggerFactory.getLogger(ScheduledTaskService.class);

    private final CacheService cacheService;

    public ScheduledTaskService(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    /**
     * Evict expired cache entries every 15 minutes.
     * Prevents memory growth from stale cached responses.
     */
    @Scheduled(fixedRateString = "${cache.cleanup.interval-ms:900000}")
    public void cleanExpiredCache() {
        log.debug("Scheduled task: evicting expired cache entries");
        cacheService.evictExpired();
        log.debug("Cache size after cleanup: {} live entries", cacheService.size());
    }

    /**
     * Log a heartbeat every 30 minutes for liveness monitoring.
     */
    @Scheduled(fixedRateString = "${health.heartbeat.interval-ms:1800000}")
    public void heartbeat() {
        log.info("CineVerse backend heartbeat — service is running");
    }
}
