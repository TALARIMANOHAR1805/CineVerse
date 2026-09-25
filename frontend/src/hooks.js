import { useState, useCallback } from 'react';

/**
 * useDebounce hook - Returns a debounced version of the provided value.
 *
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 400)
 * @returns {any} - The debounced value
 *
 * Usage:
 *   const debouncedQuery = useDebounce(searchQuery, 400);
 */
import { useEffect, useRef } from 'react';

export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useLocalStorage hook - Syncs state with localStorage automatically.
 *
 * @param {string} key - The localStorage key
 * @param {any} initialValue - Default value if key doesn't exist
 * @returns {[any, Function]} - [storedValue, setValue]
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('cv-theme', 'dark');
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`useLocalStorage: failed to set key "${key}"`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * useCopyToClipboard hook - Copies text to clipboard and tracks copied state.
 *
 * @returns {{ copied: boolean, copyToClipboard: Function }}
 *
 * Usage:
 *   const { copied, copyToClipboard } = useCopyToClipboard();
 *   <button onClick={() => copyToClipboard(text)}>{copied ? 'Copied!' : 'Copy'}</button>
 */
export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetDelay);
    } catch (err) {
      console.error('useCopyToClipboard: failed to copy', err);
    }
  }, [resetDelay]);

  return { copied, copyToClipboard };
}

/**
 * useFetch hook - Generic data fetching hook with loading/error states.
 *
 * @param {string|null} url - URL to fetch from (set null to skip)
 * @returns {{ data, loading, error, refetch }}
 *
 * Usage:
 *   const { data, loading, error } = useFetch('/api/search?q=inception');
 */
export function useFetch(url) {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const abortRef = useRef(null);

  const fetchData = useCallback(async (fetchUrl) => {
    if (!fetchUrl) return;
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState({ data: null, loading: true, error: null });

    try {
      const res = await fetch(fetchUrl, { signal: abortRef.current.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setState({ data: null, loading: false, error: err.message });
      }
    }
  }, []);

  useEffect(() => {
    fetchData(url);
    return () => abortRef.current?.abort();
  }, [url, fetchData]);

  const refetch = useCallback(() => fetchData(url), [url, fetchData]);
  return { ...state, refetch };
}
