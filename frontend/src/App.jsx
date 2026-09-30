/**
 * App.jsx — CineVerse v5 (Day 5 — Discover, Similar, Watch Where, Mark Watched)
 * Author: Koushik-31368
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import './index.css';
import './App.css';
import './App.day5.css';
import useKeyboardShortcuts from './useKeyboardShortcuts';
import {
  search, fetchTrendingMovies, fetchTopAnime,
  fetchMovieDetails, fetchAnimeDetails, fetchTimeline,
  fetchSimilarMovies, fetchSimilarAnime, fetchWatchProviders,
  hasTmdbKey, hasBackend,
} from './api';
import ErrorBoundary from './ErrorBoundary';
import { SkeletonGrid } from './Skeleton';
import { ToastContainer, showToast } from './Toast';
import { WatchlistProvider, useWatchlist } from './WatchlistContext';
import WatchlistPage from './WatchlistPage';
import DiscoverPage from './DiscoverPage';
import Footer from './Footer';

/* ─────────────────────────────────────────────────────────── */
/* Media Card                                                   */
/* ─────────────────────────────────────────────────────────── */
function MediaCard({ item, onClick }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);
  const [imgErr, setImgErr] = useState(false);

  const handleBookmark = (e) => {
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
    <div className="card" onClick={() => onClick(item)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}>
      <button className="card__bookmark" onClick={handleBookmark}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}>
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
        {item.genres?.length > 0 && (
          <div className="genre-list">
            {item.genres.slice(0, 3).map(g => <span key={g} className="genre-tag">{g}</span>)}
          </div>
        )}
        <div className="card__cta">View details →</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Section                                                      */
/* ─────────────────────────────────────────────────────────── */
function Section({ title, icon, items, onCardClick, badge }) {
  if (!items?.length) return null;
  return (
    <div className="section-divider">
      <div className="section-header">
        <span style={{ fontSize:'1.2rem' }}>{icon}</span>
        <h2 className="section-title">{title}</h2>
        {badge && <span className="section-count">{badge}</span>}
      </div>
      <div className="results-grid">
        {items.map((item, i) => (
          <MediaCard key={`${item.type}-${item.id}-${i}`} item={item} onClick={onCardClick} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Detail Panel                                                 */
/* ─────────────────────────────────────────────────────────── */
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

  // Enrich item details
  useEffect(() => {
    let cancelled = false;
    async function enrich() {
      try {
        const details = item.type === 'movie'
          ? await fetchMovieDetails(item.id)
          : await fetchAnimeDetails(item.id);
        if (!cancelled && details) setItem(prev => ({ ...prev, ...details }));
      } catch {}
    }
    enrich();
    return () => { cancelled = true; };
  }, [item.id, item.type]);

  // Fetch timeline when tab opened
  useEffect(() => {
    if (activeTab !== 'timeline' || timeline) return;
    let cancelled = false;
    async function load() {
      setTlLoading(true); setTlError(null);
      try {
        const data = await fetchTimeline(item);
        if (!cancelled) setTimeline(data || { entries: [] });
      } catch (e) {
        if (!cancelled) setTlError('Timeline unavailable (backend not connected)');
      } finally {
        if (!cancelled) setTlLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab, item, timeline]);

  // Fetch similar / watch providers when those tabs are opened
  useEffect(() => {
    if (activeTab === 'similar' && similar.length === 0) {
      setSimLoading(true);
      const fn = item.type === 'movie' ? fetchSimilarMovies(item.id) : fetchSimilarAnime(item.id);
      fn.then(r => { setSimilar(r); setSimLoading(false); });
    }
    if (activeTab === 'watch' && providers === null && item.type === 'movie') {
      fetchWatchProviders(item.id).then(r => setProviders(r || false));
    }
  }, [activeTab, item.id, item.type, similar.length, providers]);

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
    if (!saved) { addToWatchlist(item); }
    if (watched) { unmarkWatched(item.id, item.type); showToast('Marked as unwatched', 'info'); }
    else         { markWatched(item.id, item.type);   showToast('Marked as watched ✓', 'success'); }
  };

  const TABS = [
    { id: 'details',  label: '📖 Details' },
    { id: 'similar',  label: '🎯 Similar' },
    ...(item.type === 'movie' ? [{ id: 'watch', label: '📺 Watch Where' }] : []),
    { id: 'timeline', label: '📅 Timeline' },
  ];

  return (
    <div className="tl-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tl-panel" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="tl-panel__header">
          <button className="tl-back-btn" onClick={onClose}>← Back</button>
          <div className="tl-panel__title-wrap">
            <span className={`tl-type-badge tl-type-badge--${item.type}`}>{item.type}</span>
            <h2 className="tl-panel__franchise">{item.title}</h2>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <button
              id="panel-watched-btn"
              onClick={handleWatched}
              style={{
                padding:'0.35rem 0.85rem', borderRadius:'999px', border:'1px solid',
                borderColor: watched ? 'rgba(80,220,120,0.4)' : 'rgba(255,255,255,0.15)',
                background:  watched ? 'rgba(80,220,120,0.15)' : 'transparent',
                color: watched ? 'rgb(80,220,120)' : 'var(--text-2)',
                fontSize:'0.78rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit',
                transition:'all 0.2s',
              }}>
              {watched ? '✅ Watched' : '○ Watched?'}
            </button>
            <button onClick={handleBookmark} className={`panel-save-btn ${saved ? 'panel-save-btn--saved' : ''}`}>
              {saved ? '🔖 Saved' : '+ Save'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tl-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`tl-tab${activeTab === t.id ? ' tl-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="tl-body">
          {activeTab === 'details' && (
            <div className="tl-detail">
              <div className="tl-detail__left">
                {item.posterUrl
                  ? <img className="tl-detail__poster" src={item.posterUrl} alt={item.title} />
                  : <div className="tl-detail__poster-ph">{item.type === 'anime' ? '🎌' : '🎬'}</div>
                }
              </div>
              <div className="tl-detail__right">
                <p className="tl-detail__label">
                  {item.type === 'anime' ? 'Anime' : 'Movie'}
                </p>
                <h3 className="tl-detail__title">{item.title}</h3>
                <div className="tl-detail__meta">
                  {item.year && item.year !== '—' && <span className="tl-detail__chip">📅 {item.year}</span>}
                  {item.rating > 0 && <span className="tl-detail__chip">⭐ {item.rating} / 10</span>}
                  {item.runtime && <span className="tl-detail__chip">⏱ {item.runtime} min</span>}
                  {item.episodes && <span className="tl-detail__chip">📺 {item.episodes} eps</span>}
                  {item.status && <span className="tl-detail__chip">📡 {item.status}</span>}
                </div>
                {item.genres?.length > 0 && (
                  <div className="genre-list" style={{ marginBottom: '1rem' }}>
                    {item.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
                  </div>
                )}
                {item.tagline && (
                  <p style={{ fontStyle:'italic', color:'var(--text-3)', fontSize:'0.88rem', marginBottom:'0.75rem' }}>
                    "{item.tagline}"
                  </p>
                )}
                <p className="tl-detail__synopsis">{item.synopsis || 'No synopsis available.'}</p>
                {item.cast?.length > 0 && (
                  <div style={{ marginTop:'1rem' }}>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-3)', marginBottom:'0.4rem' }}>CAST</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
                      {item.cast.slice(0, 8).map(c => (
                        <span key={c} style={{
                          fontSize:'0.72rem', padding:'0.15rem 0.5rem',
                          background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)',
                          borderRadius:'999px', color:'var(--text-2)',
                        }}>{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {item.studios?.length > 0 && (
                  <div style={{ marginTop:'0.75rem' }}>
                    <p style={{ fontSize:'0.78rem', color:'var(--text-3)', marginBottom:'0.4rem' }}>STUDIO</p>
                    <p style={{ fontSize:'0.85rem', color:'var(--text-2)' }}>{item.studios.join(', ')}</p>
                  </div>
                )}
                {item.trailer && (
                  <a href={item.trailer} target="_blank" rel="noreferrer" style={{
                    display:'inline-block', marginTop:'1rem',
                    padding:'0.45rem 1.2rem',
                    background:'linear-gradient(135deg, var(--accent), var(--accent-2))',
                    color:'#fff', borderRadius:'999px', fontSize:'0.85rem',
                    fontWeight:600, textDecoration:'none',
                  }}>▶ Watch Trailer</a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="tl-track-wrap">
              {tlLoading && <div className="tl-loading"><div className="spinner" /><p>Building timeline…</p></div>}
              {tlError && !tlLoading && (
                <div className="tl-loading">
                  <span style={{ fontSize:'2rem' }}>🔌</span>
                  <p style={{ color:'var(--text-2)', maxWidth:320, textAlign:'center' }}>{tlError}</p>
                  <p style={{ fontSize:'0.78rem', color:'var(--text-3)', marginTop:'0.5rem' }}>
                    Timeline requires the backend to be running
                  </p>
                </div>
              )}
              {!tlLoading && !tlError && timeline && (
                timeline.entries?.length > 0 ? (
                  <div className="tl-track">
                    {timeline.entries.map((entry, i) => (
                      <div key={entry.id} className="tl-entry-wrap">
                        <div className={`tl-entry${entry.isCurrent ? ' tl-entry--current' : ''}`}>
                          <div className="tl-position">{entry.position}</div>
                          {entry.posterUrl
                            ? <img className="tl-poster" src={entry.posterUrl} alt={entry.title} loading="lazy" />
                            : <div className="tl-poster-placeholder">🎬</div>
                          }
                          <div className="tl-info">
                            <p className="tl-title">{entry.title}</p>
                            <p className="tl-year">{entry.year}</p>
                          </div>
                          {entry.isCurrent && <div className="tl-here-badge">▶ Here</div>}
                        </div>
                        {i < timeline.entries.length - 1 && <div className="tl-connector" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tl-loading">
                    <span style={{ fontSize:'2rem' }}>📋</span>
                    <p style={{ color:'var(--text-2)' }}>No timeline data available yet.</p>
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === 'similar' && (
            <div style={{ padding: '0 0 1rem' }}>
              {simLoading && (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-2)' }}>
                  <div className="spinner" style={{ margin:'0 auto 0.75rem' }} />
                  <p>Finding similar titles…</p>
                </div>
              )}
              {!simLoading && similar.length === 0 && (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-3)' }}>
                  <p>No similar titles found.</p>
                </div>
              )}
              {!simLoading && similar.length > 0 && (
                <>
                  <p style={{ fontSize:'0.78rem', color:'var(--text-3)', padding:'0.5rem 1rem', marginBottom:'0.5rem' }}>
                    {similar.length} titles similar to {item.title}
                  </p>
                  <div className="results-grid" style={{ padding:'0 1rem' }}>
                    {similar.map((s, i) => (
                      <div key={`${s.id}-${i}`} className="card"
                        onClick={() => { /* open detail */ }}
                        style={{ cursor:'default', opacity:0.92 }}>
                        {s.posterUrl
                          ? <img className="card__poster" src={s.posterUrl} alt={s.title} loading="lazy" />
                          : <div className="card__poster-placeholder">{s.type === 'anime' ? '🏌️' : '🎬'}</div>
                        }
                        <div className="card__body">
                          <p className={`card__type card__type--${s.type}`}>{s.type}</p>
                          <p className="card__title">{s.title}</p>
                          <div className="card__meta">
                            <span className="card__year">{s.year}</span>
                            {s.rating > 0 && <span className="card__rating">⭐ {s.rating}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'watch' && item.type === 'movie' && (
            <div style={{ padding:'1rem' }}>
              {providers === null && (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-2)' }}>
                  <div className="spinner" style={{ margin:'0 auto 0.75rem' }} />
                  <p>Checking streaming services…</p>
                </div>
              )}
              {providers === false && (
                <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-3)' }}>
                  <p>No streaming data available for your region.</p>
                  {!import.meta.env.VITE_TMDB_API_KEY && (
                    <p style={{ fontSize:'0.8rem', marginTop:'0.5rem' }}>Add TMDB API key to enable this feature.</p>
                  )}
                </div>
              )}
              {providers && providers !== false && (
                <div>
                  {providers.link && (
                    <a href={providers.link} target="_blank" rel="noreferrer"
                      style={{
                        display:'inline-block', marginBottom:'1rem',
                        padding:'0.4rem 1rem', borderRadius:'999px', fontSize:'0.8rem',
                        background:'rgba(124,111,255,0.15)', color:'var(--accent)',
                        border:'1px solid rgba(124,111,255,0.3)', textDecoration:'none',
                      }}>View on JustWatch →</a>
                  )}
                  {[['Stream', providers.flatrate], ['Rent', providers.rent], ['Buy', providers.buy]]
                    .filter(([, arr]) => arr?.length > 0)
                    .map(([label, arr]) => (
                      <div key={label} style={{ marginBottom:'1.25rem' }}>
                        <p style={{ fontSize:'0.75rem', color:'var(--text-3)', marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.6rem' }}>
                          {arr.map(p => (
                            <div key={p.id} title={p.name}
                              style={{
                                display:'flex', flexDirection:'column', alignItems:'center', gap:'0.25rem',
                                padding:'0.4rem', borderRadius:'8px', background:'rgba(255,255,255,0.05)',
                                border:'1px solid rgba(255,255,255,0.08)', minWidth:'56px',
                              }}>
                              <img src={p.logo} alt={p.name}
                                style={{ width:36, height:36, borderRadius:6, objectFit:'cover' }}
                                onError={e => { e.target.style.display = 'none'; }} />
                              <span style={{ fontSize:'0.65rem', color:'var(--text-3)', textAlign:'center', lineHeight:1.2 }}>{p.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          )}

      </div>
    </div>
  </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Navbar                                                       */
/* ─────────────────────────────────────────────────────────── */
function AppNavbar({ currentPage, onNav }) {
  const { watchlist } = useWatchlist();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <button className="navbar__logo" onClick={() => onNav('home')}>🎬 CineVerse</button>
      <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
        <button id="nav-discover"
          className={`nav-btn ${currentPage === 'discover' ? 'nav-btn--active' : ''}`}
          onClick={() => onNav(currentPage === 'discover' ? 'home' : 'discover')}>
          🧭 Discover
        </button>
        <button id="nav-watchlist"
          className={`nav-btn ${currentPage === 'watchlist' ? 'nav-btn--active' : ''}`}
          onClick={() => onNav(currentPage === 'watchlist' ? 'home' : 'watchlist')}>
          🔖 Watchlist
          {watchlist.length > 0 && <span className="nav-badge">{watchlist.length}</span>}
        </button>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Homepage with trending + search                              */
/* ─────────────────────────────────────────────────────────── */
function HomePage({ onCardClick }) {
  const [query, setQuery]         = useState('');
  const [tab, setTab]             = useState('all');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [trending, setTrending]   = useState([]);
  const [topAnime, setTopAnime]   = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const inputRef  = useRef(null);
  const abortRef  = useRef(null);

  const TABS = [
    { id: 'all',   label: '🎯 All' },
    { id: 'movie', label: '🎬 Movies' },
    { id: 'anime', label: '🎌 Anime' },
  ];

  // Load homepage trending on mount
  useEffect(() => {
    let cancelled = false;
    async function loadHome() {
      setHomeLoading(true);
      try {
        const [mov, ani] = await Promise.all([
          fetchTrendingMovies(),
          fetchTopAnime(),
        ]);
        if (!cancelled) { setTrending(mov); setTopAnime(ani); }
      } catch {}
      finally { if (!cancelled) setHomeLoading(false); }
    }
    loadHome();
    return () => { cancelled = true; };
  }, []);

  // '/' focuses search
  useEffect(() => {
    const h = e => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault(); inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  async function doSearch(q = query, t = tab) {
    const trimmed = q.trim();
    if (!trimmed) return;
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true); setError(null); setResults(null);
    try {
      const data = await search(trimmed, t, abortRef.current.signal);
      setResults(data);
      if (data.total === 0) showToast(`No results for "${trimmed}"`, 'info');
    } catch (e) {
      if (e.name === 'AbortError') return;
      setError(e.message || 'Search failed');
      showToast('Search failed — check your internet connection', 'error');
    } finally { setLoading(false); }
  }

  function handleTabChange(t) { setTab(t); if (results) doSearch(query, t); }

  const hasMovies = results?.movies?.length > 0;
  const hasAnime  = results?.anime?.length > 0;
  const hasAny    = hasMovies || hasAnime;
  const isSearching = results !== null || loading || error;

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero__badge">✨ Movies + Anime in one place</div>
        <h1 className="hero__title">Should I watch this?</h1>
        <p className="hero__sub">
          Search any movie or anime — get spoiler-free details, ratings, genres, cast, and watch-order timelines.
        </p>

        {!hasTmdbKey() && !hasBackend() && (
          <div className="setup-hint">
            💡 <strong>Anime search works now!</strong> For movies, add your free
            <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer"> TMDB API key</a>
            &nbsp;as <code>VITE_TMDB_API_KEY</code> in <code>frontend/.env</code>
          </div>
        )}

        <div className="search-wrap">
          <div className="search-box" id="search-box">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              id="search-input"
              className="search-input"
              type="text"
              placeholder='Try "Inception", "Naruto", "One Piece"… (press / to focus)'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button className="search-clear" onClick={() => { setQuery(''); setResults(null); setError(null); inputRef.current?.focus(); }}>✕</button>
            )}
            <button id="search-btn" className="search-btn" onClick={() => doSearch()} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Search'}
            </button>
          </div>
          <div className="tabs" role="tablist">
            {TABS.map(t => (
              <button key={t.id} id={`tab-${t.id}`}
                className={`tab${tab === t.id ? ' active' : ''}`}
                role="tab" aria-selected={tab === t.id}
                onClick={() => handleTabChange(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results OR Homepage */}
      <main className="content" id="results">
        {loading && <SkeletonGrid count={8} />}

        {!loading && error && (
          <div className="state-center">
            <span className="state-icon">⚠️</span>
            <p className="state-title">Search Error</p>
            <p className="state-text">{error}</p>
            <button className="retry-btn" onClick={() => doSearch()}>Retry</button>
          </div>
        )}

        {!loading && !error && results !== null && !hasAny && (
          <div className="state-center">
            <span className="state-icon">🔎</span>
            <p className="state-title">No results found</p>
            <p className="state-text">Try a different spelling or search for another title.</p>
            <button className="retry-btn" style={{ marginTop:'1rem' }}
              onClick={() => { setResults(null); setQuery(''); inputRef.current?.focus(); }}>
              Clear search
            </button>
          </div>
        )}

        {!loading && !error && hasAny && (
          <>
            {(tab === 'all' || tab === 'movie') && hasMovies &&
              <Section title="Movies" icon="🎬" items={results.movies} onCardClick={onCardClick}
                badge={`${results.movies.length} results`} />}
            {(tab === 'all' || tab === 'anime') && hasAnime &&
              <Section title="Anime"  icon="🎌" items={results.anime}  onCardClick={onCardClick}
                badge={`${results.anime.length} results`} />}
          </>
        )}

        {/* Homepage — show when no search */}
        {!isSearching && (
          <>
            {homeLoading && <SkeletonGrid count={8} />}
            {!homeLoading && (
              <>
                <Section title="Trending This Week" icon="🔥" items={trending}
                  onCardClick={onCardClick}
                  badge={hasTmdbKey() ? 'Live from TMDB' : 'Add TMDB key to enable'} />
                <Section title="Top Airing Anime" icon="🌸" items={topAnime}
                  onCardClick={onCardClick} badge="Live from Jikan" />
                {!trending.length && !topAnime.length && (
                  <div className="state-center" style={{ marginTop:'2rem' }}>
                    <span className="state-icon">🎬</span>
                    <p className="state-title">Welcome to CineVerse</p>
                    <p className="state-text">Search any movie or anime above to get started!</p>
                    <p className="state-text" style={{ marginTop:'0.5rem', fontSize:'0.8rem', opacity:0.6 }}>
                      Press <kbd style={{ padding:'0.1rem 0.35rem', border:'1px solid var(--border)', borderRadius:4 }}>/</kbd> to focus search
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Root App                                                     */
/* ─────────────────────────────────────────────────────────── */
function AppContent() {
  const [page, setPage]           = useState('home');
  const [detailItem, setDetailItem] = useState(null);

  const openDetail = useCallback((item) => {
    setDetailItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onDiscover:  () => setPage('discover'),
    onWatchlist: () => setPage('watchlist'),
    onHome:      () => setPage('home'),
    onEscape:    () => { if (detailItem) setDetailItem(null); else setPage('home'); },
  });

  return (
    <div className="app">
      <AppNavbar currentPage={page} onNav={setPage} />
      <ToastContainer />

      {page === 'watchlist' ? (
        <main className="content">
          <WatchlistPage onCardClick={(item) => { openDetail(item); setPage('home'); }} />
        </main>
      ) : page === 'discover' ? (
        <main className="content">
          <DiscoverPage onCardClick={openDetail} />
        </main>
      ) : (
        <HomePage onCardClick={openDetail} />
      )}

      {detailItem && (
        <DetailPanel item={detailItem} onClose={() => setDetailItem(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <WatchlistProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </WatchlistProvider>
  );
}
