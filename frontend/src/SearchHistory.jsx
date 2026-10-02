/**
 * SearchHistory.jsx v2 — Search history dropdown component
 *
 * Renders a dropdown below the search bar showing recent searches.
 * Uses design system classes for styling.
 *
 * Author: Koushik-31368
 */

/**
 * @param {string[]} history - list of recent search queries
 * @param {(q: string) => void} onSelect - called when user picks a history item
 * @param {() => void} onClear - called when "Clear all" is clicked
 * @param {boolean} [visible=true]
 */
export default function SearchHistory({ history, onSelect, onClear, visible = true }) {
  if (!visible || !history.length) return null;

  return (
    <div
      className="search-history"
      role="listbox"
      aria-label="Recent searches"
    >
      <div className="search-history__header">
        <span>Recent searches</span>
        <button
          onClick={onClear}
          aria-label="Clear search history"
          style={{
            background: 'none', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: '0.7rem', fontFamily: 'Inter, sans-serif',
            padding: 0,
          }}
        >
          Clear all
        </button>
      </div>
      {history.map((q, i) => (
        <button
          key={`${q}-${i}`}
          className="search-history__item"
          role="option"
          aria-selected="false"
          onClick={() => onSelect(q)}
        >
          <span className="search-history__icon" aria-hidden="true">🕐</span>
          {q}
        </button>
      ))}
    </div>
  );
}
