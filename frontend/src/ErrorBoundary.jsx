/**
 * ErrorBoundary.jsx v2 — React error boundary with retry.
 *
 * Catches render errors and shows a friendly UI with:
 *  - Error message
 *  - Retry button (resets state)
 *  - Reload page option
 *
 * Author: Koushik-31368
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[CineVerse] Render error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center', background: 'var(--bg)', gap: '1.25rem',
      }}>
        <span style={{ fontSize: '3.5rem' }}>💥</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', maxWidth: 380 }}>
          {this.state.error?.message || 'An unexpected error occurred in CineVerse.'}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.55rem 1.5rem',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              border: 'none', borderRadius: '999px', color: '#fff',
              fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >↩ Try Again</button>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.55rem 1.5rem',
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '999px', color: 'var(--text-2)',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >🔄 Reload Page</button>
        </div>
        {import.meta.env.DEV && (
          <pre style={{
            marginTop: '1rem', padding: '0.75rem 1rem',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8, fontSize: '0.72rem', color: '#ef4444',
            maxWidth: 480, textAlign: 'left', overflowX: 'auto', whiteSpace: 'pre-wrap',
          }}>
            {this.state.error?.stack}
          </pre>
        )}
      </div>
    );
  }
}
