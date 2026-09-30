/**
 * GenreFilter.jsx — Horizontal scrollable genre pill row.
 * Shared by DiscoverPage and SearchResults.
 * Author: Koushik-31368
 */
import { useState } from 'react';

/**
 * @param {Array<{id: number|string, name: string}>} genres
 * @param {number|string|null} selected  — currently selected genre id
 * @param {function} onSelect            — called with genre id or null (for "All")
 */
export default function GenreFilter({ genres = [], selected = null, onSelect }) {
  return (
    <div style={{ overflowX: 'auto', paddingBottom: '0.25rem' }}>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap', minWidth: 'max-content' }}>
        {/* "All" pill */}
        <GenrePill
          id="genre-filter-all"
          label="All"
          active={selected === null}
          onClick={() => onSelect(null)}
        />
        {genres.map(g => (
          <GenrePill
            key={g.id}
            id={`genre-filter-${g.id}`}
            label={g.name}
            active={selected === g.id}
            onClick={() => onSelect(g.id === selected ? null : g.id)}
          />
        ))}
      </div>
    </div>
  );
}

function GenrePill({ id, label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '0.28rem 0.75rem',
        borderRadius: '999px',
        border: `1px solid ${active ? 'rgba(124,111,255,0.55)' : 'rgba(124,111,255,0.18)'}`,
        background: active
          ? 'rgba(124,111,255,0.22)'
          : hovered ? 'rgba(124,111,255,0.1)' : 'rgba(124,111,255,0.06)',
        color: active ? 'var(--accent)' : 'var(--text-2)',
        fontSize: '0.75rem',
        fontWeight: active ? 700 : 400,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.18s',
        whiteSpace: 'nowrap',
      }}>
      {label}
    </button>
  );
}
