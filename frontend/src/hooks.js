/**
 * useSearch — Custom React hook for CineVerse search with debounce.
 *
 * Usage:
 *   const { results, loading, error, search, reset } = useSearch();
 *   search('inception', 'movie');
 *
 * Added by: Koushik-31368
 */
import { useState, useCallback, useRef } from 'react';

const API_BASE = (() => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
})();

export function useSearch() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const abortRef = useRef(null);

  const search = useCallback(async (query, type = 'all') => {
    const q = query?.trim();
    if (!q || type === 'vibe') return;

    // Abort previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const url = `${API_BASE}/search?q=${encodeURIComponent(q)}&type=${type}`;
      const res = await fetch(url, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      // Unwrap ApiResponse<T> wrapper from backend
      setResults(json.data ?? json);
    } catch (e) {
      if (e.name === 'AbortError') return; // Ignore cancelled requests
      setError(e.message || 'Search failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setResults(null);
    setError(null);
    setLoading(false);
  }, []);

  return { results, loading, error, search, reset };
}

/**
 * useDebounce — Returns a debounced version of the value.
 * @param {*}      value        Value to debounce
 * @param {number} delayMs      Delay in ms (default 350)
 */
export function useDebounce(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef(null);

  if (value !== debounced) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(value), delayMs);
  }

  return debounced;
}

/**
 * useLocalStorage — Sync state with localStorage.
 * @param {string} key          Storage key
 * @param {*}      initialValue Fallback if key not found
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setValue = useCallback((value) => {
    try {
      const val = typeof value === 'function' ? value(stored) : value;
      setStored(val);
      localStorage.setItem(key, JSON.stringify(val));
    } catch { /* Storage unavailable */ }
  }, [key, stored]);

  return [stored, setValue];
}

/**
 * useScrollLock — Locks body scroll (useful for modals/panels).
 */
export function useScrollLock(active) {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = active ? 'hidden' : '';
  }
}
