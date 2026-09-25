# Contributing to CineVerse 🎬

Thank you for your interest in contributing to CineVerse! This document outlines the guidelines and workflow for contributing to this project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Tech Stack Overview](#tech-stack-overview)

---

## Code of Conduct

By participating in this project, you agree to maintain a welcoming, inclusive, and respectful environment for all contributors.

---

## How to Contribute

### Reporting Bugs
1. Check if the bug is already reported in [Issues](https://github.com/TALARIMANOHAR1805/CineVerse/issues)
2. If not, open a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Suggesting Enhancements
- Open an issue with the `enhancement` label
- Describe the feature and its use case clearly

### Submitting Code
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests
5. Submit a Pull Request

---

## Development Setup

### Prerequisites
- **Java 21** (for backend)
- **Python 3.11** (for ML service)
- **Node.js 18+** (for frontend)
- **Docker & Docker Compose** (recommended)
- **Neo4j AuraDB** account

### Quick Start with Docker
```bash
# Clone the repo
git clone https://github.com/TALARIMANOHAR1805/CineVerse.git
cd CineVerse

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ml/.env.example ml/.env

# Start all services
docker-compose up --build
```

### Manual Setup

#### Backend (Spring Boot)
```bash
cd backend
cp .env.example .env
# Fill in your TMDB_API_KEY and Neo4j credentials in .env
./mvnw spring-boot:run
```

#### ML Service (FastAPI)
```bash
cd ml
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

#### Frontend (Vite + React)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/short-description` | `feature/user-watchlist` |
| Bug Fix | `fix/issue-description` | `fix/search-null-pointer` |
| Docs | `docs/what-you-updated` | `docs/api-endpoints` |
| Refactor | `refactor/component-name` | `refactor/graph-service` |
| Test | `test/what-is-tested` | `test/jikan-service-unit` |

---

## Commit Message Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

### Types
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style (formatting, no logic change)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Build process, dependencies

### Examples
```
feat(backend): add rate limiting to search endpoint
fix(frontend): resolve null state on empty search results
docs(readme): add setup instructions for Windows
test(ml): add unit tests for vibe match scoring
```

---

## Pull Request Process

1. Ensure your branch is up-to-date with `main`
2. Write a clear PR description explaining:
   - What changes were made and why
   - How to test the changes
   - Screenshots (for UI changes)
3. Link related issues with `Closes #issue-number`
4. Request a review from a maintainer
5. Address all review comments before merging

---

## Tech Stack Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vite + React | User interface |
| **Backend** | Spring Boot 3.3 (Java 21) | REST API, business logic |
| **Graph DB** | Neo4j AuraDB | Movie relationship queries |
| **ML Service** | FastAPI (Python 3.11) | Vibe matching, poster analysis |
| **Containerization** | Docker + Docker Compose | Local development & deployment |
| **Deployment** | Render | Cloud hosting |

---

## Questions?

Feel free to open a [Discussion](https://github.com/TALARIMANOHAR1805/CineVerse/discussions) or reach out via Issues.

Happy coding! 🚀
