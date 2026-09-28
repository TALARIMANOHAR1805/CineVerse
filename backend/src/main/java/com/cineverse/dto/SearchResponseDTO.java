package com.cineverse.dto;

/**
 * SearchResponseDTO — Wraps the unified search response.
 * Provides a strongly-typed alternative to raw Map returns.
 *
 * Added by: Koushik-31368
 */
import com.cineverse.service.TmdbService;
import java.util.List;

public class SearchResponseDTO {

    private final String query;
    private final String type;
    private final List<TmdbService.MediaResult> movies;
    private final List<TmdbService.MediaResult> anime;
    private final int total;

    public SearchResponseDTO(String query, String type,
                              List<TmdbService.MediaResult> movies,
                              List<TmdbService.MediaResult> anime) {
        this.query  = query;
        this.type   = type;
        this.movies = movies != null ? movies : List.of();
        this.anime  = anime  != null ? anime  : List.of();
        this.total  = this.movies.size() + this.anime.size();
    }

    public String getQuery()                         { return query;  }
    public String getType()                          { return type;   }
    public List<TmdbService.MediaResult> getMovies() { return movies; }
    public List<TmdbService.MediaResult> getAnime()  { return anime;  }
    public int getTotal()                            { return total;  }
}
