package com.cineverse.repository;

import com.cineverse.model.Franchise;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FranchiseRepository extends Neo4jRepository<Franchise, Long> {

    /** Find franchise by exact name — used during ingest to avoid duplicates. */
    Optional<Franchise> findByName(String name);

}
