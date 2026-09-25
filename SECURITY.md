# Security Policy 🔒

## Supported Versions

| Version | Supported |
|---------|-----------|
| main (latest) | ✅ |
| older branches | ❌ |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities via public GitHub Issues.**

If you discover a security vulnerability in CineVerse, please report it responsibly:

1. **Email**: Open a private GitHub Security Advisory
2. **GitHub**: Use [Security Advisories](https://github.com/TALARIMANOHAR1805/CineVerse/security/advisories/new)

### What to Include
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline
- **Acknowledgement**: Within 48 hours
- **Status update**: Within 5 business days
- **Fix timeline**: Depends on severity

## Security Best Practices for Contributors

### Environment Variables
- Never commit `.env` files — use `.env.example` templates
- Never hardcode API keys (TMDB, Neo4j credentials)
- Rotate keys immediately if accidentally exposed

### API Keys Required
```
TMDB_API_KEY=your_tmdb_api_key
NEO4J_URI=your_neo4j_uri
NEO4J_USERNAME=your_username
NEO4J_PASSWORD=your_password
```

### Dependency Security
- Keep dependencies up-to-date
- Run `npm audit` for frontend
- Run `mvn dependency-check` for backend

Thank you for helping keep CineVerse secure! 🙏
