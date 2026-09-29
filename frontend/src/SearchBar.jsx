/**
 * SearchBar.jsx v2 — Standalone reusable search component.
 *
 * Features:
 *  - Controlled input with clear button
 *  - Loading spinner in submit button
 *  - Type filter tabs (All / Movies / Anime)
 *  - "/" keyboard shortcut
 *  - Enter to search
 *
 * Author: Koushik-31368
 */
import { useRef, useEffect } from 'react';

const TABS = [
  { id: 'all',   label: '🎯 All' },
  { id: 'movie', label: '🎬 Movies' },
  { id: 'anime', label: '🎌 Anime' },
];

export default function SearchBar({ query, setQuery, tab, setTab, onSearch, loading }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const h = e => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  function handleTabChange(t) {
    setTab(t);
    if (query.trim()) onSearch(query, t);
  }

  return (
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
          onKeyDown={e => e.key === 'Enter' && onSearch(query, tab)}
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >✕</button>
        )}
        <button
          id="search-btn"
          className="search-btn"
          onClick={() => onSearch(query, tab)}
          disabled={loading || !query.trim()}
        >
          {loading ? <span className="btn-spinner" /> : 'Search'}
        </button>
      </div>

      <div className="tabs" role="tablist" aria-label="Filter by type">
        {TABS.map(t => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            className={`tab${tab === t.id ? ' active' : ''}`}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => handleTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
