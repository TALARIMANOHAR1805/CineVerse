/**
 * GenreFilter.jsx v2 — Reusable genre filter pill strip
 *
 * A horizontally-scrollable pill strip for genre selection.
 * Uses the design system .genre-strip and .genre-pill classes.
 *
 * Author: Koushik-31368
 */

/**
 * @param {Array<{id: number|null, name: string}>} genres
 * @param {number|null} selected - currently selected genre id
 * @param {(id: number|null) => void} onSelect
 * @param {string} [allLabel='All']
 */
export default function GenreFilter({ genres, selected, onSelect, allLabel = 'All' }) {
  const items = genres[0]?.id === null ? genres : [{ id: null, name: allLabel }, ...genres];

  return (
    <div className="genre-strip" role="group" aria-label="Genre filter">
      {items.map(g => (
        <button
          key={g.id ?? 'all'}
          id={`genre-${g.id ?? 'all'}`}
          className={`genre-pill${selected === g.id ? ' genre-pill--active' : ''}`}
          onClick={() => onSelect(selected === g.id ? null : g.id)}
          aria-pressed={selected === g.id}
        >
          {g.name}
        </button>
      ))}
    </div>
  );
}
