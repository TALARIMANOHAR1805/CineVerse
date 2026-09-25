package com.cineverse.exception;

/**
 * ResourceNotFoundException — Thrown when a requested resource (movie, anime,
 * graph node, etc.) cannot be found. Maps to HTTP 404 via GlobalExceptionHandler.
 *
 * Usage:
 *   throw new ResourceNotFoundException("Movie not found with id: " + id);
 *
 * Added by: Koushik-31368
 */
public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;

    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceName = "Resource";
        this.fieldName = "id";
        this.fieldValue = null;
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }

    public String getResourceName() { return resourceName; }
    public String getFieldName()    { return fieldName; }
    public Object getFieldValue()   { return fieldValue; }
}
