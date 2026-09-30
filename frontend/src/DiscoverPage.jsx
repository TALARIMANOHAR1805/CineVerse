/**
 * DiscoverPage.jsx — CineVerse Browse & Discover (Day 5)
 *
 * Features:
 *  - Browse movies by genre (using TMDB /discover/movie)
 *  - Browse anime by genre (using Jikan)
 *  - "Popular", "Top Rated", "Now Playing", "Upcoming" movie tabs
 *  - "Airing Now", "Most Popular", "Top Scored" anime tabs
 *  - Infinite scroll / load more
 *  - Save to watchlist from cards
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';
import { SkeletonGrid } from './Skeleton';

// ── TMDB genre list ───────────────────────────────────────────
const MOVIE_GENRES = [
  { id: 28,    name: 'Action' },
  { id: 12,    name: 'Adventure' },
  { id: 16,    name: 'Animation' },
  { id: 35,    name: 'Comedy' },
  { id: 80,    name: 'Crime' },
  { id: 18,    name: 'Drama' },
  { id: 14,    name: 'Fantasy' },
  { id: 27,    name: 'Horror' },
  { id: 9648,  name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878,   name: 'Sci-Fi' },
  { id: 53,    name: 'Thriller' },
];

const ANIME_GENRES = [
  { id: 1,  name: 'Action' },
  { id: 4,  name: 'Comedy' },
  { id: 8,  name: 'Drama' },
  { id: 10, name: 'Fantasy' },
  { id: 14, name: 'Horror' },
  { id: 22, name: 'Romance' },
  { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' },
  { id: 37, name: 'Supernatural' },
];

const MOVIE_TABS = [
  { id: 'popular',    label: '🔥 Popular',    endpoint: 'popular' },
  { id: 'top_rated',  label: '⭐ Top Rated',  endpoint: 'top_rated' },
  { id: 'now_playing',label: '🎬 In Theaters',endpoint: 'now_playing' },
  { id: 'upcoming',   label: '📅 Upcoming',   endpoint: 'upcoming' },
];

const ANIME_TABS = [
  { id: 'airing',   label: '📡 Airing Now' },
  { id: 'popular',  label: '🔥 Popular' },
  { id: 'bypopularity', label: '⭐ Top Score' },
];

const TMDB_KEY  = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';
const JIKAN     = 'https://api.jikan.moe/v4';

const GENRE_MAP = {
  28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',
  99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',
  27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',
  53:'Thriller',10752:'War',37:'Western',
};

function tmdbToMedia(m) {
  return {
    id: String(m.id), title: m.title || m.name || 'Unknown',
    year: (m.release_date || m.first_air_date || '').slice(0,4) || '—',
    rating: Math.round((m.vote_average || 0) * 10) / 10,
    posterUrl: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    type: 'movie',
    synopsis: m.overview || '',
    genres: (m.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean),
    voteCount: m.vote_count || 0,
  };
}

function jikanToMedia(a) {
  return {
    id: String(a.mal_id), title: a.title_english || a.title || 'Unknown',
    year: String(a.aired?.prop?.from?.year || a.year || '—'),
    rating: Math.round(((a.score || 0) / 2) * 10) / 10,
    posterUrl: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || null,
    type: 'anime',
    synopsis: a.synopsis || '',
    genres: (a.genres || []).map(g => g.name),
    episodes: a.episodes,
    status: a.status,
    studios: (a.studios || []).map(s => s.name),
  };
}

// ── Fetch helpers ──────────────────────────────────────────────
async function fetchMovieCategory(endpoint, page = 1) {
  if (!TMDB_KEY) return [];
  const r = await fetch(`${TMDB_BASE}/movie/${endpoint}?api_key=${TMDB_KEY}&page=${page}&language=en-US`);
  const d = await r.json();
  return (d.results || []).map(tmdbToMedia);
}

async function fetchMoviesByGenre(genreId, page = 1) {
  if (!TMDB_KEY) return [];
  const r = await fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`);
  const d = await r.json();
  return (d.results || []).map(tmdbToMedia);
}

async function fetchAnimeByFilter(filter, page = 1) {
  const r = await fetch(`${JIKAN}/anime?filter=${filter}&page=${page}&limit=20&sfw=true`);
  const d = await r.json();
  return (d.data || []).map(jikanToMedia);
}

async function fetchAnimeByGenre(genreId, page = 1) {
  const r = await fetch(`${JIKAN}/anime?genres=${genreId}&page=${page}&limit=20&order_by=score&sort=desc`);
  const d = await r.json();
  return (d.data || []).map(jikanToMedia);
}

// ── Mini card (reusable within this page) ─────────────────────
function DiscoverCard({ item, onClick }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);
  const [imgErr, setImgErr] = useState(false);

  const toggle = e => {
    e.stopPropagation();
    if (saved) { removeFromWatchlist(item.id, item.type); showToast(`Removed "${item.title}"`, 'info'); }
    else        { addToWatchlist(item); showToast(`Saved "${item.title}" ✓`, 'success'); }
  };

  return (
    <div className="card" onClick={() => onClick(item)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}>
      <button className="card__bookmark" onClick={toggle}
        aria-label={saved ? 'Remove' : 'Save'} title={saved ? 'Remove' : 'Save to watchlist'}>
        {saved ? '🔖' : '＋'}
      </button>
      {item.posterUrl && !imgErr
        ? <img className="card__poster" src={item.posterUrl} alt={item.title}
            loading="lazy" onError={() => setImgErr(true)} />
        : <div className="card__poster-placeholder">{item.type === 'anime' ? '🎌' : '🎬'}</div>
      }
      <div className="card__body">
        <p className={`card__type card__type--${item.type}`}>{item.type}</p>
        <p className="card__title">{item.title}</p>
        <div className="card__meta">
          <span className="card__year">{item.year}</span>
          {item.rating > 0 && <span className="card__rating">⭐ {item.rating}</span>}
        </div>
        {item.type === 'anime' && item.episodes && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{item.episodes} eps</span>
        )}
        {item.genres?.length > 0 && (
          <div className="genre-list">
            {item.genres.slice(0, 2).map(g => <span key={g} className="genre-tag">{g}</span>)}
          </div>
        )}
        <div className="card__cta">View details →</div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function DiscoverPage({ onCardClick }) {
  const [mode, setMode]           = useState('movies'); // 'movies' | 'anime'
  const [movieTab, setMovieTab]   = useState('popular');
  const [animeTab, setAnimeTab]   = useState('airing');
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [error, setError]         = useState('');

  const load = useCallback(async (reset = false) => {
    setLoading(true);
    setError('');
    const currentPage = reset ? 1 : page;
    try {
      let results = [];
      if (mode === 'movies') {
        if (!TMDB_KEY) { setError('Add VITE_TMDB_API_KEY to .env for movie discovery'); setLoading(false); return; }
        if (selectedGenre) results = await fetchMoviesByGenre(selectedGenre, currentPage);
        else {
          const tab = MOVIE_TABS.find(t => t.id === movieTab);
          results = await fetchMovieCategory(tab?.endpoint || 'popular', currentPage);
        }
      } else {
        if (selectedGenre) results = await fetchAnimeByGenre(selectedGenre, currentPage);
        else results = await fetchAnimeByFilter(animeTab, currentPage);
      }
      if (reset) setItems(results);
      else setItems(prev => [...prev, ...results]);
      setHasMore(results.length >= 18);
      if (!reset) setPage(p => p + 1);
      else setPage(2);
    } catch (e) {
      setError('Failed to load. Please try again.');
    }
    setLoading(false);
  }, [mode, movieTab, animeTab, selectedGenre, page]);

  // Reload on mode/tab/genre change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    load(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, movieTab, animeTab, selectedGenre]);

  const genres = mode === 'movies' ? MOVIE_GENRES : ANIME_GENRES;

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem,4vw,2rem)', fontWeight: 800,
          background: 'linear-gradient(135deg,#fff 40%,#7c6fff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '0.4rem',
        }}>🧭 Discover</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
          Browse by category or genre — save anything you want to watch
        </p>
      </div>

      {/* Mode toggle: Movies / Anime */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1.5rem', marginBottom: '1rem' }}>
        {[
          { id: 'movies', label: '🎬 Movies' },
          { id: 'anime',  label: '🎌 Anime' },
        ].map(m => (
          <button key={m.id}
            id={`discover-mode-${m.id}`}
            className={`tab${mode === m.id ? ' active' : ''}`}
            style={{ fontSize: '0.92rem', padding: '0.5rem 1.2rem' }}
            onClick={() => { setMode(m.id); setSelectedGenre(null); }}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
        <div className="tabs" style={{ justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
          {(mode === 'movies' ? MOVIE_TABS : ANIME_TABS).map(t => (
            <button key={t.id}
              id={`discover-tab-${t.id}`}
              className={`tab${(mode === 'movies' ? movieTab : animeTab) === t.id && !selectedGenre ? ' active' : ''}`}
              onClick={() => {
                setSelectedGenre(null);
                if (mode === 'movies') setMovieTab(t.id);
                else setAnimeTab(t.id);
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre pills */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            className={`genre-tag${!selectedGenre ? ' active-genre' : ''}`}
            style={{
              cursor: 'pointer', border: 'none', padding: '0.25rem 0.7rem',
              background: !selectedGenre ? 'rgba(124,111,255,0.25)' : 'rgba(124,111,255,0.08)',
              borderRadius: '999px', fontSize: '0.75rem', color: 'var(--accent)',
              border: `1px solid ${!selectedGenre ? 'rgba(124,111,255,0.5)' : 'rgba(124,111,255,0.2)'}`,
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onClick={() => setSelectedGenre(null)}>
            All
          </button>
          {genres.map(g => (
            <button key={g.id}
              id={`genre-${g.id}`}
              className="genre-tag"
              style={{
                cursor: 'pointer', border: 'none',
                padding: '0.25rem 0.7rem', borderRadius: '999px',
                fontSize: '0.75rem', fontFamily: 'inherit',
                transition: 'all 0.2s',
                background: selectedGenre === g.id ? 'rgba(255,107,157,0.2)' : 'rgba(124,111,255,0.08)',
                color: selectedGenre === g.id ? 'var(--accent-2)' : 'var(--accent)',
                border: `1px solid ${selectedGenre === g.id ? 'rgba(255,107,157,0.4)' : 'rgba(124,111,255,0.2)'}`,
              }}
              onClick={() => setSelectedGenre(g.id === selectedGenre ? null : g.id)}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '1rem 1.5rem', color: 'var(--accent-2)', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      {loading && items.length === 0
        ? <SkeletonGrid count={12} label="Loading discovery…" />
        : (
          <div className="results-grid">
            {items.map((item, i) => (
              <DiscoverCard key={`${item.type}-${item.id}-${i}`} item={item} onClick={onCardClick} />
            ))}
          </div>
        )
      }

      {/* Load more */}
      {items.length > 0 && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
          <button
            id="discover-load-more"
            onClick={() => load(false)}
            disabled={loading}
            style={{
              padding: '0.6rem 2rem', borderRadius: '999px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              border: 'none', color: '#fff', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1, fontFamily: 'inherit',
              transition: 'opacity 0.2s',
            }}>
            {loading ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}

      {/* No more */}
      {!hasMore && items.length > 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', padding: '1.5rem' }}>
          — You've reached the end —
        </p>
      )}
    </div>
  );
}
