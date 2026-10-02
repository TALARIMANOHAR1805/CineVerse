/**
 * Toast.jsx v2 — Professional toast notification system
 *
 * Usage:
 *   import { ToastContainer, showToast } from './Toast';
 *   showToast('Saved!', 'success'); // 'success' | 'error' | 'info' | 'warning'
 *
 * Author: Koushik-31368
 */
import { useState, useEffect, useCallback } from 'react';

let _addToast = null;

const ICONS = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: 'var(--success)',
  error:   'var(--danger)',
  info:    'var(--brand)',
  warning: 'var(--warning)',
};

let nextId = 0;

export function showToast(message, type = 'info', duration = 3200) {
  if (_addToast) _addToast({ id: ++nextId, message, type, duration });
}

function Toast({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(t);
  }, [toast, onRemove]);

  return (
    <div
      className={`toast toast--${toast.type}`}
      role="status"
      aria-live="polite"
    >
      <span style={{ color: COLORS[toast.type], fontWeight: 700, fontSize: '1rem' }}>
        {ICONS[toast.type]}
      </span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss"
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.9rem', padding: '0 0.2rem',
          lineHeight: 1, fontFamily: 'inherit',
        }}
      >✕</button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((t) => {
    setToasts(prev => [...prev.slice(-4), t]);
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    _addToast = add;
    return () => { _addToast = null; };
  }, [add]);

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}
