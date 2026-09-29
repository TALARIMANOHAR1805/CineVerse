/**
 * useInfiniteScroll.js — Intersection Observer based infinite scroll.
 *
 * Usage:
 *   const { loaderRef, page } = useInfiniteScroll(hasMore, loading);
 *   // Place <div ref={loaderRef} /> at the bottom of your list
 *
 * Author: Koushik-31368
 */
import { useState, useRef, useEffect, useCallback } from 'react';

export function useInfiniteScroll(hasMore = true, loading = false) {
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loading) {
      setPage(p => p + 1);
    }
  }, [hasMore, loading]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const reset = useCallback(() => setPage(1), []);

  return { loaderRef, page, reset };
}

/**
 * useWindowSize — Returns current window dimensions, updates on resize.
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const h = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);

  return size;
}

/**
 * useOnClickOutside — Calls handler when user clicks outside the given ref.
 *
 * Usage:
 *   const ref = useRef(null);
 *   useOnClickOutside(ref, () => setOpen(false));
 */
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
