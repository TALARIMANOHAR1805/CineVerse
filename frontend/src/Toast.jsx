import { useState, useEffect } from 'react';

/**
 * Toast notification system for CineVerse.
 * 
 * Usage:
 *   import { ToastContainer, useToast } from './Toast';
 *   const { showToast } = useToast();
 *   showToast('Copied!', 'success');
 */

// Simple event bus for toasts
const listeners = [];
const emit = (toast) => listeners.forEach(fn => fn(toast));

export function showToast(message, type = 'info', duration = 3000) {
  emit({ id: Date.now(), message, type, duration });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  if (!toasts.length) return null;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span>{icons[t.type] || icons.info}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
