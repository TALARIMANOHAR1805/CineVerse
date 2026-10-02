/**
 * Footer.jsx v4 — Professional CineVerse Footer
 * Author: Koushik-31368
 */

const TECH = [
  { label: 'React 18',    url: 'https://react.dev' },
  { label: 'Vite 5',      url: 'https://vitejs.dev' },
  { label: 'TMDB API',    url: 'https://www.themoviedb.org' },
  { label: 'Jikan API',   url: 'https://jikan.moe' },
  { label: 'JustWatch',   url: 'https://www.justwatch.com' },
  { label: 'Spring Boot', url: 'https://spring.io/projects/spring-boot' },
  { label: 'FastAPI',     url: 'https://fastapi.tiangolo.com' },
];

const SHORTCUTS = [
  { key: '/', desc: 'Search' },
  { key: 'D', desc: 'Discover' },
  { key: 'W', desc: 'Watchlist' },
  { key: 'H', desc: 'Home' },
  { key: 'Esc', desc: 'Close' },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Brand */}
      <div className="footer__brand">🎬 CineVerse</div>

      {/* Tech stack */}
      <div className="footer__tech">
        {TECH.map(t => (
          <a
            key={t.label}
            href={t.url}
            target="_blank"
            rel="noreferrer"
            className="footer__tech-badge"
          >
            {t.label}
          </a>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div className="footer__shortcuts">
        {SHORTCUTS.map(s => (
          <div key={s.key} className="footer__shortcut">
            <kbd className="footer__key">{s.key}</kbd>
            <span>{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Bottom line */}
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} CineVerse</span>
        <span>·</span>
        <a href="https://github.com/TALARIMANOHAR1805/CineVerse" target="_blank" rel="noreferrer">
          ⭐ GitHub
        </a>
        <span>·</span>
        <span>Movie data from TMDB · Anime from Jikan</span>
        <span>·</span>
        <span>Not affiliated with any streaming service</span>
      </div>
    </footer>
  );
}
