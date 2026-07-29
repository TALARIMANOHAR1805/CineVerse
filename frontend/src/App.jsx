/**
 * App.jsx — CineVerse Phase 0 placeholder page.
 * 
 * This is the shell that will grow into the full UI.
 * For now it just confirms "we're alive" and lists the services.
 */
function App() {
  const services = [
    { name: "Backend API",  port: "8080", endpoint: "/api/health" },
    { name: "ML Service",   port: "8001", endpoint: "/health" },
    { name: "Frontend",     port: "5173", endpoint: "/" },
  ];

  return (
    <main className="hero">
      <span className="hero__badge">Phase 0 — Scaffolding</span>

      <h1 className="hero__title">CineVerse</h1>

      <p className="hero__subtitle">
        Your pre-watch decision tool for movies &amp; anime.<br />
        Spoiler-free summaries · Timeline placement · Graph discovery
      </p>

      <div className="status-grid">
        {services.map((s) => (
          <div key={s.name} className="status-pill">
            <span className="status-dot" />
            {s.name} :{s.port}
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
