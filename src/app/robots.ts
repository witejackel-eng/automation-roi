/**
 * Robots (Master Spec §10) — explicit allow/deny.
 *
 * Public marketing routes: ALLOW.
 * Application routes (/app/*): NOINDEX.
 * Private client report routes (/r/*): NOINDEX.
 *
 * The sitemap URL is declared so crawlers discover it.
 */
import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viableo.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/r', '/api'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
