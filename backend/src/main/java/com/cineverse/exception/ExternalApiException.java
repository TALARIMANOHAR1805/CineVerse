package com.cineverse.exception;

import org.springframework.http.HttpStatus;

/**
 * ExternalApiException — Thrown when a call to an external API
 * (TMDB, Jikan, ML service) fails or returns an unexpected response.
 * Maps to HTTP 502 Bad Gateway via GlobalExceptionHandler.
 *
 * Usage:
 *   throw new ExternalApiException("TMDB", "Failed to fetch movie details", e);
 *
 * Added by: Koushik-31368
 */
public class ExternalApiException extends RuntimeException {

    private final String apiName;
    private final HttpStatus httpStatus;

    public ExternalApiException(String apiName, String message) {
        super(String.format("[%s API Error] %s", apiName, message));
        this.apiName = apiName;
        this.httpStatus = HttpStatus.BAD_GATEWAY;
    }

    public ExternalApiException(String apiName, String message, Throwable cause) {
        super(String.format("[%s API Error] %s", apiName, message), cause);
        this.apiName = apiName;
        this.httpStatus = HttpStatus.BAD_GATEWAY;
    }

    public String getApiName()       { return apiName; }
    public HttpStatus getHttpStatus() { return httpStatus; }
}
