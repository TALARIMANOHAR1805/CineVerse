package com.cineverse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * WebConfig — Spring beans for HTTP client configuration.
 *
 * Provides:
 *  - RestTemplate with timeout settings and lenient JSON parsing
 *  - ObjectMapper with FAIL_ON_UNKNOWN_PROPERTIES=false
 *
 * Author: Koushik-31368
 */
@Configuration
public class WebConfig {

    /** Shared RestTemplate with 5s connect / 10s read timeout */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(10_000);

        RestTemplate restTemplate = new RestTemplate(factory);

        // Use lenient ObjectMapper (ignore unknown fields from TMDB/Jikan)
        restTemplate.getMessageConverters().stream()
                .filter(c -> c instanceof MappingJackson2HttpMessageConverter)
                .map(c -> (MappingJackson2HttpMessageConverter) c)
                .findFirst()
                .ifPresent(c -> c.setObjectMapper(lenientMapper()));

        return restTemplate;
    }

    /** Lenient ObjectMapper — ignores unknown JSON fields */
    @Bean
    public ObjectMapper lenientMapper() {
        return new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }
}
