import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Footer } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import V2Home from '@/components/v2/V2Home';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountryWith } from '@/lib/geo';
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
export const metadata: Metadata = {
  alternates: { canonical: '/' },
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
      <V2Home>
        <Footer />
      </V2Home>
    </PriceProvider>
  );
}
