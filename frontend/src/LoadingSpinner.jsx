/**
 * LoadingSpinner component - Displays an animated spinner with optional message.
 *
 * Props:
 *   message {string} - Optional loading message to display (default: "Loading...")
 *   size    {string} - Spinner size: "sm" | "md" | "lg" (default: "md")
 *   fullPage {bool}  - If true, centers spinner over full viewport (default: false)
 */
export default function LoadingSpinner({
  message = 'Loading...',
  size = 'md',
  fullPage = false,
}) {
  const sizes = { sm: 32, md: 56, lg: 80 };
  const px = sizes[size] ?? sizes.md;
  const border = Math.max(3, px / 10);

  const wrapperStyle = fullPage
    ? {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 12, 41, 0.85)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      };

  return (
    <div style={wrapperStyle} role="status" aria-live="polite" aria-label={message}>
      {/* Animated ring */}
      <div
        style={{
          width: px,
          height: px,
          borderRadius: '50%',
          border: `${border}px solid rgba(247, 37, 133, 0.2)`,
          borderTopColor: '#f72585',
          borderRightColor: '#7209b7',
          animation: 'cv-spin 0.9s linear infinite',
        }}
      />

      {/* Film strip dots below spinner */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginTop: '1rem',
      }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#f72585',
              opacity: 0.7,
              animation: `cv-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {message && (
        <p style={{
          marginTop: '0.75rem',
          color: '#a0a0c0',
          fontSize: '0.9rem',
          fontFamily: "'Inter', sans-serif",
          letterSpacing: '0.02em',
        }}>
          {message}
        </p>
      )}

      {/* Keyframe styles injected inline */}
      <style>{`
        @keyframes cv-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes cv-pulse {
          0%, 100% { transform: scale(0.6); opacity: 0.4; }
          50%       { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
