import type { MetadataRoute } from 'next';

/** Everything is open to search except the API and the old home page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/'] },
    sitemap: 'https://www.lampsill.com/sitemap.xml',
    host: 'https://www.lampsill.com',
  };
}
