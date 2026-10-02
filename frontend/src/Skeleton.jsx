/**
 * Skeleton.jsx v2 — Shimmer skeleton loading components
 *
 * Components:
 *  - SkeletonCard: single media card placeholder
 *  - SkeletonGrid: grid of SkeletonCards
 *  - SkeletonText: text line placeholder
 *  - SkeletonPanel: detail panel placeholder
 *
 * Author: Koushik-31368
 */

/**
 * Single skeleton card — matches media-card dimensions
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-card__poster" />
      <div className="skeleton-card__body">
        <div className="skeleton" style={{ height: 12, borderRadius: 4, width: '82%' }} />
        <div className="skeleton" style={{ height: 10, borderRadius: 4, width: '52%', marginTop: 4 }} />
      </div>
    </div>
  );
}

/**
 * Grid of skeleton cards
 * @param {number} [count=12]
 */
export function SkeletonGrid({ count = 12 }) {
  return (
    <div className="cards-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

/**
 * Single text line skeleton
 * @param {number|string} [width='100%']
 * @param {number} [height=12]
 */
export function SkeletonText({ width = '100%', height = 12 }) {
  return (
    <div
      className="skeleton"
      style={{ height, width, borderRadius: 4 }}
      aria-hidden="true"
    />
  );
}

/**
 * Detail panel skeleton (poster + meta rows)
 */
export function SkeletonPanel() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
      <div className="skeleton" style={{ width: 140, flexShrink: 0, aspectRatio: '2/3', borderRadius: 'var(--radius-md)' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingTop: '0.25rem' }}>
        {[90, 60, 75, 55, 65].map((w, i) => (
          <SkeletonText key={i} width={`${w}%`} height={i === 0 ? 18 : 12} />
        ))}
      </div>
    </div>
  );
}
