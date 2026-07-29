package com.cineverse;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * CineVerse Backend — Spring Boot entry point.
 *
 * @SpringBootApplication is shorthand for:
 *   @Configuration + @EnableAutoConfiguration + @ComponentScan
 * It tells Spring to scan this package and all sub-packages for beans.
 */
@SpringBootApplication
public class CineVerseApplication {
    public static void main(String[] args) {
        SpringApplication.run(CineVerseApplication.class, args);
    }
}
