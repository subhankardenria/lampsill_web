import { countryFromHeaders, countryFromHost, isCountryCode } from './pricing';

/*
 * The visitor's country, worked out on the server.
 *
 * In production the host does it: Vercel, Cloudflare and CloudFront read the
 * country off the visitor's connection and put it in a header, so nothing
 * leaves our server and nobody else learns who visited.
 *
 * On a developer's machine there is no such header — the "visitor" is
 * localhost. There the one person who can be visiting is whoever runs the
 * site, so it asks where THIS machine's own connection is (their own address,
 * never a visitor's) and caches the answer for an hour. Production never calls
 * out: with no header it falls back to the browser's language, and the page
 * lets the device's time zone correct that.
 */

let own: { country: string | null; at: number } | null = null;
const HOUR = 60 * 60 * 1000;

async function ownCountry(): Promise<string | null> {
  if (own && Date.now() - own.at < HOUR) return own.country;
  let country: string | null = null;
  try {
    const res = await fetch('https://api.country.is/', { signal: AbortSignal.timeout(2500), cache: 'no-store' });
    const c = res.ok ? ((await res.json()) as { country?: unknown }).country : null;
    if (typeof c === 'string' && /^[A-Za-z]{2}$/.test(c)) country = c.toUpperCase();
  } catch {
    /* offline or slow: fall back to the guess */
  }
  own = { country, at: Date.now() };
  return country;
}

export async function visitorCountry(h: Headers): Promise<{ country: string | null; certain: boolean }> {
  const host = countryFromHost(h);
  if (host) return { country: host, certain: true };
  if (process.env.NODE_ENV !== 'production') {
    const mine = await ownCountry();
    if (mine) return { country: mine, certain: true };
  }
  return { country: countryFromHeaders(h), certain: false };
}

/**
 * The same, but `?country=GB` wins when it is a country code, so any market's
 * wording and prices can be checked from anywhere. Display only, never trusted.
 */
export async function visitorCountryWith(
  override: string | string[] | undefined,
  h: Headers,
): Promise<{ country: string | null; certain: boolean }> {
  if (isCountryCode(override)) return { country: override.toUpperCase(), certain: true };
  return visitorCountry(h);
}
