/**
 * App.jsx — CineVerse v2 (Day 3 Major Overhaul)
 * Full watchlist, toast, skeleton, dark theme, responsive nav, footer, watchlist page
 * Author: Koushik-31368
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import ErrorBoundary from './ErrorBoundary';
import { SkeletonGrid } from './Skeleton';
import { ToastContainer, showToast } from './Toast';
import { WatchlistProvider, useWatchlist } from './WatchlistContext';
import WatchlistPage from './WatchlistPage';
import Footer from './Footer';

let API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
if (API && !API.endsWith('/api')) API = `${API}/api`;
const ML_API = import.meta.env.VITE_ML_API_BASE_URL || 'http://localhost:8001/api/ml';

/* ─────────────────────────────────────────────────────────── */
/* Media Card                                                   */
/* ─────────────────────────────────────────────────────────── */
function MediaCard({ item, onClick }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(item.id, item.type);
      showToast(`Removed "${item.title}"`, 'info');
    } else {
      addToWatchlist(item);
      showToast(`Saved "${item.title}" to watchlist ✓`, 'success');
    }
  };

  return (
    <div className="card" onClick={() => onClick(item)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}>
      {/* Bookmark button */}
      <button
        className="card__bookmark"
        onClick={handleBookmark}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
        title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
      >
        {saved ? '🔖' : '＋'}
      </button>

      {item.posterUrl
        ? <img className="card__poster" src={item.posterUrl} alt={item.title} loading="lazy" />
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
        <div className="card__timeline-hint">View details →</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Results Section                                             */
/* ─────────────────────────────────────────────────────────── */
function ResultsSection({ title, icon, items, onCardClick }) {
  if (!items?.length) return null;
  return (
    <div className="section-divider">
      <div className="section-header">
        <span>{icon}</span>
        <h2 className="section-title">{title}</h2>
        <span className="section-count">{items.length} results</span>
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
/* Timeline Entry                                               */
/* ─────────────────────────────────────────────────────────── */
function TimelineEntry({ entry }) {
  return (
    <div className={`tl-entry${entry.isCurrent ? ' tl-entry--current' : ''}`}>
      <div className="tl-position">{entry.position}</div>
      {entry.posterUrl
        ? <img className="tl-poster" src={entry.posterUrl} alt={entry.title} loading="lazy" />
        : <div className="tl-poster-placeholder">🎬</div>
      }
      <div className="tl-info">
        <p className="tl-title">{entry.title}</p>
        <p className="tl-year">{entry.year}</p>
        {entry.rating > 0 && <p className="tl-rating">⭐ {entry.rating}</p>}
      </div>
      {entry.isCurrent && <div className="tl-here-badge">▶ You are here</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Graph Connections                                            */
/* ─────────────────────────────────────────────────────────── */
function GraphConnections({ tmdbId }) {
  const [graph, setGraph]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${API}/graph/related/movie/${tmdbId}`);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!cancelled) setGraph(data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tmdbId]);

  if (loading) return <div className="graph-state"><div className="spinner" style={{ width: 32, height: 32 }} /><p>Querying Neo4j graph…</p></div>;
  if (error)   return <div className="graph-state"><span style={{ fontSize:'1.5rem' }}>⚠️</span><p style={{ color:'var(--text-2)' }}>Graph unavailable: {error}</p></div>;
  if (!graph?.hasGraph || !graph?.connections?.length) return (
    <div className="graph-state">
      <span style={{ fontSize:'2rem' }}>🕸️</span>
      <p className="graph-state__title">Graph is building</p>
      <p className="graph-state__text">Browse a few more movies — connections appear as the graph self-populates.</p>
    </div>
  );

  const actorLinks    = graph.connections.filter(c => c.connectionType === 'actor');
  const franchiseLinks = graph.connections.filter(c => c.connectionType === 'franchise');

  return (
    <div className="graph-results">
      {actorLinks.length > 0 && (
        <div className="graph-section">
          <p className="graph-section__label">🎭 Connected via shared actors</p>
          <div className="graph-grid">
            {actorLinks.map(c => (
              <div key={c.tmdbId} className="graph-card">
                {c.posterUrl ? <img className="graph-card__poster" src={c.posterUrl} alt={c.title} loading="lazy" /> : <div className="graph-card__poster-ph">🎬</div>}
                <div className="graph-card__body">
                  <p className="graph-card__title">{c.title}</p>
                  <p className="graph-card__year">{c.year}</p>
                  {c.sharedActors?.length > 0 && (
                    <div className="graph-actors">
                      {c.sharedActors.slice(0, 2).map(a => <span key={a} className="graph-actor-chip">👤 {a}</span>)}
                      {c.sharedActors.length > 2 && <span className="graph-actor-chip">+{c.sharedActors.length - 2} more</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {franchiseLinks.length > 0 && (
        <div className="graph-section">
          <p className="graph-section__label">🎬 Same franchise in graph</p>
          <div className="graph-grid">
            {franchiseLinks.map(c => (
              <div key={c.tmdbId} className="graph-card">
                {c.posterUrl ? <img className="graph-card__poster" src={c.posterUrl} alt={c.title} loading="lazy" /> : <div className="graph-card__poster-ph">🎬</div>}
                <div className="graph-card__body">
                  <p className="graph-card__title">{c.title}</p>
                  <p className="graph-card__year">{c.year}</p>
                  {c.rating > 0 && <p className="graph-card__rating">⭐ {c.rating}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* ML Recommendations                                          */
/* ─────────────────────────────────────────────────────────── */
function MLRecommendations({ item }) {
  const [recs, setRecs]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchRecs() {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`${ML_API}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: item.title, synopsis: item.synopsis || '', genres: item.genres || [], limit: 8 })
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!cancelled) setRecs(data.recommendations || []);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchRecs();
    return () => { cancelled = true; };
  }, [item.title]);

  if (loading) return <div className="graph-state"><div className="spinner" style={{ width:32, height:32 }} /><p>Consulting ML models...</p></div>;
  if (error)   return <div className="graph-state"><span style={{ fontSize:'1.5rem' }}>⚠️</span><p style={{ color:'var(--text-2)' }}>ML unavailable: {error}</p></div>;
  if (!recs?.length) return <div className="graph-state"><p className="graph-state__text">No strong ML recommendations found.</p></div>;

  return (
    <div className="graph-results">
      <div className="graph-section">
        <p className="graph-section__label">🤖 Recommended by ML (TF-IDF Similarity)</p>
        <div className="graph-grid">
          {recs.map(c => (
            <div key={c.id} className="graph-card">
              {c.posterUrl ? <img className="graph-card__poster" src={c.posterUrl} alt={c.title} loading="lazy" /> : <div className="graph-card__poster-ph">🎬</div>}
              <div className="graph-card__body">
                <p className="graph-card__title">{c.title}</p>
                <p className="graph-card__year">{c.year}</p>
                <p className="graph-card__rating">Match: {Math.round(c.similarityScore * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Vibe Match                                                   */
/* ─────────────────────────────────────────────────────────── */
function VibeMatch({ onCardClick }) {
  const [vibe, setVibe]     = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const VIBES = [
    { id: 'dark',      emoji: '🌑', label: 'Bleak & Gritty' },
    { id: 'moody',     emoji: '🌧️', label: 'Moody & Atmospheric' },
    { id: 'intense',   emoji: '🔥', label: 'Intense & Heavy' },
    { id: 'vibrant',   emoji: '✨', label: 'Neon Cyberpunk' },
    { id: 'neutral',   emoji: '⚖️', label: 'Neutral & Balanced' },
    { id: 'bright',    emoji: '☀️', label: 'Cozy & Warm' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic & Pop' },
  ];

  async function discoverVibe(v) {
    if (vibe === v && !error) return;
    setVibe(v); setLoading(true); setError(null);
    try {
      const res = await fetch(`${ML_API}/discover/vibe/${v}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setMovies(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`vibe-match ${loading ? 'vibe-match--scanning' : ''}`}>
      <h2 className="vibe-match__title">Vibe Match <span>(Aesthetic Matcher)</span></h2>
      <div className="vibe-match__filters">
        {VIBES.map(v => (
          <button key={v.id} className={`vibe-btn ${vibe === v.id ? 'vibe-btn--active' : ''}`} onClick={() => discoverVibe(v.id)}>
            <span className="vibe-btn__icon">{v.emoji}</span>{v.label}
          </button>
        ))}
      </div>
      {loading && <div className="state-center"><div className="spinner" /><p className="state-text">Analyzing posters...</p></div>}
      {error && !loading && <div className="state-center"><span className="state-icon">⚠️</span><p className="state-text">Failed: {error}</p></div>}
      {!loading && !error && vibe && movies.length === 0 && <div className="state-center"><span className="state-icon">🔎</span><p className="state-title">No matches</p></div>}
      {!loading && !error && movies.length > 0 && (
        <div className="vibe-match__grid">
          {movies.map(item => <MediaCard key={item.id} item={item} onClick={onCardClick} />)}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Detail Panel                                                 */
/* ─────────────────────────────────────────────────────────── */
function TimelinePanel({ item, onClose }) {
  const [activeTab, setActiveTab] = useState('synopsis');
  const [timeline, setTimeline]   = useState(null);
  const [tlLoading, setTlLoading] = useState(false);
  const [tlError, setTlError]     = useState(null);
  const [posterColor, setPosterColor] = useState(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const saved = isInWatchlist(item.id, item.type);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Fetch timeline when timeline tab is opened
  useEffect(() => {
    if (activeTab !== 'timeline') return;
    if (timeline) return; // already loaded
    let cancelled = false;
    async function load() {
      setTlLoading(true); setTlError(null);
      try {
        const ep = item.type === 'anime' ? `${API}/timeline/anime/${item.id}` : `${API}/timeline/movie/${item.id}`;
        const res = await fetch(ep);
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        if (!cancelled) setTimeline(data);
      } catch (e) {
        if (!cancelled) setTlError(e.message);
      } finally {
        if (!cancelled) setTlLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [activeTab, item.id, item.type]);

  // Poster color analysis
  useEffect(() => {
    if (!item.posterUrl) return;
    fetch(`${ML_API}/poster/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posterUrl: item.posterUrl })
    }).then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.dominantColor) setPosterColor(d.dominantColor); })
      .catch(() => {});
  }, [item.posterUrl]);

  const handleBookmark = () => {
    if (saved) { removeFromWatchlist(item.id, item.type); showToast(`Removed "${item.title}"`, 'info'); }
    else       { addToWatchlist(item); showToast(`Saved "${item.title}" ✓`, 'success'); }
  };

  const PANEL_TABS = [
    { id: 'synopsis',  label: '📖 Details' },
    { id: 'timeline',  label: '📅 Timeline' },
    ...(item.type === 'movie' ? [
      { id: 'graph', label: '🕸️ Graph' },
      { id: 'ml',    label: '🤖 ML Recs' },
    ] : []),
  ];

  const scrollToCurrent = useCallback(node => {
    if (node) { const cur = node.querySelector('.tl-entry--current'); if (cur) cur.scrollIntoView({ behavior:'smooth', inline:'center', block:'nearest' }); }
  }, []);

  const currentEntry = timeline?.entries?.find(e => e.isCurrent);

  return (
    <div className="tl-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tl-panel" role="dialog" aria-modal="true"
        style={posterColor ? { '--panel-bg': posterColor, background: `linear-gradient(to bottom, ${posterColor}22, var(--bg))` } : {}}>

        {/* Header */}
        <div className="tl-panel__header">
          <button className="tl-back-btn" onClick={onClose}>← Back</button>
          <div className="tl-panel__title-wrap">
            <span className={`tl-type-badge tl-type-badge--${item.type}`}>{item.type}</span>
            <h2 className="tl-panel__franchise">{item.title}</h2>
            {timeline && <span className="tl-count-badge">{timeline.entries?.length} entries</span>}
          </div>
          <button
            onClick={handleBookmark}
            style={{
              background: saved ? 'rgba(124,111,255,0.2)' : 'transparent',
              border: `1px solid ${saved ? 'var(--accent)' : 'var(--border)'}`,
              color: saved ? 'var(--accent)' : 'var(--text-2)',
              borderRadius:'999px', padding:'0.4rem 1rem',
              fontSize:'0.82rem', cursor:'pointer',
              transition:'all 0.2s ease',
            }}
          >
            {saved ? '🔖 Saved' : '+ Save'}
          </button>
        </div>

        {/* Tabs */}
        <div className="tl-tabs">
          {PANEL_TABS.map(t => (
            <button key={t.id} className={`tl-tab${activeTab === t.id ? ' tl-tab--active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tl-body">
          {/* Synopsis / Details tab */}
          {activeTab === 'synopsis' && (
            <div className="tl-detail">
              <div className="tl-detail__left">
                {item.posterUrl
                  ? <img className="tl-detail__poster" src={item.posterUrl} alt={item.title} />
                  : <div className="tl-detail__poster-ph">{item.type === 'anime' ? '🎌' : '🎬'}</div>
                }
              </div>
              <div className="tl-detail__right">
                <p className="tl-detail__label">Currently viewing</p>
                <h3 className="tl-detail__title">{item.title}</h3>
                <div className="tl-detail__meta">
                  {item.year && item.year !== '—' && <span className="tl-detail__chip">📅 {item.year}</span>}
                  {item.rating > 0 && <span className="tl-detail__chip">⭐ {item.rating} / 10</span>}
                  {currentEntry && <span className="tl-detail__chip">#{currentEntry.position} of {timeline?.entries?.length}</span>}
                </div>
                {item.genres?.length > 0 && (
                  <div className="genre-list" style={{ marginBottom:'1rem' }}>
                    {item.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
                  </div>
                )}
                <p className="tl-detail__synopsis">{item.synopsis || 'No synopsis available.'}</p>
                {posterColor && (
                  <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:posterColor }} />
                    <span style={{ fontSize:'0.78rem', color:'var(--text-3)' }}>Dominant poster color: {posterColor}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="tl-track-wrap">
              {tlLoading && <div className="tl-loading"><div className="spinner" /><p>Building timeline…</p></div>}
              {tlError && !tlLoading && <div className="tl-loading"><span style={{ fontSize:'2rem' }}>⚠️</span><p style={{ color:'var(--text-2)' }}>{tlError}</p></div>}
              {!tlLoading && !tlError && timeline && (
                <div className="tl-track" ref={scrollToCurrent}>
                  {timeline.entries.map((entry, i) => (
                    <div key={entry.id} className="tl-entry-wrap">
                      <TimelineEntry entry={entry} />
                      {i < timeline.entries.length - 1 && <div className="tl-connector" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Graph tab */}
          {activeTab === 'graph' && item.type === 'movie' && (
            <div className="tl-graph-wrap"><GraphConnections tmdbId={item.id} /></div>
          )}

          {/* ML tab */}
          {activeTab === 'ml' && item.type === 'movie' && (
            <div className="tl-graph-wrap"><MLRecommendations item={item} /></div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Navbar with watchlist count badge                           */
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
    <nav style={{
      position:'sticky', top:0, zIndex:100,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 1.5rem', height:64,
      background: scrolled ? 'rgba(7,7,15,0.97)' : 'rgba(7,7,15,0.85)',
      backdropFilter:'blur(20px)',
      borderBottom:`1px solid ${scrolled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
      transition:'background 0.3s, border-color 0.3s',
    }}>
      <button onClick={() => onNav('home')} style={{
        background:'none', border:'none', cursor:'pointer',
        fontSize:'1.3rem', fontWeight:800,
        background:'linear-gradient(135deg,#fff 30%,#7c6fff)',
        WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
      }}>
        🎬 CineVerse
      </button>

      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <button
          onClick={() => onNav(currentPage === 'watchlist' ? 'home' : 'watchlist')}
          style={{
            display:'flex', alignItems:'center', gap:'0.4rem',
            padding:'0.4rem 0.9rem',
            background: currentPage === 'watchlist' ? 'rgba(124,111,255,0.15)' : 'transparent',
            border:`1px solid ${currentPage === 'watchlist' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius:'999px', color: currentPage === 'watchlist' ? 'var(--accent)' : 'var(--text-2)',
            fontSize:'0.82rem', cursor:'pointer', transition:'all 0.2s',
          }}
        >
          🔖 Watchlist
          {watchlist.length > 0 && (
            <span style={{
              background:'var(--accent)', color:'#fff',
              borderRadius:'999px', fontSize:'0.65rem',
              padding:'0.05rem 0.4rem', fontWeight:700, minWidth:18, textAlign:'center',
            }}>{watchlist.length}</span>
          )}
        </button>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main App                                                     */
/* ─────────────────────────────────────────────────────────── */
function AppContent() {
  const [query, setQuery]         = useState('');
  const [tab, setTab]             = useState('all');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [timelineItem, setTimeline] = useState(null);
  const [page, setPage]           = useState('home'); // 'home' | 'watchlist'
  const inputRef                  = useRef(null);

  const TABS = [
    { id: 'all',   label: '🎯 All' },
    { id: 'movie', label: '🎬 Movies' },
    { id: 'anime', label: '🎌 Anime' },
    { id: 'vibe',  label: '✨ Vibe Match' },
  ];

  // '/' focuses search
  useEffect(() => {
    const h = (e) => { if (e.key === '/' && document.activeElement !== inputRef.current) { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  async function doSearch(q = query, t = tab) {
    if (t === 'vibe') { setResults(null); return; }
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true); setError(null); setResults(null);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(trimmed)}&type=${t}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResults(data);
      if ((data.movies?.length + data.anime?.length) === 0) showToast('No results found', 'info');
    } catch (e) {
      setError(e.message || 'Something went wrong.');
      showToast('Search failed — check if the backend is online', 'error');
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) { setTab(t); if (results || t === 'vibe') doSearch(query, t); }

  const hasMovies = results?.movies?.length > 0;
  const hasAnime  = results?.anime?.length > 0;
  const hasAny    = hasMovies || hasAnime;

  return (
    <div className="app">
      <AppNavbar currentPage={page} onNav={setPage} />
      <ToastContainer />

      {page === 'watchlist' ? (
        <main className="content">
          <WatchlistPage onCardClick={(item) => { setTimeline(item); setPage('home'); }} />
        </main>
      ) : (
        <>
          {/* Hero + Search */}
          <section className="hero">
            <h1 className="hero__title">Should I watch this?</h1>
            <p className="hero__sub">
              Spoiler-free summaries · Timeline placement · <strong>Graph discovery</strong>
            </p>

            <div className="search-wrap">
              <div className="search-box" id="search-box">
                <span className="search-icon">🔍</span>
                <input
                  ref={inputRef}
                  id="search-input"
                  className="search-input"
                  type="text"
                  placeholder='Search movies or anime… (Press "/" to focus)'
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doSearch()}
                  autoComplete="off"
                  spellCheck="false"
                />
                {query && (
                  <button className="search-clear" onClick={() => { setQuery(''); setResults(null); inputRef.current?.focus(); }}>✕</button>
                )}
                <button id="search-btn" className="search-btn" onClick={() => doSearch()} disabled={loading}>
                  {loading ? '…' : 'Search'}
                </button>
              </div>

              {/* Type Tabs */}
              <div className="tabs" role="tablist">
                {TABS.map(t => (
                  <button key={t.id} id={`tab-${t.id}`}
                    className={`tab${tab === t.id ? ' active' : ''}`}
                    role="tab" aria-selected={tab === t.id}
                    onClick={() => switchTab(t.id)}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Results */}
          <main className="content" id="results">
            {loading && <SkeletonGrid count={8} />}
            {!loading && error && (
              <div className="state-center">
                <span className="state-icon">⚠️</span>
                <p className="state-title">Error</p>
                <p className="state-text">{error}</p>
                <button onClick={() => doSearch()} style={{
                  marginTop:'1rem', padding:'0.5rem 1.5rem',
                  background:'var(--accent)', border:'none', borderRadius:'999px',
                  color:'#fff', cursor:'pointer', fontSize:'0.9rem',
                }}>Retry</button>
              </div>
            )}
            {!loading && !error && tab === 'vibe' && <VibeMatch onCardClick={setTimeline} />}
            {!loading && !error && tab !== 'vibe' && results === null && (
              <div className="state-center" style={{ marginTop:'3rem' }}>
                <span className="state-icon">🎬</span>
                <p className="state-title">Find your next watch</p>
                <p className="state-text">Search any title — click a result to see its timeline, Neo4j graph, and ML recommendations.</p>
                <p className="state-text" style={{ marginTop:'0.5rem', fontSize:'0.78rem', opacity:0.6 }}>Press <kbd style={{ padding:'0.1rem 0.3rem', border:'1px solid var(--border)', borderRadius:4 }}>/</kbd> to focus search</p>
              </div>
            )}
            {!loading && !error && tab !== 'vibe' && results !== null && !hasAny && (
              <div className="state-center">
                <span className="state-icon">🔎</span>
                <p className="state-title">No results</p>
                <p className="state-text">Try a different title.</p>
              </div>
            )}
            {!loading && !error && tab !== 'vibe' && hasAny && (
              <>
                {(tab === 'all' || tab === 'movie') && <ResultsSection title="Movies" icon="🎬" items={results.movies} onCardClick={setTimeline} />}
                {(tab === 'all' || tab === 'anime') && <ResultsSection title="Anime"  icon="🎌" items={results.anime}  onCardClick={setTimeline} />}
              </>
            )}
          </main>

          <Footer />
        </>
      )}

      {timelineItem && <TimelinePanel item={timelineItem} onClose={() => setTimeline(null)} />}
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
