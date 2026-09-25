package com.cineverse.dto;

import java.time.Instant;

/**
 * ApiResponse — Generic wrapper for all API responses.
 * Provides a consistent JSON envelope: { success, data, message, timestamp }
 *
 * Usage:
 *   return ResponseEntity.ok(ApiResponse.success(data));
 *   return ResponseEntity.badRequest().body(ApiResponse.error("Not found"));
 *
 * Added by: Koushik-31368
 */
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final String timestamp;

    private ApiResponse(boolean success, T data, String message) {
        this.success   = success;
        this.data      = data;
        this.message   = message;
        this.timestamp = Instant.now().toString();
    }

    // ------------------------------------------------------------------ //
    //  Factory methods
    // ------------------------------------------------------------------ //

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, "OK");
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, data, message);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }

    // ------------------------------------------------------------------ //
    //  Getters (needed for Jackson serialization)
    // ------------------------------------------------------------------ //

    public boolean isSuccess()   { return success;   }
    public T       getData()     { return data;       }
    public String  getMessage()  { return message;    }
    public String  getTimestamp(){ return timestamp;  }
}
