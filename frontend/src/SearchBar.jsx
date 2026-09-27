/**
 * SearchBar component — Debounced search input with clear button,
 * type filter tabs (All / Movies / Anime), and keyboard shortcut (/).
 *
 * Props:
 *   query        {string}   - current search query
 *   onQuery      {Function} - called with new query string
 *   type         {string}   - 'all' | 'movie' | 'anime'
 *   onType       {Function} - called with new type string
 *   loading      {bool}     - shows spinner inside input when true
 *   onSearch     {Function} - called when user submits the search
 */
import { useRef, useEffect } from 'react';

const TYPES = [
  { value: 'all',   label: '🎯 All' },
  { value: 'movie', label: '🎬 Movies' },
  { value: 'anime', label: '🎌 Anime' },
];

export default function SearchBar({ query, onQuery, type, onType, loading, onSearch }) {
  const inputRef = useRef(null);

  // '/' key focuses the search bar
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch?.();
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        {/* Search Icon */}
        <span style={{
          position: 'absolute', left: '1rem', top: '50%',
          transform: 'translateY(-50%)', fontSize: '1.1rem',
          pointerEvents: 'none', color: 'var(--text-3)',
        }}>🔍</span>

        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder='Search movies & anime… (Press "/" to focus)'
          aria-label="Search movies and anime"
          autoComplete="off"
          spellCheck="false"
          style={{
            width: '100%',
            padding: '1rem 3.5rem 1rem 2.75rem',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-pill)',
            color: 'var(--text)',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color var(--transition), box-shadow var(--transition)',
            fontFamily: 'inherit',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent)';
            e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {/* Right side: spinner or clear button */}
        <div style={{
          position: 'absolute', right: '1rem', top: '50%',
          transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {loading && (
            <div style={{
              width: 18, height: 18,
              border: '2px solid var(--accent)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => { onQuery(''); inputRef.current?.focus(); }}
              aria-label="Clear search"
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-3)', fontSize: '1.1rem',
                lineHeight: 1, cursor: 'pointer', padding: '0.1rem',
              }}
            >
              ✕
            </button>
          )}
          {/* Keyboard hint */}
          {!query && !loading && (
            <kbd style={{
              fontSize: '0.65rem', color: 'var(--text-3)',
              border: '1px solid var(--border)', borderRadius: '4px',
              padding: '0.1rem 0.35rem',
            }}>/</kbd>
          )}
        </div>
      </form>

      {/* Type filter tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginTop: '0.75rem',
        justifyContent: 'center',
      }}>
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => onType(t.value)}
            aria-pressed={type === t.value}
            style={{
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${type === t.value ? 'var(--accent)' : 'var(--border)'}`,
              background: type === t.value ? 'rgba(124,111,255,0.15)' : 'transparent',
              color: type === t.value ? 'var(--accent)' : 'var(--text-2)',
              fontSize: '0.82rem',
              fontWeight: type === t.value ? '600' : '400',
              transition: 'all var(--transition)',
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
