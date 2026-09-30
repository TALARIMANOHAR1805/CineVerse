/**
 * useMediaFetch.js — Custom hook for fetching & paginating TMDB/Jikan data.
 *
 * Usage:
 *   const { items, loading, error, hasMore, loadMore, reset } = useMediaFetch(fetchFn);
 *
 * Author: Koushik-31368
 */
import { useState, useCallback, useRef } from 'react';

/**
 * @param {function} fetchFn  — async fn(page: number) => MediaItem[]
 * @param {object}   opts
 * @param {number}   [opts.pageSize=20]    — items per page
 * @param {boolean}  [opts.autoLoad=false] — fetch on mount
 */
export default function useMediaFetch(fetchFn, opts = {}) {
  const { pageSize = 20, autoLoad = false } = opts;

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error,   setError]   = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(1);

  const load = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    const page = reset ? 1 : pageRef.current;
    try {
      const results = await fetchFn(page);
      if (reset) {
        setItems(results);
        pageRef.current = 2;
      } else {
        setItems(prev => [...prev, ...results]);
        pageRef.current = page + 1;
      }
      setHasMore(results.length >= pageSize);
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, loading, pageSize]);

  const loadMore = useCallback(() => load(false), [load]);
  const reset    = useCallback(() => {
    pageRef.current = 1;
    setItems([]);
    setHasMore(true);
    setError(null);
    load(true);
  }, [load]);

  return { items, loading, error, hasMore, load, loadMore, reset };
}
