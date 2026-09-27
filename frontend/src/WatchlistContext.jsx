/**
 * WatchlistContext — Global watchlist state using React Context + localStorage.
 * 
 * Provides:
 *   watchlist       {Array}    - list of saved media items
 *   addToWatchlist  {Function} - add item to watchlist
 *   removeFromWatchlist {Function} - remove item by id+type
 *   isInWatchlist   {Function} - check if item is saved
 *   clearWatchlist  {Function} - clear all items
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WatchlistContext = createContext(null);
const STORAGE_KEY = 'cineverse_watchlist';

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [watchlist]);

  const addToWatchlist = useCallback((item) => {
    setWatchlist(prev => {
      const exists = prev.some(w => w.id === item.id && w.type === item.type);
      if (exists) return prev;
      return [...prev, { ...item, savedAt: new Date().toISOString() }];
    });
  }, []);

  const removeFromWatchlist = useCallback((id, type) => {
    setWatchlist(prev => prev.filter(w => !(w.id === id && w.type === type)));
  }, []);

  const isInWatchlist = useCallback((id, type) => {
    return watchlist.some(w => w.id === id && w.type === type);
  }, [watchlist]);

  const clearWatchlist = useCallback(() => setWatchlist([]), []);

  return (
    <WatchlistContext.Provider value={{
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      clearWatchlist,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside <WatchlistProvider>');
  return ctx;
}
