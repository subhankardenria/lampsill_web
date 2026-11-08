import type { Metadata } from 'next';
import { pageMeta } from '@/lib/meta';
import { headers } from 'next/headers';
import { Masthead, Footer, Reveals } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import { PlayBadge } from '@/components/PlayBadge';
import { redirect } from 'next/navigation';
import { APP_STORE_URL, FREE_UNTIL } from '@/lib/copy';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountry } from '@/lib/geo';

/**
 * WHERE AN iPHONE LANDS FROM A PRINTED QR CODE (app/get/route.ts), while the
 * iPhone app isn't out. Once APP_STORE_URL is set, /get sends iPhones to the
 * App Store and nothing links here any more.
 *
 * It says only what is true: Android now, iPhone on its way, no date. The
 * person they look out for may be on Android, so the Play badge stays, but
 * nothing here claims one person's app works without the other's.
 */
export const metadata: Metadata = {
  ...pageMeta({
    title: 'Lampsill on iPhone',
    description: 'Lampsill is on Android now and coming to iPhone. Ask to be told when it’s ready.',
    path: '/get/iphone',
  }),
  robots: { index: false, follow: true },
};

export default async function IphonePage() {
  // Out on the App Store: anyone holding an old link goes straight there.
  if (APP_STORE_URL) redirect(APP_STORE_URL);
  const seen = await visitorCountry(await headers());
  const market = marketForCountry(seen.country);

  return (
    <PriceProvider initialMarket={market.key} country={seen.country} guessed={!seen.certain}>
      <Masthead base="/" />
      <Reveals />
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <p className="eyebrow">iPhone</p>
          <h1>Lampsill is coming to iPhone.</h1>
          <p className="lede">
            It&rsquo;s on Android now. The iPhone version is on its way, free until {FREE_UNTIL} like
            the rest.
          </p>
          <p>
            <a
              className="btn lamp"
              href="mailto:hello@lampsill.com?subject=Tell%20me%20when%20Lampsill%20is%20on%20iPhone"
            >
              Tell me when it&rsquo;s ready
            </a>
          </p>
          <p>We&rsquo;ll send one email when it&rsquo;s out, and nothing else.</p>

          <h2>On Android?</h2>
          <PlayBadge height={60} />

          <p className="legal-back">
            <a className="btn ghost" href="/">
              See how Lampsill works &rarr;
            </a>
          </p>
        </div>
      </main>
      <Footer base="/" />
    </PriceProvider>
  );
}
