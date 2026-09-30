package com.cineverse.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * AppProperties — Type-safe binding for CineVerse application configuration.
 *
 * Maps application.properties entries under prefix "cineverse".
 *
 * Usage in application.properties:
 *   cineverse.tmdb.api-key=your_key
 *   cineverse.tmdb.base-url=https://api.themoviedb.org/3
 *   cineverse.jikan.base-url=https://api.jikan.moe/v4
 *   cineverse.neo4j.enabled=false
 *   cineverse.cors.allowed-origins=http://localhost:5173
 *
 * Author: Koushik-31368
 */
@ConfigurationProperties(prefix = "cineverse")
public class AppProperties {

    private final Tmdb   tmdb   = new Tmdb();
    private final Jikan  jikan  = new Jikan();
    private final Neo4j  neo4j  = new Neo4j();
    private final Cors   cors   = new Cors();
    private final Ml     ml     = new Ml();

    public Tmdb  getTmdb()  { return tmdb;  }
    public Jikan getJikan() { return jikan; }
    public Neo4j getNeo4j() { return neo4j; }
    public Cors  getCors()  { return cors;  }
    public Ml    getMl()    { return ml;    }

    public static class Tmdb {
        private String apiKey   = "";
        private String baseUrl  = "https://api.themoviedb.org/3";
        private String imageUrl = "https://image.tmdb.org/t/p/w500";
        public String getApiKey()   { return apiKey;   }
        public String getBaseUrl()  { return baseUrl;  }
        public String getImageUrl() { return imageUrl; }
        public void setApiKey(String v)   { this.apiKey   = v; }
        public void setBaseUrl(String v)  { this.baseUrl  = v; }
        public void setImageUrl(String v) { this.imageUrl = v; }
    }

    public static class Jikan {
        private String baseUrl = "https://api.jikan.moe/v4";
        private int    rateLimitDelayMs = 400;
        public String getBaseUrl()        { return baseUrl;           }
        public int    getRateLimitDelayMs(){ return rateLimitDelayMs; }
        public void setBaseUrl(String v)  { this.baseUrl = v;         }
        public void setRateLimitDelayMs(int v) { this.rateLimitDelayMs = v; }
    }

    public static class Neo4j {
        private boolean enabled = false;
        public boolean isEnabled()       { return enabled; }
        public void setEnabled(boolean v){ this.enabled = v; }
    }

    public static class Cors {
        private String[] allowedOrigins = {"http://localhost:5173", "http://localhost:3000"};
        private String[] allowedMethods = {"GET","POST","PUT","DELETE","OPTIONS"};
        public String[] getAllowedOrigins() { return allowedOrigins; }
        public String[] getAllowedMethods() { return allowedMethods; }
        public void setAllowedOrigins(String[] v) { this.allowedOrigins = v; }
        public void setAllowedMethods(String[] v) { this.allowedMethods = v; }
    }

    public static class Ml {
        private String baseUrl = "http://localhost:8001";
        private boolean enabled = false;
        public String getBaseUrl()     { return baseUrl; }
        public boolean isEnabled()     { return enabled; }
        public void setBaseUrl(String v){ this.baseUrl = v; }
        public void setEnabled(boolean v){ this.enabled = v; }
    }
}
