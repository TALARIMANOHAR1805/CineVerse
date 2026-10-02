/**
 * useKeyboardShortcuts.js v2 — Global keyboard shortcut handler
 *
 * Usage:
 *   useKeyboardShortcuts({ 'h': () => nav('home'), 'd': () => nav('discover') })
 *
 * Features:
 *  - Ignores shortcuts when typing in inputs
 *  - Case-insensitive matching
 *  - Supports modifier keys check (shift, ctrl, meta)
 *
 * Author: Koushik-31368
 */
import { useEffect } from 'react';

const IGNORE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'CONTENTEDITABLE']);

/**
 * @param {Record<string, () => void>} shortcuts - key → handler map
 * @param {boolean} [enabled=true]
 */
export default function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      // Skip if user is typing in a form field
      const tag = e.target?.tagName;
      const isEditable = e.target?.isContentEditable;
      if (IGNORE_TAGS.has(tag) || isEditable) return;

      // Skip if modifier keys are held (allow browser shortcuts)
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();
      const fn  = shortcuts[key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
