'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { FALLBACK, MARKETS, marketByKey, type Market, type Plan } from '@/lib/pricing';

type Ctx = {
  market: Market;
  plan: Plan;
  /** the country the request came from, if the host said */
  country: string | null;
  setPlan: (p: Plan) => void;
  setMarket: (key: string) => void;
};

const PriceContext = createContext<Ctx>({
  market: FALLBACK,
  plan: 'year',
  country: null,
  setPlan: () => {},
  setMarket: () => {},
});

const STORE = 'lampsill.market';

/**
 * One price for the whole page, chosen on the server from the visitor's
 * country so the FIRST paint already shows it — no £ flashing into ₹.
 *
 * The visitor can still pick another row (a daughter in India paying from a UK
 * card wants the UK price). That choice is kept in localStorage and applied
 * after mount, which is the only moment it can be read without a hydration
 * mismatch.
 *
 * YEARLY IS THE DEFAULT PLAN, on purpose: the payment provider's fixed fee
 * per charge is ~15% of a monthly price and ~2% of a yearly one.
 */
export function PriceProvider({
  initialMarket,
  country,
  children,
}: {
  initialMarket: string;
  country: string | null;
  children: React.ReactNode;
}) {
  const [key, setKey] = useState(initialMarket);
  const [plan, setPlan] = useState<Plan>('year');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE);
      if (saved && marketByKey(saved)) setKey(saved);
    } catch {
      /* storage blocked: the detected price stands */
    }
  }, []);

  const setMarket = (k: string) => {
    if (!marketByKey(k)) return;
    setKey(k);
    try {
      localStorage.setItem(STORE, k);
    } catch {
      /* fine — it just won't be remembered */
    }
  };

  return (
    <PriceContext.Provider value={{ market: marketByKey(key) ?? FALLBACK, plan, country, setPlan, setMarket }}>
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

/** A small, native country picker: a real <select>, labelled, keyboard-able. */
export function MarketPicker({ id = 'market' }: { id?: string }) {
  const { market, setMarket } = usePrice();
  return (
    <span className="market-picker">
      <label htmlFor={id}>Prices for</label>
      <select id={id} value={market.key} onChange={(e) => setMarket(e.target.value)}>
        {MARKETS.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label} ({m.currency})
          </option>
        ))}
      </select>
    </span>
  );
}
