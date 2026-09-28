/**
 * NotFound.jsx v2 — Styled 404 page for CineVerse.
 * Shows animated 404, a helpful message, and a back-to-home button.
 * Improved by: Koushik-31368
 */
export default function NotFound({ onHome }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem',
      background: 'var(--bg)',
      gap: '1.5rem',
      animation: 'fadeUp 0.6s ease',
    }}>
      {/* Animated 404 */}
      <div style={{
        fontSize: 'clamp(5rem, 20vw, 10rem)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #fff 30%, var(--accent) 75%, var(--accent-2))',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1,
        letterSpacing: '-0.04em',
      }}>404</div>

      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', maxWidth: 380, lineHeight: 1.7 }}>
          The page you're looking for doesn't exist. It might have been moved, deleted, or never existed.
        </p>
      </div>

      <button
        onClick={onHome}
        style={{
          padding: '0.7rem 2rem',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          border: 'none', borderRadius: '999px',
          color: '#fff', fontWeight: 600, fontSize: '1rem',
          cursor: 'pointer', fontFamily: 'inherit',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseOut={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        🎬 Back to CineVerse
      </button>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
        Or press <kbd style={{ padding: '0.1rem 0.35rem', border: '1px solid var(--border)', borderRadius: 4 }}>←</kbd> to go back
      </p>
    </div>
  );
}
