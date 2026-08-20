/**
 * Single source of truth for the site's base URL.
 *
 * - Dev: falls back to http://localhost:3000
 * - Production: uses NEXT_PUBLIC_SITE_URL if set, otherwise falls back to
 *   the known production deployment origin so sitemap/canonical/OG URLs
 *   are never contaminated with localhost.
 *
 * FOUNDER ACTION: set NEXT_PUBLIC_SITE_URL in Vercel env vars to the
 * canonical production domain once configured.
 */
const PRODUCTION_FALLBACK = 'https://automation-roi-delta.vercel.app';

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      // Deterministic production origin — never localhost.
      return PRODUCTION_FALLBACK;
    }
    return 'http://localhost:3000';
  }
  return raw.replace(/\/+$/, '');
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
