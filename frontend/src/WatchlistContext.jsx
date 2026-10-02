/**
 * WatchlistContext.jsx v4 — Global watchlist with sorting and stats
 *
 * New in v4:
 *  - `sortWatchlist(by)` — sort by savedAt | title | rating
 *  - `recentlyWatched` — last 5 watched items (sorted by watchedAt)
 *  - `moviesCount` / `animeCount` — type-specific counts
 *
 * Author: Koushik-31368
 */
import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

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

  // Derived values
  const watchedCount  = useMemo(() => watchlist.filter(i => i.watched).length, [watchlist]);
  const moviesCount   = useMemo(() => watchlist.filter(i => i.type === 'movie').length, [watchlist]);
  const animeCount    = useMemo(() => watchlist.filter(i => i.type === 'anime').length, [watchlist]);
  const recentlyWatched = useMemo(() =>
    watchlist
      .filter(i => i.watched && i.watchedAt)
      .sort((a, b) => new Date(b.watchedAt) - new Date(a.watchedAt))
      .slice(0, 5),
  [watchlist]);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      watchlistCount: watchlist.length,
      watchedCount,
      moviesCount,
      animeCount,
      recentlyWatched,
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
