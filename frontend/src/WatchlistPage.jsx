/**
 * WatchlistPage.jsx v2 — Full watchlist management page.
 *
 * Features:
 *  - Grid of saved items with MediaCard
 *  - Clear all button with confirmation
 *  - Filter by type (all / movies / anime)
 *  - Empty state with CTA
 *
 * Author: Koushik-31368
 */
import { useState } from 'react';
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';

function MediaCardMini({ item, onClick, onRemove }) {
  return (
    <div
      className="card"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(item)}
      style={{ cursor: 'pointer' }}
    >
      <button
        className="card__bookmark"
        onClick={e => { e.stopPropagation(); onRemove(item); }}
        aria-label="Remove from watchlist"
        title="Remove"
        style={{ background: 'rgba(239,68,68,0.7)' }}
      >✕</button>

      {item.posterUrl
        ? <img className="card__poster" src={item.posterUrl} alt={item.title} loading="lazy" />
        : <div className="card__poster-placeholder">{item.type === 'anime' ? '🎌' : '🎬'}</div>
      }
      <div className="card__body">
        <p className={`card__type card__type--${item.type}`}>{item.type}</p>
        <p className="card__title">{item.title}</p>
        <div className="card__meta">
          <span className="card__year">{item.year}</span>
          {item.rating > 0 && <span className="card__rating">⭐ {item.rating}</span>}
        </div>
        {item.genres?.length > 0 && (
          <div className="genre-list">
            {item.genres.slice(0, 3).map(g => <span key={g} className="genre-tag">{g}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchlistPage({ onCardClick }) {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();
  const [filter, setFilter] = useState('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const FILTERS = [
    { id: 'all',   label: `🎯 All (${watchlist.length})` },
    { id: 'movie', label: `🎬 Movies (${watchlist.filter(i => i.type === 'movie').length})` },
    { id: 'anime', label: `🎌 Anime (${watchlist.filter(i => i.type === 'anime').length})` },
  ];

  const filtered = filter === 'all'
    ? watchlist
    : watchlist.filter(i => i.type === filter);

  function handleRemove(item) {
    removeFromWatchlist(item.id, item.type);
    showToast(`Removed "${item.title}"`, 'info');
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearWatchlist();
    setConfirmClear(false);
    showToast('Watchlist cleared', 'info');
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800,
          background: 'linear-gradient(135deg,#fff 40%,#7c6fff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: '0.5rem',
        }}>
          🔖 My Watchlist
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
          {watchlist.length === 0
            ? 'Nothing saved yet — search and click + to save'
            : `${watchlist.length} item${watchlist.length !== 1 ? 's' : ''} saved`}
        </p>
      </div>

      {/* Controls */}
      {watchlist.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Filter tabs */}
          <div className="tabs" style={{ justifyContent: 'flex-start', margin: 0 }}>
            {FILTERS.map(f => (
              <button key={f.id}
                className={`tab${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Clear all */}
          <button
            onClick={handleClear}
            style={{
              padding: '0.35rem 0.9rem',
              border: `1px solid ${confirmClear ? '#ef4444' : 'var(--border)'}`,
              borderRadius: '999px',
              background: confirmClear ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: confirmClear ? '#ef4444' : 'var(--text-3)',
              fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onBlur={() => setTimeout(() => setConfirmClear(false), 300)}
          >
            {confirmClear ? '⚠️ Confirm clear all' : '🗑 Clear all'}
          </button>
        </div>
      )}

      {/* Grid or empty state */}
      {watchlist.length === 0 ? (
        <div className="state-center">
          <span className="state-icon">🔖</span>
          <p className="state-title">Your watchlist is empty</p>
          <p className="state-text">
            Search for movies or anime and click <strong>+</strong> to save them here.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="state-center">
          <span className="state-icon">🔎</span>
          <p className="state-title">No {filter === 'movie' ? 'movies' : 'anime'} saved</p>
          <p className="state-text">Try a different filter.</p>
        </div>
      ) : (
        <div className="results-grid">
          {filtered.map(item => (
            <MediaCardMini
              key={`${item.type}-${item.id}`}
              item={item}
              onClick={onCardClick}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
