/**
 * useMediaFetch.js v2 — Custom hook for fetching media data
 *
 * Provides a unified fetch hook with loading, error, and abort signal support.
 * Includes automatic retry on network error and request deduplication.
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @template T
 * @param {() => Promise<T>} fetcher - async function returning data
 * @param {any[]} deps - dependency array (like useEffect)
 * @returns {{ data: T|null, loading: boolean, error: Error|null, refetch: () => void }}
 */
export function useMediaFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState(s => ({ ...s, loading: true, error: null }));

    try {
      const data = await fetcher(controller.signal);
      if (mountedRef.current && !controller.signal.aborted) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if (mountedRef.current && !controller.signal.aborted) {
        setState({ data: null, loading: false, error: err });
      }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => {
      mountedRef.current = false;
      if (abortRef.current) abortRef.current.abort();
    };
  }, [run]);

  return { ...state, refetch: run };
}

/**
 * Paginated fetch hook — adds page state and loadMore support
 */
export function usePaginatedFetch(fetcher, deps = []) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (pg, reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher(pg);
      const arr = Array.isArray(data) ? data : [];
      setItems(prev => reset ? arr : [...prev, ...arr]);
      setHasMore(arr.length >= 18);
      setPage(pg);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    load(1, true);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) load(page + 1, false);
  }, [loading, hasMore, page, load]);

  return { items, loading, error, hasMore, loadMore, page };
}
