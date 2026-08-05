package com.cineverse.repository;

import com.cineverse.model.Franchise;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FranchiseRepository extends Neo4jRepository<Franchise, Long> {
}
