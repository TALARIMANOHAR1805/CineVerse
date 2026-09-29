/**
 * api.js — CineVerse Unified API Layer (Day 4)
 *
 * Strategy:
 *  1. Try Spring Boot backend first (if VITE_API_BASE_URL is set)
 *  2. On failure → fall back to calling TMDB + Jikan directly from the browser
 *
 * This ensures the website works even when the backend isn't deployed yet.
 *
 * Author: Koushik-31368
 */

// ── Config ────────────────────────────────────────────────────
const BACKEND   = (() => {
  const raw = import.meta.env.VITE_API_BASE_URL || '';
  if (!raw) return null;
  return raw.endsWith('/api') ? raw : `${raw}/api`;
})();

const TMDB_KEY  = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';
const JIKAN     = 'https://api.jikan.moe/v4';

// ── Genre map (TMDB ID → name) ─────────────────────────────
const GENRE_MAP = {
  28:'Action', 12:'Adventure', 16:'Animation', 35:'Comedy', 80:'Crime',
  99:'Documentary', 18:'Drama', 10751:'Family', 14:'Fantasy', 36:'History',
  27:'Horror', 10402:'Music', 9648:'Mystery', 10749:'Romance', 878:'Sci-Fi',
  53:'Thriller', 10752:'War', 37:'Western', 10770:'TV Movie',
};

// ── Helpers ──────────────────────────────────────────────────
function tmdbPosterUrl(path) {
  return path ? `${TMDB_IMG}${path}` : null;
}

function tmdbToMedia(m) {
  const posterPath = m.poster_path;
  const date       = m.release_date || m.first_air_date || '';
  const genreIds   = m.genre_ids || (m.genres?.map(g => g.id) ?? []);
  return {
    id:        String(m.id),
    title:     m.title || m.name || 'Unknown',
    year:      date.length >= 4 ? date.slice(0, 4) : '—',
    rating:    Math.round((m.vote_average || 0) * 10) / 10,
    posterUrl: tmdbPosterUrl(posterPath),
    type:      'movie',
    synopsis:  m.overview || '',
    genres:    genreIds.map(id => GENRE_MAP[id]).filter(Boolean),
  };
}

function jikanToMedia(a) {
  const jpg  = a.images?.jpg;
  const year = a.aired?.prop?.from?.year;
  const genres = (a.genres || []).map(g => g.name).filter(Boolean);
  return {
    id:        String(a.mal_id),
    title:     a.title_english || a.title || 'Unknown',
    year:      year ? String(year) : '—',
    rating:    Math.round((a.score || 0) * 10) / 10,
    posterUrl: jpg?.large_image_url || jpg?.image_url || null,
    type:      'anime',
    synopsis:  a.synopsis || '',
    genres,
  };
}

// ── Fetch wrapper with abort support ─────────────────────────
async function fetchJson(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Direct TMDB search ────────────────────────────────────────
async function tmdbSearch(query, signal) {
  if (!TMDB_KEY) return [];
  const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US`;
  const data = await fetchJson(url, signal);
  return (data.results || [])
    .filter(m => m.poster_path)
    .slice(0, 12)
    .map(tmdbToMedia);
}

// ── Direct Jikan search ────────────────────────────────────────
async function jikanSearch(query, signal) {
  const url = `${JIKAN}/anime?q=${encodeURIComponent(query)}&sfw=true&limit=12`;
  const data = await fetchJson(url, signal);
  return (data.data || [])
    .filter(a => a.images?.jpg)
    .slice(0, 12)
    .map(jikanToMedia);
}

// ── TMDB Trending ─────────────────────────────────────────────
export async function fetchTrendingMovies(signal) {
  if (TMDB_KEY) {
    try {
      const url = `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_KEY}&language=en-US`;
      const data = await fetchJson(url, signal);
      return (data.results || []).filter(m => m.poster_path).slice(0, 16).map(tmdbToMedia);
    } catch {}
  }
  if (BACKEND) {
    try {
      const data = await fetchJson(`${BACKEND}/trending/movies`, signal);
      return data?.data?.movies || data?.movies || [];
    } catch {}
  }
  return [];
}

// ── Jikan Top Anime ───────────────────────────────────────────
export async function fetchTopAnime(signal) {
  try {
    const url = `${JIKAN}/top/anime?limit=16&filter=airing`;
    const data = await fetchJson(url, signal);
    return (data.data || []).filter(a => a.images?.jpg).slice(0, 16).map(jikanToMedia);
  } catch { return []; }
}

// ── Unified Search ────────────────────────────────────────────
export async function search(query, type = 'all', signal) {
  const q = query?.trim();
  if (!q) return { movies: [], anime: [], total: 0 };

  // 1. Try backend first
  if (BACKEND) {
    try {
      const url = `${BACKEND}/search?q=${encodeURIComponent(q)}&type=${type}`;
      const json = await fetchJson(url, signal);
      const data = json?.data ?? json;
      // Normalise string IDs
      const movies = (data.movies || []).map(m => ({ ...m, id: String(m.id) }));
      const anime  = (data.anime  || []).map(a => ({ ...a, id: String(a.id) }));
      if (movies.length || anime.length) return { movies, anime, total: movies.length + anime.length };
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      console.warn('[api] Backend search failed, falling back to direct APIs:', e.message);
    }
  }

  // 2. Fall back to direct TMDB + Jikan
  const [movies, anime] = await Promise.all([
    (type === 'all' || type === 'movie') ? tmdbSearch(q, signal).catch(() => []) : Promise.resolve([]),
    (type === 'all' || type === 'anime') ? jikanSearch(q, signal).catch(() => []) : Promise.resolve([]),
  ]);

  return { movies, anime, total: movies.length + anime.length };
}

// ── Timeline (backend only) ───────────────────────────────────
export async function fetchTimeline(item, signal) {
  if (!BACKEND) return null;
  try {
    const ep = item.type === 'anime'
      ? `${BACKEND}/timeline/anime/${item.id}`
      : `${BACKEND}/timeline/movie/${item.id}`;
    const json = await fetchJson(ep, signal);
    return json?.data ?? json;
  } catch { return null; }
}

// ── Movie Details (TMDB direct) ───────────────────────────────
export async function fetchMovieDetails(tmdbId, signal) {
  if (!TMDB_KEY) return null;
  try {
    const url = `${TMDB_BASE}/movie/${tmdbId}?api_key=${TMDB_KEY}&append_to_response=credits`;
    const m   = await fetchJson(url, signal);
    return {
      ...tmdbToMedia(m),
      cast: (m.credits?.cast || []).slice(0, 10).map(c => c.name),
      budget:   m.budget,
      revenue:  m.revenue,
      runtime:  m.runtime,
      tagline:  m.tagline,
    };
  } catch { return null; }
}

// ── Anime Details (Jikan direct) ──────────────────────────────
export async function fetchAnimeDetails(malId, signal) {
  try {
    const url  = `${JIKAN}/anime/${malId}`;
    const json = await fetchJson(url, signal);
    const a    = json.data;
    if (!a) return null;
    return {
      ...jikanToMedia(a),
      episodes: a.episodes,
      status:   a.status,
      studios:  (a.studios || []).map(s => s.name),
      trailer:  a.trailer?.url || null,
    };
  } catch { return null; }
}

export const hasTmdbKey = () => Boolean(TMDB_KEY);
export const hasBackend  = () => Boolean(BACKEND);
