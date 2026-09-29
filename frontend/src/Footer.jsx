/**
 * Footer.jsx v2 — Enhanced CineVerse footer.
 *
 * Shows: tech stack pills, links, and a status indicator.
 *
 * Author: Koushik-31368
 */

const TECH = [
  { label: 'React 18', url: 'https://react.dev' },
  { label: 'Vite',     url: 'https://vitejs.dev' },
  { label: 'TMDB',     url: 'https://www.themoviedb.org' },
  { label: 'Jikan',    url: 'https://jikan.moe' },
  { label: 'Spring Boot', url: 'https://spring.io/projects/spring-boot' },
  { label: 'FastAPI',  url: 'https://fastapi.tiangolo.com' },
  { label: 'Neo4j',    url: 'https://neo4j.com' },
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
