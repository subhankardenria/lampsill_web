'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { FALLBACK, countryFromTimeZone, marketByKey, marketForCountry, type Market, type Plan } from '@/lib/pricing';

type Ctx = {
  market: Market;
  plan: Plan;
  /** the country the request came from, if the host said */
  country: string | null;
  setPlan: (p: Plan) => void;
};

const PriceContext = createContext<Ctx>({
  market: FALLBACK,
  plan: 'year',
  country: null,
  setPlan: () => {},
});

/**
 * One price for the whole page, chosen on the server from the visitor's
 * country so the FIRST paint already shows it — no £ flashing into ₹.
 *
 * There is no country picker, on purpose: a choice nobody needs is decision
 * fatigue. The payment page bills by the billing country the customer
 * confirms there, so the page only has to be right for where they are.
 *
 * YEARLY IS THE DEFAULT PLAN, on purpose: the payment provider's fixed fee
 * per charge is ~15% of a monthly price and ~2% of a yearly one.
 */
export function PriceProvider({
  initialMarket,
  country: initialCountry,
  guessed = false,
  children,
}: {
  initialMarket: string;
  country: string | null;
  /** true when the server only had the browser's language to go on */
  guessed?: boolean;
  children: React.ReactNode;
}) {
  const [key, setKey] = useState(initialMarket);
  const [country, setCountry] = useState(initialCountry);
  const [plan, setPlan] = useState<Plan>('year');

  useEffect(() => {
    // No host header (local, or a host that sends none): the browser's
    // language said "en-US" to most of the world, the time zone knows better.
    if (!guessed) return;
    try {
      const zoned = countryFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (zoned) {
        setCountry(zoned);
        setKey(marketForCountry(zoned).key);
      }
    } catch {
      /* no Intl: keep the guess */
    }
  }, [guessed]);

  return (
    <PriceContext.Provider value={{ market: marketByKey(key) ?? FALLBACK, plan, country, setPlan }}>
      {children}
    </PriceContext.Provider>
  );
}

export const usePrice = () => useContext(PriceContext);

/** "£1.99", "₹799" … the visitor's price for one plan. Where there is no
 *  monthly plan, asking for it gives the yearly price rather than nothing. */
export function Price({ plan }: { plan: Plan }) {
  const { market } = usePrice();
  return <>{plan === 'month' ? (market.month ?? market.year) : market.year}</>;
}

/** "£1.99 a month" — or "$9.99 a year" where yearly is the only plan. The one
 *  line to use wherever the page says what it costs in passing. */
export function PerPrice() {
  const { market } = usePrice();
  return <>{market.month ? `${market.month} a month` : `${market.year} a year`}</>;
}

/** "£1.99 a month or £19.99 a year" — or just the year, where that is all
 *  there is. */
export function PlanPrices() {
  const { market } = usePrice();
  return <>{market.month ? `${market.month} a month or ${market.year} a year` : `${market.year} a year`}</>;
}

/** "incl. VAT" style small print for the visitor's market */
export function TaxNote() {
  const { market } = usePrice();
  return <>{market.taxIncluded ? 'Tax included.' : 'Plus tax where it applies.'}</>;
}
