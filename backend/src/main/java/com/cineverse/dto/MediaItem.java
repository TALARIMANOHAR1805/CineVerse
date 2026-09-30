package com.cineverse.dto;

/**
 * MediaItem — Generic DTO for a movie or anime item returned by the API.
 *
 * Used by search results, trending, and recommendation endpoints.
 * Normalises TMDB + Jikan into a single shape consumed by the React frontend.
 *
 * Author: Koushik-31368
 */
public class MediaItem {

    private String       id;
    private String       title;
    private String       type;          // "movie" | "anime"
    private String       year;
    private double       rating;
    private String       posterUrl;
    private String       synopsis;
    private java.util.List<String> genres;
    private Integer      episodeCount;  // anime only
    private Integer      runtime;       // movie only (minutes)
    private String       status;        // e.g. "Airing", "Released"
    private String       trailerUrl;

    public MediaItem() {}

    // ── Builder factory ───────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final MediaItem item = new MediaItem();

        public Builder id(String id)             { item.id = id;           return this; }
        public Builder title(String t)           { item.title = t;         return this; }
        public Builder type(String t)            { item.type = t;          return this; }
        public Builder year(String y)            { item.year = y;          return this; }
        public Builder rating(double r)          { item.rating = r;        return this; }
        public Builder posterUrl(String p)       { item.posterUrl = p;     return this; }
        public Builder synopsis(String s)        { item.synopsis = s;      return this; }
        public Builder genres(java.util.List<String> g) { item.genres = g; return this; }
        public Builder episodeCount(Integer e)   { item.episodeCount = e;  return this; }
        public Builder runtime(Integer r)        { item.runtime = r;       return this; }
        public Builder status(String s)          { item.status = s;        return this; }
        public Builder trailerUrl(String t)      { item.trailerUrl = t;    return this; }
        public MediaItem build()                 { return item; }
    }

    // ── Getters ───────────────────────────────────────────────
    public String  getId()           { return id;           }
    public String  getTitle()        { return title;        }
    public String  getType()         { return type;         }
    public String  getYear()         { return year;         }
    public double  getRating()       { return rating;       }
    public String  getPosterUrl()    { return posterUrl;    }
    public String  getSynopsis()     { return synopsis;     }
    public java.util.List<String> getGenres() { return genres; }
    public Integer getEpisodeCount() { return episodeCount; }
    public Integer getRuntime()      { return runtime;      }
    public String  getStatus()       { return status;       }
    public String  getTrailerUrl()   { return trailerUrl;   }
}
