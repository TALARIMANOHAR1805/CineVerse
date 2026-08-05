package com.cineverse.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

@Node("Franchise")
public class Franchise {

    @Id @GeneratedValue
    private Long id;

    private String name;

    @Relationship(type = "PART_OF", direction = Relationship.Direction.INCOMING)
    private List<Movie> movies = new ArrayList<>();

    public Franchise() {}

    public Franchise(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<Movie> getMovies() { return movies; }
    public void setMovies(List<Movie> movies) { this.movies = movies; }
}
