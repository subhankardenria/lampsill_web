import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Masthead, Footer } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import SetupDemo from '@/components/SetupDemo';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountryWith } from '@/lib/geo';

/**
 * /setup: the first-time setup, tapped through on the real screens (owner,
 * 2 Nov 2026). Made to be sent: a link in WhatsApp beside the videos in
 * dist/setup-demo/, for whoever is setting Lampsill up for Mum or Dad, or
 * for a son or daughter.
 */
export const metadata: Metadata = {
  title: 'Set it up — Lampsill',
  description: 'Setting Lampsill up for Mum or Dad, or for a son or daughter: two phones, about two minutes, step by step.',
  alternates: { canonical: '/setup' },
};

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const seen = await visitorCountryWith((await searchParams).country, await headers());
  const market = marketForCountry(seen.country);

  return (
    <PriceProvider initialMarket={market.key} country={seen.country} guessed={!seen.certain}>
      <Masthead base="/" />
      <main id="main" className="section setup">
        <div className="wrap">
          <SetupDemo>
            <p className="eyebrow">Setting it up</p>
            <h1>
              Two phones. <em>About two minutes.</em>
            </h1>
            <p className="lede">You start it on your phone. They type in a code and say yes. That&rsquo;s all.</p>
          </SetupDemo>
        </div>
      </main>
      <Footer base="/" />
    </PriceProvider>
  );
}
