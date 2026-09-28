/**
 * useApiHealth — Hook to poll the backend API health endpoint.
 *
 * Returns:
 *   status: 'up' | 'down' | 'unknown'
 *   latency: number (ms) of last successful ping
 *   lastChecked: Date of last check
 *
 * Added by: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';

const API_BASE = (() => {
  let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
})();

export function useApiHealth(intervalMs = 30000) {
  const [status, setStatus]         = useState('unknown');
  const [latency, setLatency]       = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const check = useCallback(async () => {
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(4000),
      });
      const ms = Math.round(performance.now() - t0);
      setStatus(res.ok ? 'up' : 'down');
      setLatency(ms);
    } catch {
      setStatus('down');
      setLatency(null);
    } finally {
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, intervalMs);
    return () => clearInterval(timer);
  }, [check, intervalMs]);

  return { status, latency, lastChecked, recheck: check };
}

/**
 * useKeyboardShortcut — Listen for a key combo and call a callback.
 *
 * Usage:
 *   useKeyboardShortcut('/', () => inputRef.current?.focus(), { preventDefault: true });
 *   useKeyboardShortcut('Escape', onClose);
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== key) return;
      if (options.ctrlKey && !e.ctrlKey) return;
      if (options.shiftKey && !e.shiftKey) return;
      if (options.altKey && !e.altKey) return;
      if (options.preventDefault) e.preventDefault();
      callback(e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options.ctrlKey, options.shiftKey, options.altKey, options.preventDefault]);
}

/**
 * useCopyToClipboard — Returns a function to copy text, and a "copied" flag.
 *
 * Usage:
 *   const [copy, copied] = useCopyToClipboard();
 *   <button onClick={() => copy('some text')}>{copied ? 'Copied!' : 'Copy'}</button>
 */
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    } catch {
      // Fallback for insecure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), resetMs);
    }
  }, [resetMs]);

  return [copy, copied];
}
