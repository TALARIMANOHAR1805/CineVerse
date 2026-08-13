package com.cineverse.config;

import com.cineverse.model.Franchise;
import com.cineverse.model.Movie;
import com.cineverse.model.Person;
import com.cineverse.repository.FranchiseRepository;
import com.cineverse.repository.MovieRepository;
import com.cineverse.repository.PersonRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final MovieRepository movieRepository;
    private final PersonRepository personRepository;
    private final FranchiseRepository franchiseRepository;

    public DataSeeder(MovieRepository movieRepository, PersonRepository personRepository, FranchiseRepository franchiseRepository) {
        this.movieRepository = movieRepository;
        this.personRepository = personRepository;
        this.franchiseRepository = franchiseRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (movieRepository.count() == 0) {
                System.out.println("[DataSeeder] Seeding dummy data into Neo4j...");

                // Create Franchise
                Franchise mcu = new Franchise("Marvel Cinematic Universe");
                franchiseRepository.save(mcu);

                // Create People
                Person rdn = new Person("Robert Downey Jr.");
                Person ce = new Person("Chris Evans");
                personRepository.saveAll(List.of(rdn, ce));

                // Create Movies
                Movie ironMan = new Movie("Iron Man", LocalDate.of(2008, 5, 2));
                ironMan.setFranchise(mcu);
                ironMan.addCastMember(rdn, "Tony Stark");

                Movie avengers = new Movie("The Avengers", LocalDate.of(2012, 5, 4));
                avengers.setFranchise(mcu);
                avengers.addCastMember(rdn, "Tony Stark");
                avengers.addCastMember(ce, "Steve Rogers");

                movieRepository.saveAll(List.of(ironMan, avengers));

                System.out.println("[DataSeeder] Dummy data seeded successfully.");
            }
        } catch (Exception e) {
            // Neo4j is unavailable (e.g. paused Aura free tier) — log and continue.
            // All TMDB/Jikan search routes will still work normally.
            System.err.println("[DataSeeder] WARNING: Neo4j unreachable at startup — graph features disabled. " + e.getMessage());
        }
    }
}
