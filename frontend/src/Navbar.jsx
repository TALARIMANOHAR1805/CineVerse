/**
 * Navbar component — Sticky top navigation bar for CineVerse.
 * 
 * Features:
 * - CineVerse logo with gradient text
 * - API health status indicator (live/offline dot)
 * - Scroll-aware background blur
 * - Responsive mobile support
 */
import { useState, useEffect } from 'react';

const API = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api$/, '');

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'up' | 'down' | 'unknown'

  // Scroll shadow effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Check API health on mount
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(4000) });
        setApiStatus(res.ok ? 'up' : 'down');
      } catch {
        setApiStatus('down');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = { up: '#22c55e', down: '#ef4444', unknown: '#f59e0b' };
  const statusLabel = { up: 'API Online', down: 'API Offline', unknown: 'Checking…' };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '64px',
        background: scrolled
          ? 'rgba(7,7,15,0.95)'
          : 'rgba(7,7,15,0.80)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          fontSize: '1.4rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #fff 30%, #7c6fff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}>
          🎬 CineVerse
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          background: 'rgba(124,111,255,0.12)',
          border: '1px solid rgba(124,111,255,0.3)',
          padding: '0.2rem 0.6rem',
          borderRadius: '999px',
        }}>
          Beta
        </span>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* API Health Dot */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-3)' }}
          title={statusLabel[apiStatus]}
          aria-label={statusLabel[apiStatus]}
        >
          <span style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: statusColor[apiStatus],
            boxShadow: apiStatus === 'up' ? `0 0 8px ${statusColor.up}` : 'none',
            animation: apiStatus === 'up' ? 'pulse 2s infinite' : 'none',
            display: 'inline-block',
          }} />
          <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>
            {statusLabel[apiStatus]}
          </span>
        </div>

        {/* GitHub link */}
        <a
          href="https://github.com/TALARIMANOHAR1805/CineVerse"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View CineVerse on GitHub"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.4rem 0.85rem',
            border: '1px solid var(--border)',
            borderRadius: '999px',
            fontSize: '0.8rem',
            color: 'var(--text-2)',
            transition: 'all var(--transition)',
          }}
          onMouseOver={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-2)';
          }}
        >
          ★ Star
        </a>
      </div>
    </nav>
  );
}
