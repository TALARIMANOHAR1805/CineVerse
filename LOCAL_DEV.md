## CineVerse — Local Development Guide

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Java | 21+     | [Adoptium](https://adoptium.net/) |
| Maven | 3.9+   | [maven.apache.org](https://maven.apache.org/download.cgi) |
| Node | 20+     | [nodejs.org](https://nodejs.org/) |
| Python | 3.11+ | [python.org](https://www.python.org/) |
| Docker | 25+   | [docker.com](https://www.docker.com/) |

---

### 1. Clone & Setup

```bash
git clone https://github.com/TALARIMANOHAR1805/CineVerse.git
cd CineVerse
```

### 2. Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and fill in:
#   TMDB_API_KEY=your_key
#   NEO4J_URI=bolt+ssc://...
#   NEO4J_USERNAME=neo4j
#   NEO4J_PASSWORD=your_password

# ML Service
cp ml/.env.example ml/.env
```

### 3. Run with Docker Compose (Easiest)

```bash
docker compose up --build
```

Services will be available at:
- Frontend: http://localhost:5173
- Backend:  http://localhost:8080
- ML:       http://localhost:8001

### 4. Run Each Service Manually

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**ML Service:**
```bash
cd ml
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

---

### 5. Useful API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Liveness check |
| `GET /api/health/info` | Runtime info (uptime, memory) |
| `GET /api/search?q=inception&type=movie` | Search movies |
| `GET /api/search?q=naruto&type=anime` | Search anime |
| `GET /api/admin/cache/stats` | Cache size |
| `POST /api/admin/cache/clear` | Clear cache |
| `POST /api/ml/poster/analyze` | Poster colour analysis |
| `GET /api/ml/discover/vibe/dark` | Vibe match |

---

### 6. Running Tests

```bash
# Backend
cd backend && mvn test

# ML
cd ml && pytest tests/ -v
```

---

### 7. Common Issues

**"Cannot connect to Neo4j"** → Check NEO4J_URI and credentials in `.env`  
**"TMDB API key missing"** → Add TMDB_API_KEY to `backend/.env`  
**"ML service cold start"** → First request takes ~30s on Render free tier  
**"Frontend shows no results"** → Make sure VITE_API_BASE_URL points to your backend
