package com.cineverse.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * TMDB API Client
 * Connects to the TMDB v3 API to fetch movie metadata.
 */
@Service
public class TmdbService {

    private final RestClient restClient;
    private final String apiKey;

    public TmdbService(
            RestClient.Builder restClientBuilder,
            @Value("${tmdb.api.base-url}") String baseUrl,
            @Value("${tmdb.api.key}") String apiKey) {
        
        this.restClient = restClientBuilder
                .baseUrl(baseUrl)
                .build();
        this.apiKey = apiKey;
    }

    /**
     * Search for a movie by title.
     * Returns a simplified record representing the top result (title, year, synopsis).
     */
    public Optional<MovieSearchResult> searchMovie(String title) {
        // Call /search/movie?query={title}&api_key={key}
        Map<String, Object> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/search/movie")
                        .queryParam("query", title)
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .body(Map.class);

        if (response == null || !response.containsKey("results")) {
            return Optional.empty();
        }

        List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
        if (results.isEmpty()) {
            return Optional.empty();
        }

        // Take the top result
        Map<String, Object> topResult = results.get(0);
        
        String resultTitle = (String) topResult.get("title");
        String releaseDate = (String) topResult.get("release_date");
        String overview = (String) topResult.get("overview");
        
        // Extract year from "YYYY-MM-DD"
        String year = (releaseDate != null && releaseDate.length() >= 4) 
                ? releaseDate.substring(0, 4) 
                : "Unknown";

        return Optional.of(new MovieSearchResult(resultTitle, year, overview));
    }

    /**
     * Internal record to hold the simplified movie data.
     */
    public record MovieSearchResult(String title, String year, String synopsis) {}
}
