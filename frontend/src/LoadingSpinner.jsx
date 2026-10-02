/**
 * LoadingSpinner.jsx v2 — Professional loading components
 * Author: Koushik-31368
 */

/**
 * Spinning ring loader
 */
export default function LoadingSpinner({ size = 40, label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={label}
        role="status"
      >
        <circle
          cx="20" cy="20" r="17"
          fill="none"
          stroke="var(--bg-surface-3)"
          strokeWidth="3"
        />
        <circle
          cx="20" cy="20" r="17"
          fill="none"
          stroke="url(#spinner-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="80 26"
          style={{ animation: 'spin 0.8s linear infinite', transformOrigin: 'center' }}
        />
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c6fff" />
            <stop offset="100%" stopColor="#ff6b9d" />
          </linearGradient>
        </defs>
      </svg>
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</p>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/**
 * Inline loading dots
 */
export function LoadingDots() {
  return (
    <span aria-label="Loading" style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 4, height: 4,
            borderRadius: '50%',
            background: 'var(--brand)',
            animation: `pulse-dot 1.2s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes pulse-dot { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }`}</style>
    </span>
  );
}

/**
 * Full-page loading screen
 */
export function PageLoader({ message = 'Loading CineVerse…' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
      zIndex: 9999,
      gap: '1.5rem',
    }}>
      <div style={{
        fontSize: '2rem',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        background: 'var(--brand-gradient)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        🎬 CineVerse
      </div>
      <LoadingSpinner size={48} label={message} />
    </div>
  );
}
