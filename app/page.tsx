import { Masthead, Footer, Reveals } from '@/components/Chrome';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import GapQuestion from '@/components/GapQuestion';
import Story from '@/components/Story';
import DataModel from '@/components/DataModel';
import WhatThisIsnt from '@/components/WhatThisIsnt';
import Pricing from '@/components/Pricing';
import Faq from '@/components/Faq';
import EarlyAccess from '@/components/EarlyAccess';
import { PersonaProvider } from '@/components/Persona';
import { PriceProvider } from '@/components/Price';
import { headers } from 'next/headers';
import { countryFromHeaders, isCountryCode, marketForCountry } from '@/lib/pricing';

/**
 * THE PAGE IS ABOUT THREE PEOPLE.
 *
 * Earlier versions sold the solo product — you set it up for yourself — and
 * the one idea visitors failed to take away was the relationship at the heart
 * of the paid one: someone lives alone, someone else sets it up and pays and is
 * notified, and a third person nearby is messaged. Every section now answers
 * "who, and what do they get", in this order:
 *
 *   hero           the relationship, in one headline
 *   question       when would you find out today, without it? — the visitor's
 *                  own gap, straight after the hero, pointing down at the fix
 *   how            three live phones, one per person: the explanation plays
 *                  itself, and the visitor taps "Text" as the one in the middle
 *   story          the reader's own story, following the tab: Anna and Maya on
 *                  a street, Adam in a student building, or "you" and Lena
 *   privacy        you see one word, not her day
 *   isn't          the honest edge — including "nothing is automatic after you"
 *   price
 *   faq
 *
 * "Myself" — for a reader who lives alone — is the third tab on the phones,
 * not a separate section: it used to sit after the price, where the
 * people who needed it had to read the whole page to find out they were welcome.
 *
 * WHY THERE IS NO "WHY IT WON'T WAKE YOU" SECTION. It said three things: twelve
 * quiet hours with six in waking hours, their phone rings first, and you decide
 * what happens next. The phones show the second and third, the FAQ answers the
 * first ("Won't late nights set it off?"), and on a phone it cost a screen and
 * a half to say them a third time. The page was 20 screens long on a phone
 * with the price on screen 17.
 *
 * The facts behind every section are in lib/copy.ts under FAMILY, taken from
 * `Lampsill — Worked Example.md`.
 *
 * THE PRICE IS PER COUNTRY (lib/pricing.ts), so this page reads the request's
 * country header and renders dynamically — the first paint carries the right
 * currency. `?country=IN` overrides it, for checking a market from anywhere.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const override = (await searchParams).country;
  const country = isCountryCode(override) ? override.toUpperCase() : countryFromHeaders(await headers());
  const market = marketForCountry(country);

  return (
    <PriceProvider initialMarket={market.key} country={country}>
      <Masthead />
      <Reveals />
      <main id="main">
        <Hero />
        {/* one choice drives all three: pick a tab on the phones and the
            dial above and the story below follow */}
        <PersonaProvider>
          <GapQuestion />
          <HowItWorks />
          <Story />
        </PersonaProvider>
        <DataModel />
        <WhatThisIsnt />
        <Pricing />
        <EarlyAccess />
        <Faq />
      </main>
      <Footer />
    </PriceProvider>
  );
}
