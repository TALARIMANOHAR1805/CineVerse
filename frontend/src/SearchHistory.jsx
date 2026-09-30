/**
 * SearchHistory.jsx — Recent search history with localStorage persistence.
 *
 * Features:
 *  - Shows last 8 searches
 *  - Click to re-run search
 *  - Clear individual or all
 *  - Appears below the search bar when focused and empty
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY  = 'cineverse_search_history';
const MAX_HISTORY  = 8;

export function useSearchHistory() {
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch {}
  }, [history]);

  const addToHistory = useCallback((query) => {
    const q = query.trim();
    if (!q || q.length < 2) return;
    setHistory(prev => {
      const filtered = prev.filter(h => h.query.toLowerCase() !== q.toLowerCase());
      return [{ query: q, timestamp: Date.now() }, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const removeFromHistory = useCallback((query) => {
    setHistory(prev => prev.filter(h => h.query !== query));
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return { history, addToHistory, removeFromHistory, clearHistory };
}

export default function SearchHistoryDropdown({ history, onSelect, onRemove, onClear, visible }) {
  if (!visible || history.length === 0) return null;

  return (
    <div style={{
      position: 'absolute', top: '100%', left: 0, right: 0,
      background: 'rgba(18,18,32,0.97)',
      border: '1px solid rgba(124,111,255,0.2)',
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing:'0.05em' }}>
          Recent Searches
        </span>
        <button onClick={onClear} style={{
          background: 'none', border: 'none', color: 'var(--text-3)',
          fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'inherit',
          padding: '0.15rem 0.4rem', borderRadius: 4,
        }}>Clear all</button>
      </div>
      {history.map(({ query }) => (
        <div key={query} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.03)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,111,255,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <button onClick={() => onSelect(query)} style={{
            background: 'none', border: 'none', color: 'var(--text-2)',
            fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left', flex: 1,
          }}>
            <span style={{ marginRight: '0.5rem', opacity: 0.4 }}>🔍</span>
            {query}
          </button>
          <button onClick={() => onRemove(query)} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            fontSize: '0.75rem', cursor: 'pointer', padding: '0.15rem 0.3rem',
            borderRadius: 4, fontFamily: 'inherit',
          }}>✕</button>
        </div>
      ))}
    </div>
  );
}
