/**
 * Footer.jsx v3 — CineVerse footer with keyboard shortcut hints.
 * Author: Koushik-31368
 */

const TECH = [
  { label: 'React 18', url: 'https://react.dev' },
  { label: 'Vite 5',   url: 'https://vitejs.dev' },
  { label: 'TMDB API', url: 'https://www.themoviedb.org' },
  { label: 'Jikan API', url: 'https://jikan.moe' },
  { label: 'JustWatch', url: 'https://www.justwatch.com' },
  { label: 'Spring Boot', url: 'https://spring.io/projects/spring-boot' },
  { label: 'FastAPI',  url: 'https://fastapi.tiangolo.com' },
];

const SHORTCUTS = [
  { key: '/', desc: 'Search' },
  { key: 'D', desc: 'Discover' },
  { key: 'W', desc: 'Watchlist' },
  { key: 'H', desc: 'Home' },
  { key: 'Esc', desc: 'Close panel' },
];


export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '2rem 1.5rem',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '1rem', textAlign: 'center',
    }}>
      {/* Tech stack */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
        {TECH.map(t => (
          <a
            key={t.label}
            href={t.url}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '0.72rem', padding: '0.2rem 0.6rem',
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              borderRadius: '999px', color: 'var(--text-3)',
              textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'rgba(124,111,255,0.4)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {t.label}
          </a>
        ))}
      </div>

        {/* Keyboard shortcuts */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', justifyContent:'center' }}>
          {SHORTCUTS.map(s => (
            <span key={s.key} style={{ fontSize:'0.7rem', color:'var(--text-3)' }}>
              <kbd style={{
                padding:'0.1rem 0.35rem', border:'1px solid var(--border)',
                borderRadius:4, fontFamily:'monospace', fontSize:'0.68rem',
                background:'rgba(255,255,255,0.04)', marginRight:'0.2rem',
              }}>{s.key}</kbd>
              {s.desc}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
          🎬 CineVerse © {new Date().getFullYear()}
        </span>
        <span style={{ color: 'var(--border)' }}>·</span>
        <a
          href="https://github.com/TALARIMANOHAR1805/CineVerse"
          target="_blank" rel="noreferrer"
          style={{ fontSize: '0.8rem', color: 'var(--text-3)', textDecoration: 'none' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          ⭐ GitHub
        </a>
        <span style={{ color: 'var(--border)' }}>·</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
          Movie data from TMDB · Anime from Jikan
        </span>
      </div>
    </footer>
  );
}

