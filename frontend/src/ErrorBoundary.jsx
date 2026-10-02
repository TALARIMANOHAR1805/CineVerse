/**
 * ErrorBoundary.jsx v2 — Professional error boundary with recovery
 * Author: Koushik-31368
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[CineVerse] Uncaught error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
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
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎬</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '2rem' }}>
            CineVerse ran into an unexpected error. This is likely a temporary issue.
          </p>
          {this.state.error && (
            <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <summary style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '0.5rem' }}>
                Error details
              </summary>
              <pre style={{
                fontSize: '0.7rem',
                color: 'var(--danger)',
                background: 'var(--bg-surface-2)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                overflow: 'auto',
                maxHeight: 120,
              }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="btn btn--primary"
              onClick={this.handleReset}
            >
              Try Again
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
