/**
 * MediaGrid.jsx — Responsive card grid with optional section header.
 * Replaces inline results-grid divs across pages.
 * Author: Koushik-31368
 */
import { useState } from 'react';
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';

/**
 * @param {Array}    items
 * @param {function} onCardClick
 * @param {string}   [title]
 * @param {string}   [icon]
 * @param {string}   [badge]
 * @param {boolean}  [showWatchedBadge]
 */
export default function MediaGrid({ items = [], onCardClick, title, icon, badge, showWatchedBadge = false }) {
  if (!items.length && !title) return null;

  return (
    <div>
      {title && (
        <div className="section-header" style={{ padding: '0 1rem' }}>
          {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
          <h2 className="section-title">{title}</h2>
          {badge != null && <span className="section-count">{badge}</span>}
        </div>
      )}
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '2rem', fontSize: '0.88rem' }}>
          No items to display.
        </p>
      ) : (
        <div className="results-grid">
          {items.map((item, i) => (
            <MediaCard
              key={`${item.type}-${item.id}-${i}`}
              item={item}
              onClick={onCardClick}
              showWatchedBadge={showWatchedBadge}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({ item, onClick, showWatchedBadge }) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist, isWatched } = useWatchlist();
  const saved   = isInWatchlist(item.id, item.type);
  const watched = showWatchedBadge && isWatched(item.id, item.type);
  const [imgErr, setImgErr] = useState(false);

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(item.id, item.type);
      showToast(`Removed "${item.title}"`, 'info');
    } else {
      addToWatchlist(item);
      showToast(`Saved "${item.title}" ✓`, 'success');
    }
  };

  return (
    <div className="card" onClick={() => onClick?.(item)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.(item)}>
      <button className="card__bookmark" onClick={handleBookmark}
        aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}>
        {saved ? '🔖' : '＋'}
      </button>
      {watched && (
        <div style={{
          position:'absolute', top:0, left:0, right:0,
          background:'rgba(40,180,100,0.18)', borderRadius:'12px 12px 0 0',
          padding:'0.2rem 0.5rem', fontSize:'0.65rem', color:'rgb(80,220,120)',
          fontWeight:700, zIndex:2, textAlign:'center',
        }}>✅ WATCHED</div>
      )}
      {item.posterUrl && !imgErr
        ? <img className="card__poster" src={item.posterUrl} alt={item.title}
            loading="lazy" onError={() => setImgErr(true)} />
        : <div className="card__poster-placeholder">{item.type === 'anime' ? '🎌' : '🎬'}</div>
      }
      <div className="card__body">
        <p className={`card__type card__type--${item.type}`}>{item.type}</p>
        <p className="card__title">{item.title}</p>
        <div className="card__meta">
          <span className="card__year">{item.year}</span>
          {item.rating > 0 && <span className="card__rating">⭐ {item.rating}</span>}
        </div>
        {item.episodes && (
          <span style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>{item.episodes} eps</span>
        )}
        {item.genres?.length > 0 && (
          <div className="genre-list">
            {item.genres.slice(0,2).map(g => <span key={g} className="genre-tag">{g}</span>)}
          </div>
        )}
        <div className="card__cta">View details →</div>
      </div>
    </div>
  );
}
