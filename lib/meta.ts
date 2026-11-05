import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';

/**
 * Metadata for a page other than home: its own title, description and
 * address in the link preview, not the home page's.
 *
 * Why a helper: Next merges metadata one level deep, so a page that sets any
 * `openGraph` replaces the layout's whole block, image included. Every field
 * the layout gives (image, site name, locale) is repeated here so a shared
 * /setup or /terms link still shows the card.
 */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: 'website',
      siteName: 'Lampsill',
      locale: 'en_GB',
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
