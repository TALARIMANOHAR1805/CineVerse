/**
 * App.jsx — CineVerse Phase 3
 * Search + Timeline Placement + Neo4j Graph Discovery
 */
import { useState, useCallback, useRef } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/* ─────────────────────────────────────────────────────────── */
/* Small Components                                             */
/* ─────────────────────────────────────────────────────────── */

function MediaCard({ item, onClick }) {
  return (
    <div className="card" onClick={() => onClick(item)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}>
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
        <div className="card__timeline-hint">View timeline →</div>
      </div>
    </div>
  );
}

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
/* Graph Connections Tab                                        */
/* ─────────────────────────────────────────────────────────── */

function GraphConnections({ tmdbId }) {
  const [graph, setGraph]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useState(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
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
  });

  if (loading) return (
    <div className="graph-state">
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p>Querying Neo4j graph…</p>
    </div>
  );

  if (error) return (
    <div className="graph-state">
      <span style={{ fontSize: '1.5rem' }}>⚠️</span>
      <p style={{ color: 'var(--text-2)' }}>Graph unavailable: {error}</p>
    </div>
  );

  if (!graph?.hasGraph || !graph?.connections?.length) return (
    <div className="graph-state">
      <span style={{ fontSize: '2rem' }}>🕸️</span>
      <p className="graph-state__title">Graph is building</p>
      <p className="graph-state__text">
        The Neo4j graph self-populates as you browse movies.
        View a few movies and check back — connections will appear here.
      </p>
    </div>
  );

  // Group by actor connections vs franchise siblings
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
                {c.posterUrl
                  ? <img className="graph-card__poster" src={c.posterUrl} alt={c.title} loading="lazy" />
                  : <div className="graph-card__poster-ph">🎬</div>
                }
                <div className="graph-card__body">
                  <p className="graph-card__title">{c.title}</p>
                  <p className="graph-card__year">{c.year}</p>
                  {c.sharedActors?.length > 0 && (
                    <div className="graph-actors">
                      {c.sharedActors.slice(0, 2).map(a => (
                        <span key={a} className="graph-actor-chip">👤 {a}</span>
                      ))}
                      {c.sharedActors.length > 2 && (
                        <span className="graph-actor-chip">+{c.sharedActors.length - 2} more</span>
                      )}
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
                {c.posterUrl
                  ? <img className="graph-card__poster" src={c.posterUrl} alt={c.title} loading="lazy" />
                  : <div className="graph-card__poster-ph">🎬</div>
                }
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
/* Timeline Panel (Phases 2 + 3)                               */
/* ─────────────────────────────────────────────────────────── */

function TimelinePanel({ item, onClose }) {
  const [activeTab, setActiveTab]   = useState('timeline');
  const [timeline, setTimeline]     = useState(null);
  const [tlLoading, setTlLoading]   = useState(true);
  const [tlError, setTlError]       = useState(null);

  const PANEL_TABS = [
    { id: 'timeline',    label: '📅 Timeline' },
    ...(item.type === 'movie' ? [{ id: 'graph', label: '🕸️ Graph' }] : []),
    { id: 'synopsis',    label: '📖 Synopsis' },
  ];

  // Fetch timeline on mount
  useState(() => {
    let cancelled = false;
    async function load() {
      setTlLoading(true); setTlError(null);
      try {
        const ep = item.type === 'anime'
          ? `${API}/timeline/anime/${item.id}`
          : `${API}/timeline/movie/${item.id}`;
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
  });

  const scrollToCurrent = useCallback(node => {
    if (node) {
      const cur = node.querySelector('.tl-entry--current');
      if (cur) cur.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  const currentEntry = timeline?.entries?.find(e => e.isCurrent);

  return (
    <div className="tl-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tl-panel" role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className="tl-panel__header">
          <button className="tl-back-btn" onClick={onClose}>← Back</button>
          <div className="tl-panel__title-wrap">
            <span className={`tl-type-badge tl-type-badge--${item.type}`}>{item.type}</span>
            <h2 className="tl-panel__franchise">
              {tlLoading ? '…' : (timeline?.franchiseName || item.title)}
            </h2>
            {timeline && (
              <span className="tl-count-badge">
                {timeline.entries?.length} {timeline.entries?.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
        </div>

        {/* ── Sub-tabs ── */}
        <div className="tl-tabs">
          {PANEL_TABS.map(t => (
            <button
              key={t.id}
              className={`tl-tab${activeTab === t.id ? ' tl-tab--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="tl-body">

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="tl-track-wrap">
              {tlLoading && (
                <div className="tl-loading">
                  <div className="spinner" />
                  <p>Building timeline…</p>
                </div>
              )}
              {tlError && !tlLoading && (
                <div className="tl-loading">
                  <span style={{ fontSize: '2rem' }}>⚠️</span>
                  <p style={{ color: 'var(--text-2)' }}>{tlError}</p>
                </div>
              )}
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

          {/* Graph tab (movies only) */}
          {activeTab === 'graph' && item.type === 'movie' && (
            <div className="tl-graph-wrap">
              <GraphConnections tmdbId={item.id} />
            </div>
          )}

          {/* Synopsis tab */}
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
                  {currentEntry && (
                    <span className="tl-detail__chip">
                      #{currentEntry.position} of {timeline?.entries?.length}
                    </span>
                  )}
                </div>
                {item.genres?.length > 0 && (
                  <div className="genre-list" style={{ marginBottom: '1rem' }}>
                    {item.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
                  </div>
                )}
                <p className="tl-detail__synopsis">{item.synopsis || 'No synopsis available.'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main App                                                     */
/* ─────────────────────────────────────────────────────────── */
export default function App() {
  const [query, setQuery]       = useState('');
  const [tab, setTab]           = useState('all');
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [timelineItem, setTimeline] = useState(null);

  const TABS = [
    { id: 'all',   label: 'All' },
    { id: 'movie', label: '🎬 Movies' },
    { id: 'anime', label: '🎌 Anime' },
  ];

  async function doSearch(q = query, t = tab) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(trimmed)}&type=${t}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) { setTab(t); if (results) doSearch(query, t); }

  const hasMovies = results?.movies?.length > 0;
  const hasAnime  = results?.anime?.length > 0;
  const hasAny    = hasMovies || hasAnime;

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar__logo">CineVerse</span>
        <span className="navbar__badge">Phase 3</span>
      </nav>

      <section className="hero">
        <h1 className="hero__title">Should I watch this?</h1>
        <p className="hero__sub">
          Spoiler-free summaries · Timeline placement · <strong>Graph discovery</strong>
        </p>
        <div className="search-wrap">
          <div className="search-box" id="search-box">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              className="search-input"
              type="text"
              placeholder="Search movies or anime… e.g. Iron Man, Naruto"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              autoComplete="off"
            />
            <button id="search-btn" className="search-btn" onClick={() => doSearch()} disabled={loading}>
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
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

      <main className="content" id="results">
        {loading && <div className="state-center"><div className="spinner" /><p className="state-text">Searching…</p></div>}
        {!loading && error && <div className="state-center"><span className="state-icon">⚠️</span><p className="state-title">Error</p><p className="state-text">{error}</p></div>}
        {!loading && !error && results === null && (
          <div className="state-center">
            <span className="state-icon">🎬</span>
            <p className="state-title">Find your next watch</p>
            <p className="state-text">Search any title — click a result to see its timeline and Neo4j graph connections.</p>
          </div>
        )}
        {!loading && !error && results !== null && !hasAny && (
          <div className="state-center"><span className="state-icon">🔎</span><p className="state-title">No results</p><p className="state-text">Try a different title.</p></div>
        )}
        {!loading && !error && hasAny && (
          <>
            {(tab === 'all' || tab === 'movie') && <ResultsSection title="Movies" icon="🎬" items={results.movies} onCardClick={setTimeline} />}
            {(tab === 'all' || tab === 'anime') && <ResultsSection title="Anime"  icon="🎌" items={results.anime}  onCardClick={setTimeline} />}
          </>
        )}
      </main>

      <footer className="footer">CineVerse · TMDB · Jikan · Neo4j AuraDB</footer>

      {timelineItem && <TimelinePanel item={timelineItem} onClose={() => setTimeline(null)} />}
    </div>
  );
}
