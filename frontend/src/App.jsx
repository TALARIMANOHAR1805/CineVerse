/**
 * App.jsx — CineVerse Phase 1
 * Unified movie + anime search with poster cards and detail modal.
 */
import { useState, useCallback, useRef } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/* ─────────────────────────────────────────────────────────── */
/* Utility                                                      */
/* ─────────────────────────────────────────────────────────── */
function useDebounce(fn, delay) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

/* ─────────────────────────────────────────────────────────── */
/* Sub-components                                               */
/* ─────────────────────────────────────────────────────────── */

/** Single movie / anime card */
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
          {item.rating > 0 && (
            <span className="card__rating">⭐ {item.rating}</span>
          )}
        </div>
        {item.genres?.length > 0 && (
          <div className="genre-list">
            {item.genres.slice(0, 3).map(g => (
              <span key={g} className="genre-tag">{g}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Detail modal */
function DetailModal({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog" aria-modal="true" aria-label={item.title}>
      <div className="modal" style={{ position: 'relative' }}>
        <button className="modal__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="modal__header">
          {item.posterUrl
            ? <img className="modal__poster" src={item.posterUrl} alt={item.title} />
            : <div className="modal__poster-placeholder">{item.type === 'anime' ? '🎌' : '🎬'}</div>
          }
          <div className="modal__info">
            <p className={`modal__type modal__type--${item.type}`}>{item.type}</p>
            <h2 className="modal__title">{item.title}</h2>
            <div className="modal__stats">
              {item.year && item.year !== '—' && (
                <span className="modal__stat">
                  <span className="modal__stat-icon">📅</span> {item.year}
                </span>
              )}
              {item.rating > 0 && (
                <span className="modal__stat">
                  <span className="modal__stat-icon">⭐</span> {item.rating} / 10
                </span>
              )}
            </div>
            {item.genres?.length > 0 && (
              <div className="genre-list">
                {item.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
              </div>
            )}
          </div>
        </div>
        <div className="modal__body">
          <p className="modal__synopsis-label">Synopsis</p>
          <p className="modal__synopsis">
            {item.synopsis || 'No synopsis available.'}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Results section with header + grid */
function ResultsSection({ title, icon, items, onCardClick, typeClass }) {
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
/* Main App                                                     */
/* ─────────────────────────────────────────────────────────── */
export default function App() {
  const [query, setQuery]       = useState('');
  const [tab, setTab]           = useState('all');
  const [results, setResults]   = useState(null);   // null = no search yet
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);   // detail modal item
  const inputRef                = useRef(null);

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
      const res = await fetch(
        `${API}/search?q=${encodeURIComponent(trimmed)}&type=${t}`
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') doSearch();
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
        <span className="navbar__badge">Phase 1</span>
      </nav>

      {/* ── Hero + Search ── */}
      <section className="hero">
        <h1 className="hero__title">Should I watch this?</h1>
        <p className="hero__sub">
          Spoiler-free summaries · Timeline placement · Graph discovery<br/>
          Search any movie or anime instantly.
        </p>

        <div className="search-wrap">
          <div className="search-box" id="search-box">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              ref={inputRef}
              className="search-input"
              type="text"
              placeholder="Search movies or anime… e.g. Inception, Naruto"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
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

          {/* Type tabs */}
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

        {/* Loading */}
        {loading && (
          <div className="state-center">
            <div className="spinner" />
            <p className="state-text">Searching across movies &amp; anime…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="state-center">
            <span className="state-icon">⚠️</span>
            <p className="state-title">Something went wrong</p>
            <p className="state-text">{error}</p>
          </div>
        )}

        {/* Empty state — no search yet */}
        {!loading && !error && results === null && (
          <div className="state-center">
            <span className="state-icon">🎬</span>
            <p className="state-title">Find your next watch</p>
            <p className="state-text">
              Type a movie or anime title above and hit Search.
              We'll pull spoiler-free summaries from TMDB and Jikan.
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && !error && results !== null && !hasAny && (
          <div className="state-center">
            <span className="state-icon">🔎</span>
            <p className="state-title">No results found</p>
            <p className="state-text">
              Try a different title or switch the filter tab.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && hasAny && (
          <>
            {(tab === 'all' || tab === 'movie') && (
              <ResultsSection
                title="Movies"
                icon="🎬"
                items={results.movies}
                onCardClick={setSelected}
              />
            )}
            {(tab === 'all' || tab === 'anime') && (
              <ResultsSection
                title="Anime"
                icon="🎌"
                items={results.anime}
                onCardClick={setSelected}
              />
            )}
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        CineVerse · Powered by TMDB &amp; Jikan · Data from community contributors
      </footer>

      {/* ── Detail Modal ── */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
