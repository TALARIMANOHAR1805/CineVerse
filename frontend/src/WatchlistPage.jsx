/**
 * WatchlistPage.jsx v3 — Enhanced with Watched/Unwatched filter tabs
 *
 * New in v3:
 *  - "To Watch" / "Watched" / "All" filter tabs
 *  - Watched count badge
 *  - Mark as watched toggle on each card
 *  - Progress bar showing % of watchlist completed
 *
 * Author: Koushik-31368
 */
import { useState } from 'react';
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';

const FILTERS = [
  { id: 'all',      label: '📋 All' },
  { id: 'towatch',  label: '🎯 To Watch' },
  { id: 'watched',  label: '✅ Watched' },
  { id: 'movie',    label: '🎬 Movies' },
  { id: 'anime',    label: '🎌 Anime' },
];

export default function WatchlistPage({ onCardClick }) {
  const {
    watchlist, watchedCount,
    removeFromWatchlist, clearWatchlist,
    isWatched, markWatched, unmarkWatched,
  } = useWatchlist();

  const [filter, setFilter] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filtered = watchlist.filter(item => {
    if (filter === 'towatch') return !item.watched;
    if (filter === 'watched') return item.watched;
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
      showToast(`Marked as unwatched`, 'info');
    } else {
      markWatched(item.id, item.type);
      showToast(`Marked "${item.title}" as watched ✓`, 'success');
    }
  };

  if (watchlist.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'4rem 1rem' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🎬</div>
        <h2 style={{ color:'var(--text-1)', marginBottom:'0.5rem' }}>Your watchlist is empty</h2>
        <p style={{ color:'var(--text-2)', fontSize:'0.9rem' }}>
          Search for movies or browse anime and click <strong>+ Save</strong> to add them here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding:'2rem 0' }}>
      {/* Header */}
      <div style={{ padding:'0 1.5rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem' }}>
          <div>
            <h1 style={{
              fontSize:'clamp(1.4rem,4vw,1.9rem)', fontWeight:800,
              background:'linear-gradient(135deg,#fff 40%,#7c6fff)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              backgroundClip:'text', marginBottom:'0.25rem',
            }}>🔖 Watchlist</h1>
            <p style={{ color:'var(--text-2)', fontSize:'0.88rem' }}>
              {watchlist.length} saved · {watchedCount} watched · {watchlist.length - watchedCount} remaining
            </p>
          </div>
          {watchlist.length > 0 && (
            showClearConfirm ? (
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button
                  id="watchlist-confirm-clear"
                  onClick={handleClear}
                  style={{
                    padding:'0.35rem 0.9rem', borderRadius:6, border:'none',
                    background:'rgba(255,80,80,0.2)', color:'#ff5a5a',
                    cursor:'pointer', fontFamily:'inherit', fontSize:'0.82rem', fontWeight:600,
                  }}>Yes, clear all</button>
                <button onClick={() => setShowClearConfirm(false)}
                  style={{
                    padding:'0.35rem 0.9rem', borderRadius:6,
                    border:'1px solid var(--border)', background:'transparent',
                    color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit', fontSize:'0.82rem',
                  }}>Cancel</button>
              </div>
            ) : (
              <button
                id="watchlist-clear-btn"
                onClick={() => setShowClearConfirm(true)}
                style={{
                  padding:'0.35rem 0.9rem', borderRadius:6,
                  border:'1px solid rgba(255,80,80,0.3)', background:'transparent',
                  color:'rgba(255,80,80,0.7)', cursor:'pointer',
                  fontFamily:'inherit', fontSize:'0.82rem',
                }}>🗑 Clear all</button>
            )
          )}
        </div>

        {/* Progress bar */}
        {watchlist.length > 0 && (
          <div style={{ marginTop:'1rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
              <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>Watch progress</span>
              <span style={{ fontSize:'0.72rem', color:'var(--text-3)' }}>{percent}%</span>
            </div>
            <div style={{
              height:5, background:'rgba(255,255,255,0.08)', borderRadius:999, overflow:'hidden',
            }}>
              <div style={{
                height:'100%', width:`${percent}%`,
                background:'linear-gradient(90deg, var(--accent), var(--accent-2))',
                borderRadius:999, transition:'width 0.5s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ padding:'0 1.5rem', marginBottom:'1.25rem', overflowX:'auto' }}>
        <div className="tabs" style={{ justifyContent:'flex-start', flexWrap:'nowrap' }}>
          {FILTERS.map(f => (
            <button key={f.id}
              id={`watchlist-filter-${f.id}`}
              className={`tab${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}>
              {f.label}
              {f.id === 'watched' && watchedCount > 0 && (
                <span className="nav-badge" style={{ marginLeft:'0.3rem' }}>{watchedCount}</span>
              )}
              {f.id === 'towatch' && (watchlist.length - watchedCount) > 0 && (
                <span className="nav-badge" style={{ marginLeft:'0.3rem', background:'rgba(255,107,157,0.25)', color:'var(--accent-2)' }}>
                  {watchlist.length - watchedCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state for filter */}
      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'2rem', color:'var(--text-3)' }}>
          <p>No items in "{FILTERS.find(f => f.id === filter)?.label}" yet.</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="results-grid" style={{ padding:'0 1rem' }}>
        {filtered.map((item) => {
          const watched = isWatched(item.id, item.type);
          const [imgErr, setImgErr] = useState(false);
          return (
            <div key={`${item.type}-${item.id}`}
              className="card"
              style={{ position:'relative', opacity: watched ? 0.72 : 1, transition:'opacity 0.2s' }}
              onClick={() => onCardClick(item)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onCardClick(item)}>

              {/* Watched overlay badge */}
              {watched && (
                <div style={{
                  position:'absolute', top:0, left:0, right:0,
                  background:'rgba(40,180,100,0.18)',
                  borderRadius:'12px 12px 0 0',
                  padding:'0.25rem 0.5rem',
                  fontSize:'0.7rem', color:'rgb(80,220,120)', fontWeight:700,
                  zIndex:2,
                }}>✅ WATCHED</div>
              )}

              {/* Remove X */}
              <button
                id={`watchlist-remove-${item.id}`}
                className="card__bookmark"
                onClick={e => { e.stopPropagation(); handleRemove(item); }}
                aria-label="Remove from watchlist"
                style={{ top:'0.4rem', right:'0.4rem' }}>✕</button>

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
                {item.genres?.length > 0 && (
                  <div className="genre-list">
                    {item.genres.slice(0,2).map(g => <span key={g} className="genre-tag">{g}</span>)}
                  </div>
                )}
                <button
                  id={`watchlist-watched-${item.id}`}
                  onClick={e => handleWatchedToggle(e, item)}
                  style={{
                    marginTop:'0.5rem', width:'100%', padding:'0.3rem 0',
                    borderRadius:6, border:'1px solid',
                    borderColor: watched ? 'rgba(80,220,120,0.35)' : 'rgba(255,255,255,0.1)',
                    background: watched ? 'rgba(80,220,120,0.12)' : 'rgba(255,255,255,0.04)',
                    color: watched ? 'rgb(80,220,120)' : 'var(--text-3)',
                    fontSize:'0.72rem', cursor:'pointer', fontFamily:'inherit',
                    fontWeight:600, transition:'all 0.2s',
                  }}>
                  {watched ? '✅ Watched' : '○ Mark as Watched'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
