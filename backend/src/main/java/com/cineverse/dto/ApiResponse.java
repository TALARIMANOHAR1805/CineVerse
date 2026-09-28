package com.cineverse.dto;

import java.time.Instant;

/**
 * ApiResponse<T> — Unified response wrapper for all CineVerse API endpoints.
 *
 * Ensures consistent JSON shape:
 * {
 *   "success": true,
 *   "message": "OK",
 *   "data": {...},
 *   "timestamp": "2026-09-28T14:00:00Z"
 * }
 *
 * Added by: Koushik-31368
 */
public class ApiResponse<T> {

    private final boolean success;
    private final String  message;
    private final T       data;
    private final String  timestamp;

    private ApiResponse(boolean success, String message, T data) {
        this.success   = success;
        this.message   = message;
        this.data      = data;
        this.timestamp = Instant.now().toString();
    }

    // ── Factory methods ──────────────────────────────────────

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "OK", data);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    // ── Getters ──────────────────────────────────────────────

    public boolean isSuccess()  { return success;   }
    public String  getMessage() { return message;   }
    public T       getData()    { return data;       }
    public String  getTimestamp() { return timestamp; }
}
