/**
 * RatingBadge.jsx v2 — Professional rating badge with visual star scale
 * Author: Koushik-31368
 */

const RATING_COLORS = {
  high:   { bg: 'rgba(6, 214, 160, 0.12)',  border: 'rgba(6, 214, 160, 0.3)',  text: '#06d6a0' },
  mid:    { bg: 'rgba(255, 209, 102, 0.12)', border: 'rgba(255, 209, 102, 0.3)', text: '#ffd166' },
  low:    { bg: 'rgba(239, 71, 111, 0.12)',  border: 'rgba(239, 71, 111, 0.3)',  text: '#ef476f' },
  none:   { bg: 'rgba(255,255,255,0.05)',     border: 'rgba(255,255,255,0.08)',   text: '#5a6480' },
};

function getTier(rating) {
  if (rating >= 7.5) return 'high';
  if (rating >= 5.0) return 'mid';
  if (rating > 0)    return 'low';
  return 'none';
}

/**
 * @param {number} rating  - TMDB/MAL rating (0-10)
 * @param {'sm'|'md'|'lg'} [size='md']
 */
export default function RatingBadge({ rating, size = 'md' }) {
  if (!rating || rating === 0) return null;

  const tier = getTier(rating);
  const colors = RATING_COLORS[tier];
  const fontSize = size === 'sm' ? '0.65rem' : size === 'lg' ? '0.9rem' : '0.75rem';
  const padding  = size === 'sm' ? '0.15rem 0.45rem' : size === 'lg' ? '0.35rem 0.75rem' : '0.2rem 0.55rem';

  return (
    <div
      title={`Rating: ${rating}/10`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding,
        borderRadius: 'var(--radius-pill)',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        fontSize,
        fontWeight: 700,
        color: colors.text,
        fontFamily: 'Inter, sans-serif',
        lineHeight: 1,
      }}
    >
      ⭐ {rating.toFixed(1)}
    </div>
  );
}

/**
 * Inline star scale (5 stars visual, based on /10 rating)
 */
export function StarScale({ rating, max = 10 }) {
  const normalized = rating / max; // 0 to 1
  const stars = Math.round(normalized * 5); // 0 to 5

  return (
    <div
      style={{ display: 'inline-flex', gap: '1px' }}
      title={`${rating}/${max}`}
      aria-label={`${stars} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: '0.7rem', color: i <= stars ? '#ffd166' : 'var(--text-muted)' }}>
          {i <= stars ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
