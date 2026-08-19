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
import { siteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  const origin = siteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/r', '/api'],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
