/**
 * WatchlistContext.jsx v2 — Global watchlist state with localStorage.
 *
 * Additions:
 *  - clearWatchlist()
 *  - getWatchlistByType()
 *  - watchlistCount shortcut
 *
 * Author: Koushik-31368
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WatchlistContext = createContext(null);
const STORAGE_KEY = 'cineverse_watchlist_v2';

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      // Migrate from old key if needed
      const v2 = localStorage.getItem(STORAGE_KEY);
      if (v2) return JSON.parse(v2);
      const v1 = localStorage.getItem('cineverse_watchlist');
      if (v1) { const data = JSON.parse(v1); localStorage.setItem(STORAGE_KEY, v1); return data; }
      return [];
    } catch { return []; }
  });

  // Persist on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist)); }
    catch { /* storage full */ }
  }, [watchlist]);

  const isInWatchlist = useCallback((id, type) => {
    return watchlist.some(i => String(i.id) === String(id) && i.type === type);
  }, [watchlist]);

  const addToWatchlist = useCallback((item) => {
    setWatchlist(prev => {
      if (prev.some(i => String(i.id) === String(item.id) && i.type === item.type)) return prev;
      return [{ ...item, savedAt: new Date().toISOString() }, ...prev];
    });
  }, []);

  const removeFromWatchlist = useCallback((id, type) => {
    setWatchlist(prev => prev.filter(i => !(String(i.id) === String(id) && i.type === type)));
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
  }, []);

  const getWatchlistByType = useCallback((type) => {
    return watchlist.filter(i => i.type === type);
  }, [watchlist]);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      watchlistCount: watchlist.length,
      isInWatchlist,
      addToWatchlist,
      removeFromWatchlist,
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
