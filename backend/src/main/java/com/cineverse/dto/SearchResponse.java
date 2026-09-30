package com.cineverse.dto;

import java.util.List;

/**
 * SearchResponse — API response shape for /api/search endpoint.
 *
 * Shape:
 * {
 *   "query": "inception",
 *   "type": "all",
 *   "movies": [...],
 *   "anime": [...],
 *   "total": 40,
 *   "page": 1,
 *   "hasMore": true
 * }
 *
 * Author: Koushik-31368
 */
public class SearchResponse {

    private final String           query;
    private final String           type;
    private final List<MediaItem>  movies;
    private final List<MediaItem>  anime;
    private final int              total;
    private final int              page;
    private final boolean          hasMore;

    public SearchResponse(String query, String type,
                          List<MediaItem> movies, List<MediaItem> anime,
                          int page, boolean hasMore) {
        this.query   = query;
        this.type    = type;
        this.movies  = movies != null ? movies : List.of();
        this.anime   = anime  != null ? anime  : List.of();
        this.total   = this.movies.size() + this.anime.size();
        this.page    = page;
        this.hasMore = hasMore;
    }

    public static SearchResponse empty(String query, String type) {
        return new SearchResponse(query, type, List.of(), List.of(), 1, false);
    }

    public String          getQuery()   { return query;   }
    public String          getType()    { return type;    }
    public List<MediaItem> getMovies()  { return movies;  }
    public List<MediaItem> getAnime()   { return anime;   }
    public int             getTotal()   { return total;   }
    public int             getPage()    { return page;    }
    public boolean         isHasMore()  { return hasMore; }
}
