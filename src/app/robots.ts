/**
 * Robots (Master Spec §10) — explicit allow/deny.
 *
 * Public marketing routes: ALLOW.
 * All private/application routes: NOINDEX via robots.txt disallow.
 *
 * Crawlers can still fetch CSS/JS/images needed to render public pages
 * (assets are not listed in disallow).
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
        disallow: [
          '/start',
          '/admin',
          '/auth',
          '/billing',
          '/app',
          '/r',
          '/api',
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
