package com.cineverse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

/**
 * CorsConfig v2 — Enhanced CORS configuration with configurable origins.
 *
 * Reads allowed origins from application properties:
 *   cineverse.cors.allowed-origins=http://localhost:5173,https://yourdomain.com
 *
 * Author: Koushik-31368
 */
@Configuration
public class CorsConfig {

    private final AppProperties props;

    public CorsConfig(AppProperties props) {
        this.props = props;
    }

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Origins from config (fallback: localhost dev ports)
        String[] configuredOrigins = props.getCors().getAllowedOrigins();
        if (configuredOrigins != null && configuredOrigins.length > 0) {
            config.setAllowedOrigins(Arrays.asList(configuredOrigins));
        } else {
            config.setAllowedOrigins(List.of(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "http://localhost:4173"
            ));
        }

        // Methods
        String[] methods = props.getCors().getAllowedMethods();
        config.setAllowedMethods(methods != null
                ? Arrays.asList(methods)
                : List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);   // 1 hour preflight cache

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
