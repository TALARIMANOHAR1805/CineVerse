package com.cineverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * CineVerse Backend — Spring Boot entry point.
 *
 * @SpringBootApplication is shorthand for:
 *   @Configuration + @EnableAutoConfiguration + @ComponentScan
 * It tells Spring to scan this package and all sub-packages for beans.
 */
@SpringBootApplication
@EnableAsync
public class CineVerseApplication {
    public static void main(String[] args) {
        SpringApplication.run(CineVerseApplication.class, args);
    }
}
