/**
 * WatchlistContext.jsx v3 — Global watchlist with "Mark as Watched" support.
 *
 * New in v3:
 *  - `markWatched(id, type)` / `unmarkWatched(id, type)` — toggle watched state
 *  - `isWatched(id, type)` — check watched state
 *  - `watchedCount` — count of watched items
 *  - Persists `watchedAt` timestamp
 *
 * Author: Koushik-31368
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WatchlistContext = createContext(null);
const STORAGE_KEY = 'cineverse_watchlist_v2';

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const v2 = localStorage.getItem(STORAGE_KEY);
      if (v2) return JSON.parse(v2);
      const v1 = localStorage.getItem('cineverse_watchlist');
      if (v1) { const d = JSON.parse(v1); localStorage.setItem(STORAGE_KEY, v1); return d; }
      return [];
    } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist)); } catch {}
  }, [watchlist]);

  const isInWatchlist = useCallback((id, type) =>
    watchlist.some(i => String(i.id) === String(id) && i.type === type),
  [watchlist]);

  const isWatched = useCallback((id, type) =>
    watchlist.some(i => String(i.id) === String(id) && i.type === type && i.watched),
  [watchlist]);

  const addToWatchlist = useCallback((item) => {
    setWatchlist(prev => {
      if (prev.some(i => String(i.id) === String(item.id) && i.type === item.type)) return prev;
      return [{ ...item, savedAt: new Date().toISOString(), watched: false }, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((id, type) => {
    setWatchlist(prev => prev.filter(i => !(String(i.id) === String(id) && i.type === type)));
  }, []);

  const markWatched = useCallback((id, type) => {
    setWatchlist(prev => prev.map(i =>
      String(i.id) === String(id) && i.type === type
        ? { ...i, watched: true, watchedAt: new Date().toISOString() }
        : i
    ));
  }, []);

  const unmarkWatched = useCallback((id, type) => {
    setWatchlist(prev => prev.map(i =>
      String(i.id) === String(id) && i.type === type
        ? { ...i, watched: false, watchedAt: null }
        : i
    ));
  }, []);

  const clearWatchlist = useCallback(() => setWatchlist([]), []);

  const getWatchlistByType = useCallback(
    (type) => watchlist.filter(i => i.type === type),
  [watchlist]);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      watchlistCount: watchlist.length,
      watchedCount: watchlist.filter(i => i.watched).length,
      isInWatchlist,
      isWatched,
      addToWatchlist,
      removeFromWatchlist,
      markWatched,
      unmarkWatched,
      clearWatchlist,
      getWatchlistByType,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
}
