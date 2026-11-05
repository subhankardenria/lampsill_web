import type { MetadataRoute } from 'next';

/**
 * Every page meant to be found. /classic (the old home page, noindex) and
 * /api are left out on purpose. Add a page here when you add one to the site.
 */
const BASE = 'https://www.lampsill.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly' | 'yearly') => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  });
  return [
    page('', 1, 'weekly'),
    page('/setup', 0.8, 'monthly'),
    page('/privacy/app', 0.5, 'monthly'),
    page('/privacy', 0.4, 'monthly'),
    page('/terms', 0.4, 'monthly'),
    page('/delete-account', 0.3, 'yearly'),
  ];
}
