package com.cineverse.model;

import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Role {

    @RelationshipId
    private Long id;

    private String name;

    @TargetNode
    private Person person;

    public Role() {}

    public Role(Person person, String name) {
        this.person = person;
        this.name = name;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Person getPerson() { return person; }
    public void setPerson(Person person) { this.person = person; }
}
