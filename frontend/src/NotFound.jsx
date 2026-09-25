import { useRouteError, Link } from 'react-router-dom';

/**
 * NotFound component - Renders a styled 404 error page.
 * Displayed when a user navigates to an unknown route.
 */
export default function NotFound() {
  const error = useRouteError();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: '#fff',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: '900',
        background: 'linear-gradient(90deg, #f72585, #7209b7, #3a0ca3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1,
        marginBottom: '1rem',
      }}>
        404
      </div>

      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎬</div>

      <h1 style={{
        fontSize: '1.8rem',
        fontWeight: '700',
        marginBottom: '0.75rem',
        color: '#f0f0f0',
      }}>
        Scene Not Found
      </h1>

      <p style={{
        fontSize: '1rem',
        color: '#a0a0c0',
        maxWidth: '400px',
        marginBottom: '2rem',
        lineHeight: 1.6,
      }}>
        {error?.statusText || error?.message ||
          "Looks like this page got lost in the multiverse. The reel you're looking for doesn't exist."}
      </p>

      <Link
        to="/"
        style={{
          display: 'inline-block',
          padding: '0.75rem 2rem',
          background: 'linear-gradient(90deg, #f72585, #7209b7)',
          color: '#fff',
          borderRadius: '50px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1rem',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: '0 4px 20px rgba(247, 37, 133, 0.4)',
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(247, 37, 133, 0.6)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(247, 37, 133, 0.4)';
        }}
      >
        ← Back to Home
      </Link>
    </div>
  );
}
