/**
 * useTheme.js — CineVerse hook for managing dark/light theme.
 *
 * Usage:
 *   const { theme, toggleTheme, isDark } = useTheme();
 *
 * Defaults to dark mode; persists preference in localStorage.
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cineverse_theme';
const DARK  = 'dark';
const LIGHT = 'light';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || DARK;
    } catch { return DARK; }
  });

  // Apply to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => t === DARK ? LIGHT : DARK);
  }, []);

  const setDark  = useCallback(() => setTheme(DARK), []);
  const setLight = useCallback(() => setTheme(LIGHT), []);

  return {
    theme,
    isDark: theme === DARK,
    isLight: theme === LIGHT,
    toggleTheme,
    setDark,
    setLight,
  };
}
