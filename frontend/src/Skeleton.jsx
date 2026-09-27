/**
 * SkeletonCard — Placeholder card shown while search results load.
 * Uses CSS shimmer animation from index.css.
 */
export function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Poster skeleton */}
      <div className="skeleton" style={{ height: '260px', width: '100%' }} />
      {/* Body skeleton */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div className="skeleton" style={{ height: '0.7rem', width: '40%' }} />
        <div className="skeleton" style={{ height: '1rem', width: '85%' }} />
        <div className="skeleton" style={{ height: '1rem', width: '60%' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <div className="skeleton" style={{ height: '0.8rem', width: '50px', borderRadius: '999px' }} />
          <div className="skeleton" style={{ height: '0.8rem', width: '50px', borderRadius: '999px' }} />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonGrid — Renders N skeleton cards in a responsive grid.
 * @param {number} count - number of skeleton cards (default: 8)
 */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '1.25rem',
      padding: '0 1.5rem',
    }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * SkeletonDetail — Full-page skeleton for detail/modal views.
 */
export function SkeletonDetail() {
  return (
    <div style={{
      padding: '2rem',
      display: 'flex',
      gap: '2rem',
      flexWrap: 'wrap',
    }}>
      {/* Poster */}
      <div className="skeleton" style={{ width: '200px', height: '300px', borderRadius: 'var(--radius)', flexShrink: 0 }} />
      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '200px' }}>
        <div className="skeleton" style={{ height: '0.7rem', width: '30%' }} />
        <div className="skeleton" style={{ height: '1.8rem', width: '75%' }} />
        <div className="skeleton" style={{ height: '1rem', width: '50%' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '100%' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '90%' }} />
        <div className="skeleton" style={{ height: '0.85rem', width: '70%' }} />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: '1.5rem', width: '70px', borderRadius: '999px' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
