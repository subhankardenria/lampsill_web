import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Footer } from '@/components/Chrome';
import InstallPrompt from '@/components/InstallPrompt';
import { PriceProvider } from '@/components/Price';
import V2Home from '@/components/v2/V2Home';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountryWith } from '@/lib/geo';
import { PLAY_URL, APP_STORE_URL } from '@/lib/copy';
import '@/components/v2/v2.css';

/**
 * THE HOME PAGE (since 4 Nov 2026): the Framer Motion page, built at /v2 and
 * made home by the owner. The page before it is kept, whole, at /classic.
 *
 * Title, description and share card come from app/layout.tsx, so search and
 * link previews say what Lampsill does. Other pages link here by section
 * (/#how, /#story, /#privacy, /#what-this-isnt, /#price, /#get, /#faq): every
 * one of those ids exists on this page too.
 */
/* The home page is night whatever the phone's theme, so the browser's own
   bars are tinted night too; the layout's light-mode cream would frame a dark
   page in a pale bar. Other pages keep following the phone. */
export const viewport: Viewport = { themeColor: '#0A1014' };

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

/**
 * What search engines are told Lampsill is, in their own vocabulary
 * (schema.org): the site's name, who runs it, and the app with its Play link.
 * No price is given: while payments are paused nothing about money is said
 * anywhere (free-until-january-2027). Every line must stay true to the page.
 */
const SITE = 'https://www.lampsill.com';
// Both stores since 9 Nov 2026 (App Store follows APP_STORE_URL).
const STORES = APP_STORE_URL ? [PLAY_URL, APP_STORE_URL] : [PLAY_URL];

const LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Lampsill',
      inLanguage: 'en-GB',
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'Lampsill',
      url: SITE,
      logo: `${SITE}/icon.svg`,
      email: 'hello@lampsill.com',
      sameAs: STORES,
    },
    {
      '@type': 'MobileApplication',
      name: 'Lampsill',
      operatingSystem: APP_STORE_URL ? 'Android, iOS' : 'Android',
      applicationCategory: 'LifestyleApplication',
      description:
        'For anyone you love who lives alone. If their phone isn’t used for a while, Lampsill asks them “Are you OK?” first. If they don’t answer, you’re told, with one tap to call them or someone nearby.',
      url: SITE,
      installUrl: STORES,
      publisher: { '@id': `${SITE}/#org` },
    },
  ],
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const seen = await visitorCountryWith((await searchParams).country, await headers());
  const market = marketForCountry(seen.country);

  return (
    <PriceProvider initialMarket={market.key} country={seen.country} guessed={!seen.certain}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LD) }}
      />
      <V2Home>
        <Footer />
        {/* The QR card on a laptop, the slim bar on a phone: the classic
            page's, approved 2 Nov 2026. Inside V2Home so it takes the home
            page's night colours: outside it, a phone in light mode drew it
            cream with the name in white, nearly invisible (9 Nov 2026). */}
        <InstallPrompt />
      </V2Home>
    </PriceProvider>
  );
}
