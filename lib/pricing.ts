/**
 * PRICES BY COUNTRY — one table, read by the page AND by the checkout route.
 *
 * Every price is set on purpose for its market, never FX-converted from the
 * pound (spec §3.3). The page shows the visitor the row for their country; the
 * checkout sends them to Dodo Payments, whose Localized Pricing rules must hold
 * the SAME amounts. If a number changes here, change the rule in the Dodo
 * dashboard in the same sitting — the page promising £1.99 while checkout
 * charges £2.37 is a misleading-price complaint, not a rounding error.
 *
 * `display` strings are written out rather than built with Intl.NumberFormat:
 * formatting differs between the server's and the browser's ICU data (the
 * rupee, the rand and the peso all have variants), and a price that changes
 * during hydration is worse than one that was typed by hand.
 *
 * `taxIncluded` decides the small print. The UK, EU, Australia, NZ, the Gulf,
 * Singapore, India and Brazil show consumer prices with tax included; the US
 * and Canada show them before tax. ⚠️ Dodo documents localized amounts as
 * PRE-TAX. Before launch, check a real checkout in each tax-included market: if
 * Dodo adds VAT on top of £1.99, either the product is set tax-inclusive in
 * Dodo or these amounts must be entered net. See README, "Payments".
 */

export type Plan = 'month' | 'year';

export type Market = {
  key: string;
  /** shown in the country picker */
  label: string;
  currency: string;
  month: string;
  year: string;
  /** what twelve monthly payments would cost, for the "save" line */
  monthTimes12: string;
  /** 12 − year ÷ month, rounded: what the yearly plan's badge may honestly say */
  freeMonths: number;
  taxIncluded: boolean;
  /** ISO 3166-1 alpha-2 codes that get this row */
  countries: string[];
};

export const MARKETS: Market[] = [
  { key: 'gb', label: 'United Kingdom', currency: 'GBP', month: '£1.99', year: '£19.99', monthTimes12: '£23.88', freeMonths: 2, taxIncluded: true, countries: ['GB', 'IM', 'JE', 'GG'] },
  { key: 'us', label: 'United States', currency: 'USD', month: '$2.99', year: '$29.99', monthTimes12: '$35.88', freeMonths: 2, taxIncluded: false, countries: ['US', 'PR'] },
  {
    key: 'eu', label: 'Western Europe', currency: 'EUR', month: '€2.49', year: '€24.99', monthTimes12: '€29.88', freeMonths: 2, taxIncluded: true,
    countries: ['AT', 'BE', 'DE', 'FI', 'FR', 'IE', 'IT', 'LU', 'MT', 'NL', 'ES', 'CY', 'CH', 'LI', 'MC', 'AD', 'IS'],
  },
  {
    key: 'eu2', label: 'Central & southern Europe', currency: 'EUR', month: '€1.49', year: '€14.99', monthTimes12: '€17.88', freeMonths: 2, taxIncluded: true,
    countries: ['PT', 'GR', 'PL', 'CZ', 'SK', 'SI', 'HR', 'HU', 'RO', 'BG', 'EE', 'LV', 'LT'],
  },
  { key: 'se', label: 'Sweden', currency: 'SEK', month: '29 kr', year: '290 kr', monthTimes12: '348 kr', freeMonths: 2, taxIncluded: true, countries: ['SE'] },
  { key: 'no', label: 'Norway', currency: 'NOK', month: '29 kr', year: '290 kr', monthTimes12: '348 kr', freeMonths: 2, taxIncluded: true, countries: ['NO'] },
  // DKK is worth about 1.5× SEK/NOK: 19 kr, not 29, is the same price
  { key: 'dk', label: 'Denmark', currency: 'DKK', month: '19 kr', year: '190 kr', monthTimes12: '228 kr', freeMonths: 2, taxIncluded: true, countries: ['DK'] },
  { key: 'ca', label: 'Canada', currency: 'CAD', month: 'C$3.99', year: 'C$39.99', monthTimes12: 'C$47.88', freeMonths: 2, taxIncluded: false, countries: ['CA'] },
  { key: 'au', label: 'Australia', currency: 'AUD', month: 'A$3.99', year: 'A$39.99', monthTimes12: 'A$47.88', freeMonths: 2, taxIncluded: true, countries: ['AU'] },
  { key: 'nz', label: 'New Zealand', currency: 'NZD', month: 'NZ$3.99', year: 'NZ$39.99', monthTimes12: 'NZ$47.88', freeMonths: 2, taxIncluded: true, countries: ['NZ'] },
  { key: 'sg', label: 'Singapore', currency: 'SGD', month: 'S$3.49', year: 'S$34.99', monthTimes12: 'S$41.88', freeMonths: 2, taxIncluded: true, countries: ['SG'] },
  { key: 'ae', label: 'United Arab Emirates', currency: 'AED', month: 'AED 9.99', year: 'AED 99', monthTimes12: 'AED 119.88', freeMonths: 2, taxIncluded: true, countries: ['AE'] },
  { key: 'sa', label: 'Saudi Arabia', currency: 'SAR', month: 'SAR 9.99', year: 'SAR 99', monthTimes12: 'SAR 119.88', freeMonths: 2, taxIncluded: true, countries: ['SA'] },
  { key: 'mx', label: 'Mexico', currency: 'MXN', month: 'MX$39', year: 'MX$390', monthTimes12: 'MX$468', freeMonths: 2, taxIncluded: true, countries: ['MX'] },
  { key: 'br', label: 'Brazil', currency: 'BRL', month: 'R$9,90', year: 'R$99', monthTimes12: 'R$118,80', freeMonths: 2, taxIncluded: true, countries: ['BR'] },
  { key: 'za', label: 'South Africa', currency: 'ZAR', month: 'R29.99', year: 'R299', monthTimes12: 'R359.88', freeMonths: 2, taxIncluded: true, countries: ['ZA'] },
  { key: 'in', label: 'India', currency: 'INR', month: '₹99', year: '₹799', monthTimes12: '₹1,188', freeMonths: 4, taxIncluded: true, countries: ['IN'] },
  { key: 'ph', label: 'Philippines', currency: 'PHP', month: '₱79', year: '₱599', monthTimes12: '₱948', freeMonths: 4, taxIncluded: true, countries: ['PH'] },
  { key: 'id', label: 'Indonesia', currency: 'IDR', month: 'Rp19.000', year: 'Rp149.000', monthTimes12: 'Rp228.000', freeMonths: 4, taxIncluded: true, countries: ['ID'] },
];

/** Anywhere not listed pays the US dollar price, and can pick another row. */
export const FALLBACK = MARKETS.find((m) => m.key === 'us')!;

export const marketByKey = (key: string | null | undefined): Market | undefined =>
  MARKETS.find((m) => m.key === key);

export const marketForCountry = (country: string | null | undefined): Market => {
  const c = country?.toUpperCase();
  return (c && MARKETS.find((m) => m.countries.includes(c))) || FALLBACK;
};

const ISO2 = /^[A-Za-z]{2}$/;

/**
 * The visitor's country, from whatever the host puts on the request.
 *
 * Vercel, Cloudflare and CloudFront each add a country header; whichever runs
 * the site, one of them is there. Locally none is, so the region in
 * Accept-Language ("en-IN", "en-GB") stands in — good enough to see your own
 * price in development, and never trusted for anything but display.
 */
export function countryFromHeaders(h: Headers): string | null {
  for (const name of ['x-vercel-ip-country', 'cf-ipcountry', 'cloudfront-viewer-country', 'x-country-code']) {
    const v = h.get(name);
    // Cloudflare sends XX for unknown and T1 for Tor
    if (v && ISO2.test(v) && v.toUpperCase() !== 'XX') return v.toUpperCase();
  }
  const lang = h.get('accept-language')?.match(/^[a-z]{2,3}-([A-Za-z]{2})\b/);
  return lang ? lang[1].toUpperCase() : null;
}

export const isCountryCode = (v: unknown): v is string => typeof v === 'string' && ISO2.test(v);
