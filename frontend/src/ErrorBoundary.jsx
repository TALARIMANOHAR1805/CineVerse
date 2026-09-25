import { Component } from 'react';

/**
 * ErrorBoundary component - Catches JavaScript errors anywhere in the
 * child component tree and displays a fallback UI instead of crashing.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   ErrorBoundary>
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CineVerse ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'rgba(15, 12, 41, 0.95)',
          borderRadius: '16px',
          margin: '2rem auto',
          maxWidth: '600px',
          color: '#fff',
          fontFamily: "'Inter', sans-serif",
          border: '1px solid rgba(247, 37, 133, 0.3)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#f72585',
            marginBottom: '0.5rem',
          }}>
            Something went wrong
          </h2>
          <p style={{
            color: '#a0a0c0',
            fontSize: '0.95rem',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
          }}>
            An unexpected error occurred in this scene. Our crew is on it.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'left',
              width: '100%',
              fontSize: '0.8rem',
              color: '#ff6b6b',
              overflowX: 'auto',
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Error Details (dev only)
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: '0.65rem 1.75rem',
              background: 'linear-gradient(90deg, #f72585, #7209b7)',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
