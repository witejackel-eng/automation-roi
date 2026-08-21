/**
 * Sitemap (Master Spec §9) — public indexable routes only.
 * Application routes (/app/*) and private report routes (/r/*) are NOINDEX
 * and therefore excluded from the sitemap.
 */
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteUrl();
  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/methodology', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/solutions/automation-agencies', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/solutions/n8n-agencies', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/solutions/make-agencies', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/solutions/zapier-agencies', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/resources/automation-roi', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/automation-payback', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/automation-cost', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/resources/automation-business-case', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/docs', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.4, changeFrequency: 'yearly' },
  ];

  return routes.map((r) => ({
    url: `${origin}${r.path}`,
    lastModified: r.path === '' ? now : lastMonth,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
