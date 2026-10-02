/**
 * WatchlistPage.jsx v4 — Professional Watchlist with Stats Dashboard
 *
 * Features:
 *  - Stats cards (Total / Movies / Anime / Watched)
 *  - Progress bar (% completed)
 *  - Filter tabs (All / To Watch / Watched / Movies / Anime)
 *  - Per-card watched toggle + remove button
 *  - Empty state with CTA
 *
 * Author: Koushik-31368
 */
import { useState } from 'react';
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'towatch', label: 'To Watch' },
  { id: 'watched', label: 'Watched' },
  { id: 'movie',   label: 'Movies' },
  { id: 'anime',   label: 'Anime' },
];

/* ── WatchlistCard ───────────────────────────────────────────── */
function WatchlistCard({ item, onCardClick, onRemove, onWatchedToggle, watched }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className="media-card"
      style={{ opacity: watched ? 0.75 : 1, transition: 'all 0.2s' }}
      onClick={() => onCardClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onCardClick(item)}
    >
      <div className="media-card__poster-wrap">
        {/* Watched badge */}
        {watched && <div className="media-card__watched-badge">✓ Watched</div>}

        {/* Type badge */}
        <span className={`media-card__type-badge media-card__type-badge--${item.type}`}>
          {item.type === 'anime' ? 'Anime' : 'Movie'}
        </span>

        {/* Rating */}
        {item.rating > 0 && (
          <div className="media-card__rating">⭐ {item.rating}</div>
        )}

        {/* Poster */}
        {item.posterUrl && !imgErr
          ? <img
              className="media-card__poster"
              src={item.posterUrl}
              alt={item.title}
              loading="lazy"
              onError={() => setImgErr(true)}
            />
          : <div className="media-card__poster-placeholder">
              {item.type === 'anime' ? '🎌' : '🎬'}
            </div>
        }

        {/* Remove button */}
        <button
          id={`watchlist-remove-${item.id}`}
          className="media-card__save-btn media-card__save-btn--saved"
          style={{ opacity: 1, background: 'rgba(239,71,111,0.2)', borderColor: 'rgba(239,71,111,0.4)', color: 'var(--danger)' }}
          onClick={e => { e.stopPropagation(); onRemove(item); }}
          aria-label="Remove from watchlist"
        >
          ✕
        </button>
      </div>

      <div className="media-card__info">
        <p className="media-card__title">{item.title}</p>
        <div className="media-card__meta">
          <span className="media-card__year">{item.year}</span>
          {item.genres?.length > 0 && (
            <>
              <span className="media-card__dot">·</span>
              <span>{item.genres[0]}</span>
            </>
          )}
        </div>
        <button
          id={`watchlist-watched-${item.id}`}
          onClick={e => onWatchedToggle(e, item)}
          style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '0.3rem 0',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid',
            borderColor: watched ? 'rgba(6,214,160,0.35)' : 'var(--border)',
            background: watched ? 'rgba(6,214,160,0.1)' : 'var(--bg-glass-2)',
            color: watched ? 'var(--success)' : 'var(--text-muted)',
            fontSize: '0.7rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            transition: 'var(--transition)',
          }}
        >
          {watched ? '✅ Watched' : '○ Mark Watched'}
        </button>
      </div>
    </div>
  );
}

/* ── WatchlistPage ───────────────────────────────────────────── */
export default function WatchlistPage({ onCardClick }) {
  const {
    watchlist, watchedCount,
    removeFromWatchlist, clearWatchlist,
    isWatched, markWatched, unmarkWatched,
  } = useWatchlist();

  const [filter, setFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const movieCount = watchlist.filter(i => i.type === 'movie').length;
  const animeCount = watchlist.filter(i => i.type === 'anime').length;
  const toWatchCount = watchlist.length - watchedCount;

  const filtered = watchlist.filter(item => {
    if (filter === 'towatch') return !isWatched(item.id, item.type);
    if (filter === 'watched') return isWatched(item.id, item.type);
    if (filter === 'movie')   return item.type === 'movie';
    if (filter === 'anime')   return item.type === 'anime';
    return true;
  });

  const percent = watchlist.length > 0
    ? Math.round((watchedCount / watchlist.length) * 100)
    : 0;

  const handleRemove = (item) => {
    removeFromWatchlist(item.id, item.type);
    showToast(`Removed "${item.title}"`, 'info');
  };

  const handleClear = () => {
    clearWatchlist();
    setShowClearConfirm(false);
    showToast('Watchlist cleared', 'info');
  };

  const handleWatchedToggle = (e, item) => {
    e.stopPropagation();
    if (isWatched(item.id, item.type)) {
      unmarkWatched(item.id, item.type);
      showToast('Marked as unwatched', 'info');
    } else {
      markWatched(item.id, item.type);
      showToast(`"${item.title}" marked as watched ✓`, 'success');
    }
  };

  // Empty state
  if (watchlist.length === 0) {
    return (
      <div className="watchlist-page">
        <div className="discover-page__header">
          <h1 className="discover-page__title">My Watchlist</h1>
        </div>
        <div className="empty-state">
          <div className="empty-state__icon">📚</div>
          <p className="empty-state__title">Your watchlist is empty</p>
          <p className="empty-state__desc">
            Search for movies or anime and hit <strong>+ Save</strong> to add them here.
            Track what you want to watch and mark them as done.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-page">
      {/* Page header */}
      <div className="discover-page__header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="discover-page__title">My Watchlist</h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Track, manage and mark your movies & anime
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!showClearConfirm
              ? <button className="btn btn--danger" onClick={() => setShowClearConfirm(true)}>
                  🗑 Clear All
                </button>
              : <>
                  <button className="btn btn--ghost" onClick={() => setShowClearConfirm(false)}>Cancel</button>
                  <button className="btn btn--danger" onClick={handleClear}>Confirm Clear</button>
                </>
            }
          </div>
        </div>
      </div>

      {/* Stats dashboard */}
      <div className="watchlist-stats">
        <div className="stat-card">
          <span className="stat-card__value">{watchlist.length}</span>
          <span className="stat-card__label">Total</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{movieCount}</span>
          <span className="stat-card__label">Movies</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{animeCount}</span>
          <span className="stat-card__label">Anime</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{watchedCount}</span>
          <span className="stat-card__label">Watched</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__value">{toWatchCount}</span>
          <span className="stat-card__label">To Watch</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-wrap">
        <div className="progress-wrap__header">
          <span className="progress-wrap__label">Watch Progress</span>
          <span className="progress-wrap__pct">{percent}% complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="tab-group" style={{ marginBottom: '1.5rem' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            id={`watchlist-filter-${f.id}`}
            className={`tab-group__btn${filter === f.id ? ' tab-group__btn--active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {f.id === 'watched' && watchedCount > 0 && (
              <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.8 }}>({watchedCount})</span>
            )}
            {f.id === 'towatch' && toWatchCount > 0 && (
              <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', opacity: 0.8 }}>({toWatchCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* Empty filter state */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p className="empty-state__title">No items in "{FILTERS.find(f => f.id === filter)?.label}"</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="cards-grid">
        {filtered.map(item => (
          <WatchlistCard
            key={`${item.type}-${item.id}`}
            item={item}
            onCardClick={onCardClick}
            onRemove={handleRemove}
            onWatchedToggle={handleWatchedToggle}
            watched={isWatched(item.id, item.type)}
          />
        ))}
      </div>
    </div>
  );
}
