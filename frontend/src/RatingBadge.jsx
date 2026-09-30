/**
 * RatingBadge.jsx — Star/score display component for cards and panels.
 *
 * Supports: TMDB (0-10 scale), MAL/Jikan (0-10 scale already halved)
 * Shows: filled/empty stars + numeric score
 *
 * Author: Koushik-31368
 */

/**
 * RatingStars — renders ★ stars proportional to rating (0-10).
 * @param {number} rating  — 0 to 10
 * @param {number} max     — defaults to 5 stars visual
 */
export function RatingStars({ rating = 0, max = 5 }) {
  const normalized = Math.min(rating / 2, max); // out of 5
  const full  = Math.floor(normalized);
  const half  = normalized - full >= 0.5 ? 1 : 0;
  const empty = max - full - half;

  return (
    <span style={{ display:'inline-flex', gap:'1px', alignItems:'center' }}>
      {'★'.repeat(full).split('').map((_, i) => (
        <span key={`f${i}`} style={{ color:'#f5c518', fontSize:'0.85em' }}>★</span>
      ))}
      {half === 1 && <span style={{ color:'#f5c518', fontSize:'0.85em', opacity:0.6 }}>★</span>}
      {'☆'.repeat(empty).split('').map((_, i) => (
        <span key={`e${i}`} style={{ color:'rgba(255,255,255,0.2)', fontSize:'0.85em' }}>☆</span>
      ))}
    </span>
  );
}

/**
 * RatingBadge — inline chip with stars + numeric score.
 */
export function RatingBadge({ rating = 0, voteCount }) {
  if (!rating || rating === 0) return null;
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem' }}>
      <RatingStars rating={rating} />
      <span style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--text-1)' }}>
        {rating.toFixed(1)}
      </span>
      {voteCount != null && (
        <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>
          ({voteCount >= 1000 ? `${(voteCount/1000).toFixed(1)}k` : voteCount})
        </span>
      )}
    </div>
  );
}
