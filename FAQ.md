## Frequently Asked Questions (FAQ)

**Q: Is CineVerse spoiler-free?**  
A: Yes — timeline and synopsis information is carefully limited to "should I watch X before Y?" guidance, not plot reveals.

**Q: What APIs does CineVerse use?**  
A: TMDB for movies, Jikan (unofficial MyAnimeList API) for anime, and Neo4j AuraDB for graph relationship storage.

**Q: How do I contribute?**  
A: Read [CONTRIBUTING.md](CONTRIBUTING.md) then open a pull request on the `main` branch.

**Q: Why does the graph show no connections for a new movie?**  
A: The Neo4j graph self-populates as users browse — view a few movies and connections will appear automatically.

**Q: The ML vibe match isn't returning results — what's wrong?**  
A: The ML service may be starting up (cold start on Render ~30 sec). Refresh and try again.

**Q: Can I run CineVerse locally without Neo4j AuraDB?**  
A: Yes — set `spring.neo4j.uri=bolt://localhost:7687` in `.env` and run a local Neo4j instance.

**Q: What's the TMDB_API_KEY used for?**  
A: Fetching movie metadata (title, poster, release date, genres, synopsis, cast) from The Movie Database.

**Q: How does the Watchlist work?**  
A: Watchlist is stored in browser `localStorage` — no account required. It persists between sessions.
