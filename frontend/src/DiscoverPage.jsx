/**
 * DiscoverPage.jsx v2 — Professional Discovery Browser
 *
 * Features:
 *  - Media type toggle (Movies / Anime) — tab group
 *  - Category tabs (Popular / Top Rated / Trending / Upcoming)
 *  - Genre filter pills (scrollable horizontal strip)
 *  - Responsive card grid with load-more
 *  - Empty & loading states
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';
import {
  fetchTrendingMovies, fetchTopAnime,
  fetchMoviesByCategory, fetchAnimeByCategory,
} from './api';

const MOVIE_CATEGORIES = [
  { id: 'popular',    label: 'Popular' },
  { id: 'top_rated',  label: 'Top Rated' },
  { id: 'now_playing',label: 'In Theaters' },
  { id: 'upcoming',   label: 'Upcoming' },
];

const ANIME_CATEGORIES = [
  { id: 'airing',   label: 'Now Airing' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'bypopularity', label: 'Most Popular' },
  { id: 'favorite', label: 'Fan Favorites' },
];

const MOVIE_GENRES = [
  { id: null,   name: 'All' },
  { id: 28,     name: 'Action' },
  { id: 12,     name: 'Adventure' },
  { id: 16,     name: 'Animation' },
  { id: 35,     name: 'Comedy' },
  { id: 80,     name: 'Crime' },
  { id: 99,     name: 'Documentary' },
  { id: 18,     name: 'Drama' },
  { id: 27,     name: 'Horror' },
  { id: 10749,  name: 'Romance' },
  { id: 878,    name: 'Sci-Fi' },
  { id: 53,     name: 'Thriller' },
  { id: 10752,  name: 'War' },
];

const ANIME_GENRES = [
  { id: null,  name: 'All' },
  { id: 1,     name: 'Action' },
  { id: 2,     name: 'Adventure' },
  { id: 4,     name: 'Comedy' },
  { id: 8,     name: 'Drama' },
  { id: 10,    name: 'Fantasy' },
  { id: 14,    name: 'Horror' },
  { id: 22,    name: 'Romance' },
  { id: 24,    name: 'Sci-Fi' },
  { id: 36,    name: 'Slice of Life' },
  { id: 37,    name: 'Supernatural' },
  { id: 7,     name: 'Mystery' },
];

/* ── DiscoverCard ─────────────────────────────────────────────── */
function DiscoverCard({ item, onCardClick }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);
  const [imgErr, setImgErr] = useState(false);

  const handleSave = (e) => {
    e.stopPropagation();
    if (saved) { removeFromWatchlist(item.id, item.type); showToast(`Removed "${item.title}"`, 'info'); }
    else        { addToWatchlist(item); showToast(`Saved "${item.title}" ✓`, 'success'); }
  };

  return (
    <div
      className="media-card"
      onClick={() => onCardClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onCardClick(item)}
    >
      <div className="media-card__poster-wrap">
        <span className={`media-card__type-badge media-card__type-badge--${item.type}`}>
          {item.type === 'anime' ? 'Anime' : 'Movie'}
        </span>
        {item.rating > 0 && <div className="media-card__rating">⭐ {item.rating}</div>}
        {item.posterUrl && !imgErr
          ? <img className="media-card__poster" src={item.posterUrl} alt={item.title} loading="lazy" onError={() => setImgErr(true)} />
          : <div className="media-card__poster-placeholder">{item.type === 'anime' ? '🎌' : '🎬'}</div>
        }
        <div className="media-card__overlay">
          <div className="media-card__play-btn" aria-hidden="true">▶</div>
        </div>
        <button
          className={`media-card__save-btn${saved ? ' media-card__save-btn--saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        >{saved ? '🔖' : '+'}</button>
      </div>
      <div className="media-card__info">
        <p className="media-card__title">{item.title}</p>
        <div className="media-card__meta">
          <span className="media-card__year">{item.year}</span>
          {item.genres?.length > 0 && (
            <><span className="media-card__dot">·</span><span>{item.genres[0]}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── DiscoverPage ─────────────────────────────────────────────── */
export default function DiscoverPage({ onCardClick }) {
  const [mediaType, setMediaType]     = useState('movie');
  const [category, setCategory]       = useState('popular');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [items, setItems]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const categories = mediaType === 'movie' ? MOVIE_CATEGORIES : ANIME_CATEGORIES;
  const genres     = mediaType === 'movie' ? MOVIE_GENRES : ANIME_GENRES;

  const doFetch = useCallback(async (pg = 1, reset = true) => {
    if (reset) { setLoading(true); setItems([]); }
    else setLoadingMore(true);

    try {
      let data = [];
      if (mediaType === 'movie') {
        data = await fetchMoviesByCategory(category, pg, selectedGenre) || [];
      } else {
        data = await fetchAnimeByCategory(category, pg) || [];
      }
      setItems(prev => reset ? data : [...prev, ...data]);
      setHasMore(data.length >= 18);
      setPage(pg);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [mediaType, category, selectedGenre]);

  useEffect(() => {
    doFetch(1, true);
  }, [doFetch]);

  const handleMediaToggle = (type) => {
    setMediaType(type);
    setCategory(type === 'movie' ? 'popular' : 'airing');
    setSelectedGenre(null);
    setPage(1);
  };

  return (
    <div className="discover-page">
      {/* Page header */}
      <div className="discover-page__header">
        <h1 className="discover-page__title">Discover</h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
          Browse movies and anime by category, genre and popularity
        </p>

        {/* Media type toggle */}
        <div className="tab-group">
          <button
            id="discover-movies-tab"
            className={`tab-group__btn${mediaType === 'movie' ? ' tab-group__btn--active' : ''}`}
            onClick={() => handleMediaToggle('movie')}
          >
            🎬 Movies
          </button>
          <button
            id="discover-anime-tab"
            className={`tab-group__btn${mediaType === 'anime' ? ' tab-group__btn--active' : ''}`}
            onClick={() => handleMediaToggle('anime')}
          >
            🎌 Anime
          </button>
        </div>

        {/* Category tabs */}
        <div className="category-tabs">
          {categories.map(c => (
            <button
              key={c.id}
              id={`discover-cat-${c.id}`}
              className={`category-tab${category === c.id ? ' category-tab--active' : ''}`}
              onClick={() => { setCategory(c.id); setPage(1); }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Genre strip */}
        <div className="genre-strip">
          {genres.map(g => (
            <button
              key={g.id ?? 'all'}
              className={`genre-pill${selectedGenre === g.id ? ' genre-pill--active' : ''}`}
              onClick={() => setSelectedGenre(g.id === selectedGenre ? null : g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="cards-grid">
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-card__poster" />
              <div className="skeleton-card__body">
                <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '85%' }} />
                <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '55%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔭</div>
          <p className="empty-state__title">Nothing Found</p>
          <p className="empty-state__desc">Try a different category or genre filter.</p>
        </div>
      ) : (
        <>
          <div className="cards-grid">
            {items.map((item, idx) => (
              <DiscoverCard key={`${item.type}-${item.id}-${idx}`} item={item} onCardClick={onCardClick} />
            ))}
          </div>

          {hasMore && (
            <div className="load-more-wrap">
              <button
                className="btn btn--ghost"
                onClick={() => doFetch(page + 1, false)}
                disabled={loadingMore}
                style={{ minWidth: 160 }}
              >
                {loadingMore ? 'Loading…' : '↓ Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
