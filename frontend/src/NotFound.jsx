/**
 * NotFound.jsx v2 — Professional 404 page
 * Author: Koushik-31368
 */

export default function NotFound({ onGoHome }) {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        maxWidth: 480,
        textAlign: 'center',
        padding: '3rem 2rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Cinematic gradient number */}
        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          fontFamily: 'Playfair Display, serif',
          background: 'var(--brand-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1,
          marginBottom: '0.5rem',
        }}>
          404
        </div>

        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎬</div>

        <h1 style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
        }}>
          Scene Not Found
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          marginBottom: '2rem',
        }}>
          The page you're looking for seems to have been cut from the final edit.
          Let's get you back to the main feature.
        </p>

        <button className="btn btn--primary" onClick={onGoHome}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
