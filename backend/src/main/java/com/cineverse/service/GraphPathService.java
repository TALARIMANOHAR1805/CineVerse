package com.cineverse.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Session;
import org.neo4j.driver.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GraphPathService — Phase B: Six-Degrees Shortest-Path Finder
 *
 * Uses the raw Neo4j Java driver (not SDN repositories) because
 * shortestPath() returns a Neo4j Path object that SDN @Query cannot
 * map into a Java record automatically.
 *
 * Graph schema traversed:
 *   (Person)-[:ACTED_IN]->(Movie)-[:PART_OF]->(Franchise)
 *
 * Both endpoints ($from / $to) can be:
 *   • a Movie  — matched by tmdbId  (numeric string, e.g. "27205")
 *   • a Person — matched by name    (e.g. "Cillian Murphy")
 *
 * ── Raw Cypher (shortestPath, max 6 hops) ──────────────────────────
 *
 *   MATCH (start), (end)
 *   WHERE (
 *       (start:Movie  AND start.tmdbId = $from) OR
 *       (start:Person AND toLower(start.name) = toLower($from))
 *   )
 *   AND (
 *       (end:Movie  AND end.tmdbId = $to) OR
 *       (end:Person AND toLower(end.name) = toLower($to))
 *   )
 *   AND elementId(start) <> elementId(end)
 *   WITH start, end
 *   MATCH path = shortestPath((start)-[:ACTED_IN|PART_OF*1..6]-(end))
 *   RETURN
 *       [node IN nodes(path) |
 *           CASE
 *               WHEN node:Movie  THEN {nodeType:'movie',  id:node.tmdbId,  name:node.title,  year:node.year,  posterUrl:node.posterUrl, rating:node.rating}
 *               WHEN node:Person THEN {nodeType:'person', id:node.name,    name:node.name,   year:null,       posterUrl:null,           rating:null}
 *               ELSE                  {nodeType:'unknown', id:null, name:null}
 *           END
 *       ] AS pathNodes,
 *       [rel IN relationships(path) | type(rel)] AS rels,
 *       length(path) AS hopCount
 *
 * ── Why this Cypher is correct ─────────────────────────────────────
 *
 * • Undirected `-([:ACTED_IN|PART_OF*1..6])-` lets us traverse edges
 *   in either direction, needed because:
 *     - ACTED_IN goes Person→Movie (so Movie→Person needs ←)
 *     - PART_OF goes Movie→Franchise
 * • shortestPath() finds the minimum-hop path — if a direct edge
 *   exists (1 hop) it returns that; otherwise it walks up to 6 hops.
 * • elementId() is used instead of deprecated id() per Neo4j 5.x.
 * • The CASE expression in the RETURN extracts typed node maps so the
 *   response is self-describing (no secondary API call needed).
 */
@Service
public class GraphPathService {

    // ── Raw Cypher ─────────────────────────────────────────────────
    private static final String SHORTEST_PATH_CYPHER = """
            MATCH (start), (end)
            WHERE (
                (start:Movie  AND start.tmdbId        = $from) OR
                (start:Person AND toLower(start.name) = toLower($from))
            )
            AND (
                (end:Movie  AND end.tmdbId        = $to) OR
                (end:Person AND toLower(end.name)  = toLower($to))
            )
            AND elementId(start) <> elementId(end)
            WITH start, end
            MATCH path = shortestPath((start)-[:ACTED_IN|PART_OF*1..6]-(end))
            RETURN
                [node IN nodes(path) |
                    CASE
                        WHEN node:Movie  THEN {nodeType:'movie',  id:node.tmdbId, name:node.title,
                                               year:node.year, posterUrl:node.posterUrl, rating:node.rating}
                        WHEN node:Person THEN {nodeType:'person', id:node.name,   name:node.name,
                                               year:null, posterUrl:null, rating:null}
                        ELSE                  {nodeType:'franchise', id:node.name, name:node.name,
                                               year:null, posterUrl:null, rating:null}
                    END
                ] AS pathNodes,
                [rel IN relationships(path) | type(rel)] AS rels,
                length(path) AS hopCount
            """;

    private final Driver driver;

    public GraphPathService(Driver driver) {
        this.driver = driver;
    }

    /**
     * Find the shortest path between two nodes.
     *
     * @param from  tmdbId (for Movie) or name (for Person)
     * @param to    tmdbId (for Movie) or name (for Person)
     * @return PathResult — found=false and empty lists if no path exists
     */
    public PathResult findShortestPath(String from, String to) {
        try (Session session = driver.session()) {
            var result = session.run(SHORTEST_PATH_CYPHER, Map.of("from", from, "to", to));

            if (!result.hasNext()) {
                // No path found — graceful empty result
                return new PathResult(false, 0, Collections.emptyList(), Collections.emptyList());
            }

            Record record = result.next();

            int hopCount = record.get("hopCount").asInt(0);

            // pathNodes: list of maps {nodeType, id, name, year, posterUrl, rating}
            List<PathNode> nodes = record.get("pathNodes").asList(Value::asMap).stream()
                    .map(m -> new PathNode(
                            safeStr(m.get("nodeType")),
                            safeStr(m.get("id")),
                            safeStr(m.get("name")),
                            safeStr(m.get("year")),
                            safeStr(m.get("posterUrl")),
                            m.get("rating") instanceof Number n ? n.doubleValue() : null
                    ))
                    .collect(Collectors.toList());

            // rels: list of relationship type strings e.g. ["ACTED_IN", "ACTED_IN"]
            List<String> rels = record.get("rels").asList(Value::asString);

            return new PathResult(true, hopCount, nodes, rels);

        } catch (Exception e) {
            System.err.println("[GraphPathService] shortestPath failed from='" + from + "' to='" + to + "': " + e.getMessage());
            return new PathResult(false, 0, Collections.emptyList(), Collections.emptyList());
        }
    }

    // ── DTOs ───────────────────────────────────────────────────────

    /**
     * A single node in the path.
     * nodeType = "movie" | "person" | "franchise"
     * id       = tmdbId for movies, name for people/franchises
     */
    public record PathNode(
            String  nodeType,
            String  id,
            String  name,
            String  year,
            String  posterUrl,
            Double  rating
    ) {}

    /**
     * Full path result.
     *
     * nodes         — ordered list of nodes along the path (N nodes)
     * relationships — ordered list of relationship types (N-1 entries)
     * hopCount      — length of path = number of relationships traversed
     *
     * Example for a 2-hop path (Inception → Cillian Murphy → The Dark Knight):
     *   nodes: [Movie("Inception"), Person("Cillian Murphy"), Movie("The Dark Knight")]
     *   relationships: ["ACTED_IN", "ACTED_IN"]
     *   hopCount: 2
     *
     * The frontend should interleave nodes[i] → relationships[i] → nodes[i+1]
     * to produce the animated step-by-step connection display.
     */
    public record PathResult(
            boolean       found,
            int           hopCount,
            List<PathNode> nodes,
            List<String>  relationships
    ) {}

    // ── Helpers ────────────────────────────────────────────────────

    private String safeStr(Object v) {
        if (v == null) return null;
        if (v instanceof String s) return s.isBlank() ? null : s;
        return v.toString();
    }
}
