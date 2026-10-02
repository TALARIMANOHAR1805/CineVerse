/**
 * App.jsx — CineVerse v6 (Day 6 — Professional Redesign)
 *
 * Features:
 *  - Professional dark UI with Playfair Display + Inter typography
 *  - Cinematic hero section with gradient background
 *  - Hover-overlay media cards with save button
 *  - Detail panel with tabs: Details / Similar / Watch Where / Timeline
 *  - Glassmorphism navbar with active state underlines
 *  - Discover page with category + genre filters
 *  - Watchlist with stats dashboard and progress bar
 *
 * Author: Koushik-31368
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import './index.css';
import useKeyboardShortcuts from './useKeyboardShortcuts';
import {
  search, fetchTrendingMovies, fetchTopAnime,
  fetchMovieDetails, fetchAnimeDetails, fetchTimeline,
  fetchSimilarMovies, fetchSimilarAnime, fetchWatchProviders,
  hasTmdbKey,
} from './api';
import ErrorBoundary from './ErrorBoundary';
import { ToastContainer, showToast } from './Toast';
import { WatchlistProvider, useWatchlist } from './WatchlistContext';
import WatchlistPage from './WatchlistPage';
import DiscoverPage from './DiscoverPage';
import Footer from './Footer';

/* ─────────────────────────────────────────────────────────────
   MediaCard — professional card with hover overlay
   ───────────────────────────────────────────────────────────── */
function MediaCard({ item, onClick }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isWatched } = useWatchlist();
  const saved   = isInWatchlist(item.id, item.type);
  const watched = isWatched(item.id, item.type);
  const [imgErr, setImgErr] = useState(false);

  const handleSave = (e) => {
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(item.id, item.type);
      showToast(`Removed "${item.title}"`, 'info');
    } else {
      addToWatchlist(item);
      showToast(`Saved "${item.title}" ✓`, 'success');
    }
  };

  return (
    <div
      className="media-card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
      aria-label={`View details for ${item.title}`}
    >
      <div className="media-card__poster-wrap">
        {/* Watched badge */}
        {watched && <div className="media-card__watched-badge">✓ Watched</div>}

        {/* Type badge */}
        <span className={`media-card__type-badge media-card__type-badge--${item.type}`}>
          {item.type === 'anime' ? 'Anime' : 'Movie'}
        </span>

        {/* Rating badge */}
        {item.rating > 0 && (
          <div className="media-card__rating">
            ⭐ {item.rating}
          </div>
        )}

        {/* Poster */}
        {item.posterUrl && !imgErr
          ? <img
              className="media-card__poster"
              src={item.posterUrl}
              alt={item.title}
              loading="lazy"
              onError={() => setImgErr(true)}
            />
          : <div className="media-card__poster-placeholder">
              {item.type === 'anime' ? '🎌' : '🎬'}
            </div>
        }

        {/* Hover overlay */}
        <div className="media-card__overlay">
          <div className="media-card__play-btn" aria-hidden="true">▶</div>
        </div>

        {/* Save button */}
        <button
          id={`save-${item.type}-${item.id}`}
          className={`media-card__save-btn${saved ? ' media-card__save-btn--saved' : ''}`}
          onClick={handleSave}
          aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {saved ? '🔖' : '+'}
        </button>
      </div>

      <div className="media-card__info">
        <p className="media-card__title">{item.title}</p>
        <div className="media-card__meta">
          <span className="media-card__year">{item.year}</span>
          {item.genres?.length > 0 && (
            <>
              <span className="media-card__dot">·</span>
              <span>{item.genres[0]}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton Cards
   ───────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__poster" />
      <div className="skeleton-card__body">
        <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '85%' }} />
        <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '55%' }} />
      </div>
    </div>
  );
}

function SkeletonGrid({ count = 12 }) {
  return (
    <div className="cards-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Detail Panel
   ───────────────────────────────────────────────────────────── */
function DetailPanel({ item: baseItem, onClose }) {
  const [item, setItem]           = useState(baseItem);
  const [activeTab, setActiveTab] = useState('details');
  const [timeline, setTimeline]   = useState(null);
  const [tlLoading, setTlLoading] = useState(false);
  const [tlError, setTlError]     = useState(null);
  const [similar, setSimilar]     = useState([]);
  const [simLoading, setSimLoading] = useState(false);
  const [providers, setProviders] = useState(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isWatched, markWatched, unmarkWatched } = useWatchlist();
  const saved   = isInWatchlist(item.id, item.type);
  const watched = isWatched(item.id, item.type);

  // Fetch full details on mount
  useEffect(() => {
    const fn = item.type === 'movie' ? fetchMovieDetails : fetchAnimeDetails;
    fn(item.id).then(d => { if (d) setItem(d); }).catch(() => {});
  }, [item.id, item.type]);

  // Fetch timeline on mount
  useEffect(() => {
    if (activeTab === 'timeline' && !timeline && !tlLoading) {
      setTlLoading(true); setTlError(null);
      fetchTimeline(item.id, item.type)
        .then(t => setTimeline(t))
        .catch(() => setTlError('Failed to load timeline.'))
        .finally(() => setTlLoading(false));
    }
    if (activeTab === 'similar' && similar.length === 0 && !simLoading) {
      setSimLoading(true);
      const fn = item.type === 'movie' ? fetchSimilarMovies : fetchSimilarAnime;
      fn(item.id)
        .then(r => setSimilar(r || []))
        .finally(() => setSimLoading(false));
    }
    if (activeTab === 'watch' && providers === null && item.type === 'movie') {
      fetchWatchProviders(item.id).then(r => setProviders(r || false));
    }
  }, [activeTab, item.id, item.type, similar.length, providers, timeline, tlLoading]);

  // Escape key
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleBookmark = () => {
    if (saved) { removeFromWatchlist(item.id, item.type); showToast(`Removed "${item.title}"`, 'info'); }
    else       { addToWatchlist(item); showToast(`Saved "${item.title}" ✓`, 'success'); }
  };

  const handleWatched = () => {
    if (!saved) addToWatchlist(item);
    if (watched) { unmarkWatched(item.id, item.type); showToast('Marked as unwatched', 'info'); }
    else         { markWatched(item.id, item.type);   showToast(`"${item.title}" marked as watched ✓`, 'success'); }
  };

  const TABS = [
    { id: 'details',  label: 'Details' },
    { id: 'similar',  label: 'Similar' },
    ...(item.type === 'movie' ? [{ id: 'watch', label: 'Watch Where' }] : []),
    { id: 'timeline', label: 'Timeline' },
  ];

  return (
    <div className="detail-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="detail-panel" role="dialog" aria-modal="true" aria-label={item.title}>

        {/* Header */}
        <div className="detail-panel__header">
          <button className="detail-panel__back" onClick={onClose}>← Back</button>
          <div className="detail-panel__title-area">
            <div className={`detail-panel__type-pill detail-panel__type-pill--${item.type}`}>
              {item.type === 'anime' ? '🎌 Anime' : '🎬 Movie'}
            </div>
            <h2 className="detail-panel__title">{item.title}</h2>
          </div>
          <div className="detail-panel__actions">
            <button
              id="panel-watched-btn"
              className={`btn--watched${watched ? ' btn--watched--active' : ''}`}
              onClick={handleWatched}
            >
              {watched ? '✓ Watched' : 'Watched?'}
            </button>
            <button
              id="panel-save-btn"
              className={`btn--save${saved ? ' btn--save--saved' : ''}`}
              onClick={handleBookmark}
            >
              {saved ? '🔖 Saved' : '+ Save'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-panel__tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`detail-panel__tab${activeTab === t.id ? ' detail-panel__tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="detail-panel__body">

          {/* ── Details Tab ── */}
          {activeTab === 'details' && (
            <>
              <div className="detail-info-grid">
                <div>
                  {item.posterUrl
                    ? <img className="detail-poster" src={item.posterUrl} alt={item.title} />
                    : <div className="detail-poster-ph">{item.type === 'anime' ? '🎌' : '🎬'}</div>
                  }
                </div>
                <div className="detail-meta">
                  {item.rating > 0 && (
                    <div className="detail-rating">
                      ⭐ {item.rating}
                      <span className="detail-rating__max">/ 10</span>
                    </div>
                  )}
                  {item.genres?.length > 0 && (
                    <div className="detail-tags">
                      {item.genres.map(g => (
                        <span key={g} className="detail-tag">{g}</span>
                      ))}
                    </div>
                  )}
                  {item.year && (
                    <div className="detail-info-row">
                      <span className="detail-info-row__label">Year</span>
                      <span className="detail-info-row__value">{item.year}</span>
                    </div>
                  )}
                  {item.episodes && (
                    <div className="detail-info-row">
                      <span className="detail-info-row__label">Episodes</span>
                      <span className="detail-info-row__value">{item.episodes}</span>
                    </div>
                  )}
                  {item.runtime && (
                    <div className="detail-info-row">
                      <span className="detail-info-row__label">Runtime</span>
                      <span className="detail-info-row__value">{item.runtime} min</span>
                    </div>
                  )}
                  {item.status && (
                    <div className="detail-info-row">
                      <span className="detail-info-row__label">Status</span>
                      <span className="detail-info-row__value">{item.status}</span>
                    </div>
                  )}
                  {item.studio && (
                    <div className="detail-info-row">
                      <span className="detail-info-row__label">Studio</span>
                      <span className="detail-info-row__value">{item.studio}</span>
                    </div>
                  )}
                  {item.openingTheme && (
                    <div className="detail-info-row">
                      <span className="detail-info-row__label">Opening</span>
                      <span className="detail-info-row__value" style={{ fontSize: '0.75rem' }}>{item.openingTheme}</span>
                    </div>
                  )}
                </div>
              </div>

              {item.overview && (
                <div className="detail-overview">
                  <p className="detail-section-title">Overview</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: 1.75 }}>{item.overview}</p>
                </div>
              )}
            </>
          )}

          {/* ── Timeline Tab ── */}
          {activeTab === 'timeline' && (
            <div>
              {tlLoading && (
                <div className="empty-state">
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Building timeline…</p>
                </div>
              )}
              {tlError && !tlLoading && (
                <div className="empty-state">
                  <div className="empty-state__icon">🔌</div>
                  <p className="empty-state__title">Timeline Unavailable</p>
                  <p className="empty-state__desc">Connect the backend service to enable franchise timelines.</p>
                </div>
              )}
              {!tlLoading && !tlError && timeline && timeline.entries?.length > 0 && (
                <div>
                  {timeline.entries.map((entry, i) => (
                    <div key={entry.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                      <div style={{
                        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                        background: entry.isCurrent ? 'var(--brand-gradient)' : 'var(--bg-surface-3)',
                        border: `2px solid ${entry.isCurrent ? 'var(--brand)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', fontWeight: 700, color: entry.isCurrent ? 'white' : 'var(--text-muted)',
                      }}>{entry.position}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: entry.isCurrent ? 'var(--brand)' : 'var(--text-primary)', margin: 0 }}>
                          {entry.title}
                          {entry.isCurrent && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--brand)', fontWeight: 700 }}>▶ YOU ARE HERE</span>}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{entry.year}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!tlLoading && !tlError && (!timeline || timeline.entries?.length === 0) && (
                <div className="empty-state">
                  <div className="empty-state__icon">📋</div>
                  <p className="empty-state__title">No Timeline Found</p>
                  <p className="empty-state__desc">This title doesn't have franchise timeline data yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ── Similar Tab ── */}
          {activeTab === 'similar' && (
            <div>
              {simLoading && <SkeletonGrid count={6} />}
              {!simLoading && similar.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state__icon">🎯</div>
                  <p className="empty-state__title">No Similar Titles Found</p>
                </div>
              )}
              {!simLoading && similar.length > 0 && (
                <>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {similar.length} titles similar to <strong style={{ color: 'var(--text-secondary)' }}>{item.title}</strong>
                  </p>
                  <div className="similar-grid">
                    {similar.map((s, i) => (
                      <div key={`${s.id}-${i}`} className="media-card" style={{ cursor: 'default' }}>
                        <div className="media-card__poster-wrap">
                          <span className={`media-card__type-badge media-card__type-badge--${s.type}`}>{s.type}</span>
                          {s.rating > 0 && <div className="media-card__rating">⭐ {s.rating}</div>}
                          {s.posterUrl
                            ? <img className="media-card__poster" src={s.posterUrl} alt={s.title} loading="lazy" />
                            : <div className="media-card__poster-placeholder">{s.type === 'anime' ? '🎌' : '🎬'}</div>
                          }
                        </div>
                        <div className="media-card__info">
                          <p className="media-card__title">{s.title}</p>
                          <div className="media-card__meta">
                            <span className="media-card__year">{s.year}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Watch Where Tab ── */}
          {activeTab === 'watch' && item.type === 'movie' && (
            <div>
              {providers === null && (
                <div className="empty-state">
                  <div className="skeleton" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Checking streaming services…</p>
                </div>
              )}
              {providers === false && (
                <div className="empty-state">
                  <div className="empty-state__icon">📺</div>
                  <p className="empty-state__title">Not Available in Your Region</p>
                  <p className="empty-state__desc">
                    Streaming data is region-specific.
                    {!hasTmdbKey() && ' Add a TMDB API key to enable this feature.'}
                  </p>
                </div>
              )}
              {providers && providers !== false && (
                <div>
                  {providers.link && (
                    <a
                      href={providers.link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn--ghost"
                      style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
                    >
                      🔗 View on JustWatch
                    </a>
                  )}
                  {[
                    { label: 'Stream', arr: providers.flatrate },
                    { label: 'Rent',   arr: providers.rent },
                    { label: 'Buy',    arr: providers.buy },
                  ].filter(g => g.arr?.length > 0).map(g => (
                    <div key={g.label} style={{ marginBottom: '1.5rem' }}>
                      <p className="detail-section-title">{g.label}</p>
                      <div className="providers-grid">
                        {g.arr.map(p => (
                          <div key={p.id} className="provider-chip" title={p.name}>
                            <img
                              src={p.logo} alt={p.name}
                              onError={e => { e.target.style.display = 'none'; }}
                            />
                            <span className="provider-chip__name">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Navbar
   ───────────────────────────────────────────────────────────── */
function AppNavbar({ currentPage, onNav }) {
  const { watchlist } = useWatchlist();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const NAV = [
    { id: 'home',      label: 'Home',      icon: '🏠', shortcut: 'H' },
    { id: 'discover',  label: 'Discover',  icon: '🧭', shortcut: 'D' },
    { id: 'watchlist', label: 'Watchlist', icon: '📚', shortcut: 'W', badge: watchlist.length },
  ];

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="navigation">
      <button className="navbar__logo" onClick={() => onNav('home')} aria-label="CineVerse Home">
        <span className="navbar__logo-icon">🎬</span>
        CineVerse
      </button>
      <div className="navbar__nav">
        {NAV.map(n => (
          <button
            key={n.id}
            id={`nav-${n.id}`}
            className={`navbar__nav-btn${currentPage === n.id ? ' navbar__nav-btn--active' : ''}`}
            onClick={() => onNav(n.id)}
            aria-current={currentPage === n.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{n.icon}</span>
            <span>{n.label}</span>
            {n.badge > 0 && <span className="navbar__badge">{n.badge}</span>}
            <kbd className="navbar__shortcut">{n.shortcut}</kbd>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   Search Bar with History
   ───────────────────────────────────────────────────────────── */
function SearchBar({ query, onChange, onSearch, onClear, history, onHistorySelect, onHistoryClear }) {
  const [showHistory, setShowHistory] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setShowHistory(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleKey = e => {
    if (e.key === 'Enter') { onSearch(query); setShowHistory(false); }
    if (e.key === 'Escape') { onClear(); setShowHistory(false); }
  };

  return (
    <div className="search-wrap" ref={ref}>
      <div className="search-bar">
        <span className="search-bar__icon" aria-hidden="true">🔍</span>
        <input
          id="search-input"
          className="search-bar__input"
          type="text"
          placeholder="Search movies, anime, series…"
          value={query}
          onChange={e => { onChange(e.target.value); setShowHistory(false); }}
          onKeyDown={handleKey}
          onFocus={() => { if (history.length > 0 && !query) setShowHistory(true); }}
          autoComplete="off"
          spellCheck="false"
          aria-label="Search CineVerse"
        />
        {query && (
          <button className="search-bar__clear" onClick={onClear} aria-label="Clear search">
            Clear
          </button>
        )}
      </div>

      {showHistory && history.length > 0 && (
        <div className="search-history" role="listbox" aria-label="Recent searches">
          <div className="search-history__header">
            <span>Recent</span>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'Inter, sans-serif' }}
              onClick={onHistoryClear}
            >Clear all</button>
          </div>
          {history.map((q, i) => (
            <button
              key={i}
              className="search-history__item"
              role="option"
              onClick={() => { onHistorySelect(q); setShowHistory(false); }}
            >
              <span className="search-history__icon" aria-hidden="true">🕐</span>
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Home Page
   ───────────────────────────────────────────────────────────── */
function HomePage({ onCardClick }) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState({ movies: [], anime: [] });
  const [trending, setTrending]     = useState({ movies: [], anime: [] });
  const [loading, setLoading]       = useState(false);
  const [trendLoading, setTrendLoading] = useState(true);
  const [searched, setSearched]     = useState(false);
  const [history, setHistory]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('cv_history') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    setTrendLoading(true);
    Promise.all([fetchTrendingMovies(), fetchTopAnime()])
      .then(([m, a]) => setTrending({ movies: m || [], anime: a || [] }))
      .finally(() => setTrendLoading(false));
  }, []);

  const doSearch = useCallback((q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    setHistory(prev => {
      const next = [q, ...prev.filter(h => h !== q)].slice(0, 8);
      localStorage.setItem('cv_history', JSON.stringify(next));
      return next;
    });
    search(q)
      .then(r => setResults({ movies: r.movies || [], anime: r.anime || [] }))
      .catch(() => setResults({ movies: [], anime: [] }))
      .finally(() => setLoading(false));
  }, []);

  const doClear = useCallback(() => {
    setQuery('');
    setSearched(false);
    setResults({ movies: [], anime: [] });
  }, []);

  // Expose search for keyboard shortcut
  useEffect(() => {
    const h = e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const allResults = [...results.movies, ...results.anime];
  const showTrending = !searched;
  const totalTrending = trending.movies.length + trending.anime.length;

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero__eyebrow">
          <span>🌟</span> Discover What to Watch Next
        </div>
        <h1 className="hero__title">
          Your Universe of<br />
          <span>Movies & Anime</span>
        </h1>
        <p className="hero__subtitle">
          Search millions of titles, discover trending content, track your watchlist
          and find where to stream — all in one place.
        </p>

        <SearchBar
          query={query}
          onChange={setQuery}
          onSearch={doSearch}
          onClear={doClear}
          history={history}
          onHistorySelect={q => { setQuery(q); doSearch(q); }}
          onHistoryClear={() => { setHistory([]); localStorage.removeItem('cv_history'); }}
        />

        {showTrending && (
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">{totalTrending || '1M+'}</span>
              <span className="hero__stat-label">Titles</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">Live</span>
              <span className="hero__stat-label">Trending Data</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-value">Free</span>
              <span className="hero__stat-label">No Sign Up</span>
            </div>
          </div>
        )}
      </section>

      {/* Search Results */}
      {searched && (
        <div className="section">
          {loading ? (
            <SkeletonGrid />
          ) : allResults.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <p className="empty-state__title">No Results Found</p>
              <p className="empty-state__desc">
                Try a different title, check the spelling, or search by genre.
              </p>
            </div>
          ) : (
            <>
              <div className="section-header">
                <div className="section-title">
                  <span>Results for "{query}"</span>
                </div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {allResults.length} found
                </span>
              </div>
              <div className="cards-grid">
                {allResults.map(item => (
                  <MediaCard key={`${item.type}-${item.id}`} item={item} onClick={onCardClick} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Trending sections */}
      {showTrending && (
        <>
          <div className="section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-title__icon">🔥</span>
                Trending Movies
              </div>
              <span className="section-badge section-badge--live">● Live</span>
            </div>
            {trendLoading ? (
              <SkeletonGrid count={8} />
            ) : trending.movies.length > 0 ? (
              <div className="cards-grid">
                {trending.movies.map(item => (
                  <MediaCard key={`movie-${item.id}`} item={item} onClick={onCardClick} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state__desc">Add a TMDB API key to see trending movies.</p>
              </div>
            )}
          </div>

          <div className="section">
            <div className="section-header">
              <div className="section-title">
                <span className="section-title__icon">🎌</span>
                Top Anime
              </div>
              <span className="section-badge section-badge--new">Updated</span>
            </div>
            {trendLoading ? (
              <SkeletonGrid count={8} />
            ) : trending.anime.length > 0 ? (
              <div className="cards-grid">
                {trending.anime.map(item => (
                  <MediaCard key={`anime-${item.id}`} item={item} onClick={onCardClick} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p className="empty-state__desc">Fetching top anime from Jikan…</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   App Root
   ───────────────────────────────────────────────────────────── */
function AppContent() {
  const [page, setPage]       = useState('home');
  const [selected, setSelected] = useState(null);

  const handleNav = useCallback((p) => { setPage(p); setSelected(null); }, []);
  const handleCardClick = useCallback((item) => setSelected(item), []);
  const handleClose = useCallback(() => setSelected(null), []);

  useKeyboardShortcuts({
    'h': () => handleNav('home'),
    'd': () => handleNav('discover'),
    'w': () => handleNav('watchlist'),
  });

  return (
    <div className="app-shell">
      <AppNavbar currentPage={page} onNav={handleNav} />
      <main className="app-main" id="main-content">
        {page === 'home'      && <HomePage onCardClick={handleCardClick} />}
        {page === 'discover'  && <DiscoverPage onCardClick={handleCardClick} />}
        {page === 'watchlist' && <WatchlistPage onCardClick={handleCardClick} />}
      </main>
      <Footer />

      {selected && (
        <DetailPanel item={selected} onClose={handleClose} />
      )}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <WatchlistProvider>
        <AppContent />
      </WatchlistProvider>
    </ErrorBoundary>
  );
}
