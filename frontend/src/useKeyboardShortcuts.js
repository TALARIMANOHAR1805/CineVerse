/**
 * useKeyboardShortcuts.js — Register keyboard shortcuts for CineVerse.
 *
 * Shortcuts:
 *   /        → focus search bar
 *   Escape   → close detail panel / clear search
 *   D        → go to Discover page
 *   W        → go to Watchlist page
 *   H        → go to Home
 *
 * Author: Koushik-31368
 */
import { useEffect } from 'react';

/**
 * @param {object} handlers
 * @param {function} [handlers.onSearch]    — called when '/' pressed
 * @param {function} [handlers.onEscape]    — called when 'Escape' pressed
 * @param {function} [handlers.onDiscover]  — called when 'd' pressed
 * @param {function} [handlers.onWatchlist] — called when 'w' pressed
 * @param {function} [handlers.onHome]      — called when 'h' pressed
 */
export default function useKeyboardShortcuts({
  onSearch,
  onEscape,
  onDiscover,
  onWatchlist,
  onHome,
} = {}) {
  useEffect(() => {
    function handle(e) {
      // Skip if user is typing in input/textarea
      const tag = document.activeElement?.tagName;
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;

      if (inInput && e.key !== 'Escape') return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          onSearch?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        case 'd':
        case 'D':
          if (!inInput) { e.preventDefault(); onDiscover?.(); }
          break;
        case 'w':
        case 'W':
          if (!inInput) { e.preventDefault(); onWatchlist?.(); }
          break;
        case 'h':
        case 'H':
          if (!inInput) { e.preventDefault(); onHome?.(); }
          break;
        default:
          break;
      }
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onSearch, onEscape, onDiscover, onWatchlist, onHome]);
}
