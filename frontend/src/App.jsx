/**
 * App.jsx — CineVerse Phase 2
 * Search + Timeline Placement (movie franchise + anime watch order)
 */
import { useState, useCallback, useRef } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/* ─────────────────────────────────────────────────────────── */
/* Small Components                                             */
/* ─────────────────────────────────────────────────────────── */

function MediaCard({ item, onClick }) {
  return (
    <div
      className="card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
    >
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
          <MediaCard
            key={`${item.type}-${item.id}-${i}`}
            item={item}
            onClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Timeline Panel                                               */
/* ─────────────────────────────────────────────────────────── */

function TimelineEntry({ entry, isHighlighted }) {
  return (
    <div className={`tl-entry${isHighlighted ? ' tl-entry--current' : ''}`}>
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
      {isHighlighted && <div className="tl-here-badge">▶ You are here</div>}
    </div>
  );
}

function TimelinePanel({ item, onClose }) {
  const [timeline, setTimeline] = useState(null);
  const [tlLoading, setTlLoading] = useState(true);
  const [tlError, setTlError]   = useState(null);
  const trackRef = useRef(null);

  // Fetch timeline on mount
  useState(() => {
    let cancelled = false;
    async function load() {
      setTlLoading(true);
      setTlError(null);
      try {
        const endpoint = item.type === 'anime'
          ? `${API}/timeline/anime/${item.id}`
          : `${API}/timeline/movie/${item.id}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        if (!cancelled) setTimeline(data);
      } catch (err) {
        if (!cancelled) setTlError(err.message || 'Failed to load timeline');
      } finally {
        if (!cancelled) setTlLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  });

  // Scroll to current entry after render
  const scrollToCurrent = useCallback(node => {
    if (node) {
      const current = node.querySelector('.tl-entry--current');
      if (current) current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, []);

  const currentEntry = timeline?.entries?.find(e => e.isCurrent);

  return (
    <div className="tl-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tl-panel" role="dialog" aria-modal="true" aria-label="Timeline">

        {/* ── Panel Header ── */}
        <div className="tl-panel__header">
          <button className="tl-back-btn" onClick={onClose} aria-label="Back to results">
            ← Back
          </button>
          <div className="tl-panel__title-wrap">
            {tlLoading
              ? <div className="skeleton" style={{ width: 200, height: 20 }} />
              : <>
                  <span className={`tl-type-badge tl-type-badge--${item.type}`}>{item.type}</span>
                  <h2 className="tl-panel__franchise">
                    {timeline?.franchiseName || item.title}
                  </h2>
                  {timeline && (
                    <span className="tl-count-badge">
                      {timeline.entries?.length} {timeline.entries?.length === 1 ? 'entry' : 'entries'}
                    </span>
                  )}
                </>
            }
          </div>
        </div>

        {/* ── Timeline Track ── */}
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
            <div className="tl-track" ref={node => { trackRef.current = node; scrollToCurrent(node); }}>
              {timeline.entries.map((entry, i) => (
                <div key={entry.id} className="tl-entry-wrap">
                  <TimelineEntry entry={entry} isHighlighted={entry.isCurrent} />
                  {i < timeline.entries.length - 1 && <div className="tl-connector" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Synopsis of current item ── */}
        {!tlLoading && !tlError && (
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
                {item.year && item.year !== '—' && (
                  <span className="tl-detail__chip">📅 {item.year}</span>
                )}
                {item.rating > 0 && (
                  <span className="tl-detail__chip">⭐ {item.rating} / 10</span>
                )}
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
              <p className="tl-detail__synopsis">
                {item.synopsis || 'No synopsis available.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main App                                                     */
/* ─────────────────────────────────────────────────────────── */
export default function App() {
  const [query, setQuery]         = useState('');
  const [tab, setTab]             = useState('all');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [timelineItem, setTimeline] = useState(null);   // opens timeline panel

  const TABS = [
    { id: 'all',   label: 'All' },
    { id: 'movie', label: '🎬 Movies' },
    { id: 'anime', label: '🎌 Anime' },
  ];

  async function doSearch(q = query, t = tab) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(trimmed)}&type=${t}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function switchTab(t) {
    setTab(t);
    if (results) doSearch(query, t);
  }

  const hasMovies = results?.movies?.length > 0;
  const hasAnime  = results?.anime?.length > 0;
  const hasAny    = hasMovies || hasAnime;

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <span className="navbar__logo">CineVerse</span>
        <span className="navbar__badge">Phase 2</span>
      </nav>

      {/* ── Hero + Search ── */}
      <section className="hero">
        <h1 className="hero__title">Should I watch this?</h1>
        <p className="hero__sub">
          Spoiler-free summaries · <strong>Timeline placement</strong> · Graph discovery
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
            <button
              id="search-btn"
              className="search-btn"
              onClick={() => doSearch()}
              disabled={loading}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          <div className="tabs" role="tablist">
            {TABS.map(t => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                className={`tab${tab === t.id ? ' active' : ''}`}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => switchTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      <main className="content" id="results">
        {loading && (
          <div className="state-center">
            <div className="spinner" />
            <p className="state-text">Searching across movies &amp; anime…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-center">
            <span className="state-icon">⚠️</span>
            <p className="state-title">Something went wrong</p>
            <p className="state-text">{error}</p>
          </div>
        )}

        {!loading && !error && results === null && (
          <div className="state-center">
            <span className="state-icon">🎬</span>
            <p className="state-title">Find your next watch</p>
            <p className="state-text">
              Search any title — click a result to see its full franchise timeline.
            </p>
          </div>
        )}

        {!loading && !error && results !== null && !hasAny && (
          <div className="state-center">
            <span className="state-icon">🔎</span>
            <p className="state-title">No results found</p>
            <p className="state-text">Try a different title or switch the filter tab.</p>
          </div>
        )}

        {!loading && !error && hasAny && (
          <>
            {(tab === 'all' || tab === 'movie') && (
              <ResultsSection title="Movies" icon="🎬" items={results.movies} onCardClick={setTimeline} />
            )}
            {(tab === 'all' || tab === 'anime') && (
              <ResultsSection title="Anime" icon="🎌" items={results.anime} onCardClick={setTimeline} />
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        CineVerse · Powered by TMDB &amp; Jikan · Data from community contributors
      </footer>

      {/* ── Timeline Panel ── */}
      {timelineItem && (
        <TimelinePanel item={timelineItem} onClose={() => setTimeline(null)} />
      )}
    </div>
  );
}
