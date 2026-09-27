/**
 * Footer component — CineVerse site footer.
 * Shows tech stack, links, and attribution.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  const techStack = [
    { label: 'React + Vite', color: '#61dafb' },
    { label: 'Spring Boot', color: '#6db33f' },
    { label: 'FastAPI', color: '#009688' },
    { label: 'Neo4j', color: '#4581c3' },
  ];

  const links = [
    { label: 'GitHub', href: 'https://github.com/TALARIMANOHAR1805/CineVerse' },
    { label: 'TMDB', href: 'https://www.themoviedb.org/' },
    { label: 'Jikan API', href: 'https://jikan.moe/' },
  ];

  return (
    <footer
      role="contentinfo"
      style={{
        marginTop: 'auto',
        padding: '2.5rem 2rem',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <p style={{
        fontSize: '1.2rem',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #fff 30%, var(--accent))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.75rem',
      }}>
        🎬 CineVerse
      </p>

      {/* Tagline */}
      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        Your pre-watch decision tool for movies & anime
      </p>

      {/* Tech stack chips */}
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {techStack.map(t => (
          <span key={t.label} style={{
            padding: '0.2rem 0.65rem',
            border: `1px solid ${t.color}40`,
            borderRadius: '999px',
            fontSize: '0.72rem',
            color: t.color,
            background: `${t.color}10`,
          }}>
            {t.label}
          </span>
        ))}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {links.map(l => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-3)',
              fontSize: '0.82rem',
              transition: 'color var(--transition)',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Copyright */}
      <p style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
        © {year} CineVerse · Built with ❤️ · Data from TMDB & MyAnimeList
      </p>
    </footer>
  );
}
