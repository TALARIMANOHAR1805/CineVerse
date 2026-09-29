/**
 * Skeleton.jsx v2 — Shimmer skeleton loaders for CineVerse.
 *
 * Components:
 *  - SkeletonCard  — single card placeholder
 *  - SkeletonGrid  — grid of n cards
 *  - SkeletonDetail — detail panel placeholder
 *
 * Author: Koushik-31368
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s infinite',
  borderRadius: 6,
};

export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      {/* Poster */}
      <div style={{ ...shimmerStyle, aspectRatio: '2/3', width: '100%' }} />
      {/* Body */}
      <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ ...shimmerStyle, height: 10, width: '40%' }} />
        <div style={{ ...shimmerStyle, height: 14, width: '85%' }} />
        <div style={{ ...shimmerStyle, height: 10, width: '60%' }} />
        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.2rem' }}>
          <div style={{ ...shimmerStyle, height: 18, width: 50, borderRadius: 999 }} />
          <div style={{ ...shimmerStyle, height: 18, width: 40, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8, label = 'Loading…' }) {
  return (
    <div>
      {/* Section header skeleton */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ ...shimmerStyle, width: 24, height: 24, borderRadius: '50%' }} />
        <div style={{ ...shimmerStyle, width: 160, height: 18 }} />
        <div style={{ ...shimmerStyle, width: 80, height: 20, borderRadius: 999 }} />
      </div>
      {/* Grid */}
      <div className="results-grid" aria-label={label} aria-busy="true">
        {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div style={{ ...shimmerStyle, width: 160, height: 240, borderRadius: 'var(--radius)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ ...shimmerStyle, height: 12, width: '30%' }} />
        <div style={{ ...shimmerStyle, height: 28, width: '70%' }} />
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[60, 80, 70].map((w, i) => (
            <div key={i} style={{ ...shimmerStyle, height: 22, width: w, borderRadius: 999 }} />
          ))}
        </div>
        {[100, 95, 90, 75, 80].map((w, i) => (
          <div key={i} style={{ ...shimmerStyle, height: 12, width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
