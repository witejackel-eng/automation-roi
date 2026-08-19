/**
 * Single source of truth for the site's base URL.
 *
 * - Dev: falls back to http://localhost:3000
 * - Production: falls back to http://localhost:3000 if NEXT_PUBLIC_SITE_URL
 *   is not set, with a console warning (the deploy still succeeds).
 *
 * FOUNDER ACTION: set NEXT_PUBLIC_SITE_URL in Vercel env vars.
 */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[site-url] NEXT_PUBLIC_SITE_URL is not set in production. ' +
        'OG tags, sitemap, and share links will use a fallback URL. ' +
        'Set NEXT_PUBLIC_SITE_URL in Vercel env vars to fix this.'
      );
    }
    return 'http://localhost:3000';
  }
  return raw.replace(/\/+$/, '');
}
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}
