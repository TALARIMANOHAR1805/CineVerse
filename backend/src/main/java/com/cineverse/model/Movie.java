package com.cineverse.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Node("Movie")
public class Movie {

    @Id @GeneratedValue
    private Long id;

    private String title;

    private LocalDate releaseDate;

    @Relationship(type = "PART_OF", direction = Relationship.Direction.OUTGOING)
    private Franchise franchise;

    @Relationship(type = "ACTED_IN", direction = Relationship.Direction.INCOMING)
    private List<Role> cast = new ArrayList<>();

    public Movie() {}

    public Movie(String title, LocalDate releaseDate) {
        this.title = title;
        this.releaseDate = releaseDate;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getReleaseDate() { return releaseDate; }
    public void setReleaseDate(LocalDate releaseDate) { this.releaseDate = releaseDate; }
    public Franchise getFranchise() { return franchise; }
    public void setFranchise(Franchise franchise) { this.franchise = franchise; }
    public List<Role> getCast() { return cast; }
    public void setCast(List<Role> cast) { this.cast = cast; }

    public void addCastMember(Person person, String roleName) {
        this.cast.add(new Role(person, roleName));
    }
}
