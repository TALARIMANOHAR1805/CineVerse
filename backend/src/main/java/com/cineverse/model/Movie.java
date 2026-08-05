package com.cineverse.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Movie — Neo4j node.
 * tmdbId is used as the natural key for graph lookups.
 * posterUrl lets graph results be displayed without a second API call.
 */
@Node("Movie")
public class Movie {

    @Id @GeneratedValue
    private Long id;

    private String tmdbId;      // Phase 3: natural key from TMDB
    private String title;
    private String year;
    private String posterUrl;   // Phase 3: stored so graph results are self-contained
    private double rating;

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

    // ── Getters & Setters ──────────────────────────────────────
    public Long getId()                          { return id; }

    public String getTmdbId()                    { return tmdbId; }
    public void   setTmdbId(String tmdbId)       { this.tmdbId = tmdbId; }

    public String getTitle()                     { return title; }
    public void   setTitle(String title)         { this.title = title; }

    public String getYear()                      { return year; }
    public void   setYear(String year)           { this.year = year; }

    public String getPosterUrl()                 { return posterUrl; }
    public void   setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }

    public double getRating()                    { return rating; }
    public void   setRating(double rating)       { this.rating = rating; }

    public LocalDate getReleaseDate()            { return releaseDate; }
    public void       setReleaseDate(LocalDate d){ this.releaseDate = d; }

    public Franchise getFranchise()              { return franchise; }
    public void      setFranchise(Franchise f)  { this.franchise = f; }

    public List<Role> getCast()                  { return cast; }
    public void       setCast(List<Role> cast)   { this.cast = cast; }

    public void addCastMember(Person person, String roleName) {
        this.cast.add(new Role(person, roleName));
    }
}
