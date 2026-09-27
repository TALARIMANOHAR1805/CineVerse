/**
 * WatchlistPage — Displays the user's saved watchlist items.
 * Uses WatchlistContext for state and supports remove + clear.
 */
import { useWatchlist } from './WatchlistContext';
import { showToast } from './Toast';

export default function WatchlistPage({ onCardClick }) {
  const { watchlist, removeFromWatchlist, clearWatchlist } = useWatchlist();

  const handleRemove = (item) => {
    removeFromWatchlist(item.id, item.type);
    showToast(`Removed "${item.title}" from watchlist`, 'info');
  };

  const handleClear = () => {
    clearWatchlist();
    showToast('Watchlist cleared', 'info');
  };

  if (!watchlist.length) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '60vh', gap: '1rem',
        color: 'var(--text-3)', textAlign: 'center',
      }}>
        <span style={{ fontSize: '4rem' }}>🎞️</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-2)' }}>
          Your watchlist is empty
        </h2>
        <p style={{ fontSize: '0.9rem', maxWidth: '320px', lineHeight: 1.6 }}>
          Search for movies and anime, then hit the bookmark button to save them here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>My Watchlist</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <button
          onClick={handleClear}
          style={{
            padding: '0.4rem 1rem',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '999px',
            color: '#ef4444',
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
        >
          Clear All
        </button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1.25rem',
      }}>
        {watchlist.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform var(--transition), border-color var(--transition)',
            }}
            onClick={() => onCardClick(item)}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {/* Remove button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
              title="Remove from watchlist"
              aria-label={`Remove ${item.title} from watchlist`}
              style={{
                position: 'absolute', top: '0.5rem', right: '0.5rem',
                background: 'rgba(0,0,0,0.7)', border: 'none',
                borderRadius: '50%', width: 28, height: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '0.75rem', cursor: 'pointer',
                zIndex: 2, transition: 'background var(--transition)',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.8)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
            >✕</button>

            {/* Poster */}
            {item.posterUrl
              ? <img src={item.posterUrl} alt={item.title} loading="lazy"
                  style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
              : <div style={{
                  height: '260px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '3rem',
                  background: 'var(--surface-2)',
                }}>
                  {item.type === 'anime' ? '🎌' : '🎬'}
                </div>
            }

            {/* Info */}
            <div style={{ padding: '0.75rem' }}>
              <span style={{
                fontSize: '0.65rem', fontWeight: '600', letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: item.type === 'anime' ? '#ff6b9d' : '#7c6fff',
              }}>
                {item.type}
              </span>
              <p style={{ fontWeight: '600', fontSize: '0.9rem', marginTop: '0.2rem', lineHeight: 1.3 }}>
                {item.title}
              </p>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                {item.year} {item.rating > 0 && `· ⭐ ${item.rating}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
