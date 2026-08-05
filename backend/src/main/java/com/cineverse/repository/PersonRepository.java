package com.cineverse.repository;

import com.cineverse.model.Person;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonRepository extends Neo4jRepository<Person, Long> {

    /** Find a person by exact name — used during graph ingestion to avoid duplicates. */
    Optional<Person> findByName(String name);
}
