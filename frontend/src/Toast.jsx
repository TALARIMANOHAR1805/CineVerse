/**
 * Toast.jsx v2 — Event-driven toast notification system.
 *
 * Usage:
 *   showToast('Message text', 'success' | 'error' | 'info');
 *   <ToastContainer /> — put once in App root
 *
 * Improvements:
 *  - Max 4 toasts visible
 *  - Click to dismiss
 *  - Accessible aria-live region
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';

const BUS_EVENT = 'cineverse:toast';
let toastId = 0;

export function showToast(message, type = 'info', duration = 3500) {
  window.dispatchEvent(new CustomEvent(BUS_EVENT, {
    detail: { id: ++toastId, message, type, duration }
  }));
}

const ICONS = { success: '✓', error: '⚠️', info: 'ℹ' };
const COLORS = {
  success: 'rgba(34,197,94,0.15)',
  error:   'rgba(239,68,68,0.15)',
  info:    'rgba(124,111,255,0.12)',
};
const BORDER_COLORS = {
  success: 'rgba(34,197,94,0.4)',
  error:   'rgba(239,68,68,0.4)',
  info:    'rgba(124,111,255,0.3)',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const toast = e.detail;
      setToasts(prev => {
        const next = [toast, ...prev].slice(0, 4); // max 4
        return next;
      });
      setTimeout(() => remove(toast.id), toast.duration);
    };
    window.addEventListener(BUS_EVENT, handler);
    return () => window.removeEventListener(BUS_EVENT, handler);
  }, [remove]);

  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 300,
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        maxWidth: '320px', width: '100%',
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          onClick={() => remove(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.7rem 1rem',
            background: COLORS[t.type] || COLORS.info,
            border: `1px solid ${BORDER_COLORS[t.type] || BORDER_COLORS.info}`,
            borderRadius: '10px',
            backdropFilter: 'blur(20px)',
            cursor: 'pointer',
            animation: 'fadeUp 0.25s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ fontSize: '1rem', flex: '0 0 auto' }}>{ICONS[t.type]}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.4, flex: 1 }}>
            {t.message}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', flex: '0 0 auto' }}>✕</span>
        </div>
      ))}
    </div>
  );
}
