package com.cineverse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * SearchRequestDTO — Validated request body for the search endpoint.
 * Ensures query string is present and within acceptable length bounds.
 *
 * Added by: Koushik-31368
 */
public class SearchRequestDTO {

    @NotBlank(message = "Search query must not be blank")
    @Size(min = 1, max = 200, message = "Search query must be between 1 and 200 characters")
    private String query;

    @Min(value = 1, message = "Page number must be at least 1")
    private int page = 1;

    private String type; // "movie" | "anime" | null (both)

    public SearchRequestDTO() {}

    public SearchRequestDTO(String query, int page, String type) {
        this.query = query;
        this.page  = page;
        this.type  = type;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
