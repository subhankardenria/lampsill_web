import { NextResponse } from 'next/server';
import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { createHash } from 'node:crypto';
import { EARLY_ACCESS } from '@/lib/copy';
import { countryFromHeaders, isCountryCode } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * EARLY-ACCESS SIGN-UPS, stored straight into a free Neon Postgres database.
 *
 * This is a demand test, not the product: before hosting the real application,
 * find out whether people who have read the page will leave their email for
 * two free months. So it lives entirely inside this site — no lampsill_api, no
 * email service — and needs one environment variable:
 *
 * THE FIRST 100 PLACES ARE REAL. `spot` is this row's position in the table
 * and `free_months` is 2 only while places remain — both decided here, both
 * written down, so "you're number 37" is a fact about the database and not a
 * line of marketing. GET returns how many are left, for the counter on the
 * form. See EARLY_ACCESS in lib/copy.ts.
 *
 *   DATABASE_URL   postgres://…neon.tech/neondb?sslmode=require
 *
 * Without it the route returns 503 and the form says sign-ups aren't open,
 * rather than pretending to have saved someone's details.
 *
 * The table creates itself on first use (see `ensureTable`), so there is no
 * migration step. Read the sign-ups in the Neon console's Tables view or SQL
 * editor — README, "Early-access sign-ups".
 *
 * WHAT IT STORES, AND WHY EACH ONE. Email (to send the free months), optional
 * first name, who they look out for and what phone that person has (the two
 * questions the pilot most needs answered — see "Is this worth doing"), whether
 * they'd help test, the country, the consent wording they agreed to, and a
 * salted hash of the IP address used only to stop one address flooding the
 * table, and wiped after a day (`forgetOldIps`). Never the raw IP.
 *
 * ⚠️ EVERYTHING ABOVE IS ALSO PROMISED ON /privacy (app/privacy/page.tsx). Add a
 * column, keep something longer, or send it somewhere new, and that page is
 * wrong until it is updated too.
 */

const LOOKING_AFTER = ['parent', 'child', 'self'] as const;
const PHONES = ['iphone', 'android', 'unsure'] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PER_IP_PER_HOUR = 5;

let tableReady: Promise<unknown> | null = null;

function ensureTable(sql: NeonQueryFunction<false, false>) {
  // Once per server instance. IF NOT EXISTS makes a race between two cold
  // starts harmless.
  tableReady ??= sql`
    CREATE TABLE IF NOT EXISTS early_access (
      id              bigserial PRIMARY KEY,
      email           text NOT NULL UNIQUE,
      name            text,
      looking_after   text CHECK (looking_after IN ('parent', 'child', 'self')),
      their_phone     text CHECK (their_phone IN ('iphone', 'android', 'unsure')),
      wants_to_test   boolean NOT NULL DEFAULT false,
      country         char(2),
      spot            integer,
      free_months     smallint NOT NULL,
      consent_version text NOT NULL,
      ip_hash         text,
      created_at      timestamptz NOT NULL DEFAULT now(),
      updated_at      timestamptz NOT NULL DEFAULT now()
    )`
    // `spot` arrived after the first sign-ups could have been taken, and
    // CREATE TABLE IF NOT EXISTS won't add a column to a table that already
    // exists. Anyone already in the table keeps their two free months and
    // simply has no number.
    .then(() => sql`ALTER TABLE early_access ADD COLUMN IF NOT EXISTS spot integer`)
    .catch((err) => {
      tableReady = null; // let the next request try again
      throw err;
    });
  return tableReady;
}

/**
 * THE IP HASH IS KEPT FOR A DAY, and /privacy says so. It is only ever compared
 * against the last hour of sign-ups (the flood check below), so there is no
 * reason for it to outlive that — and a privacy notice that says "a day" has
 * to be true by construction, not by someone remembering to run a query.
 * Runs on every sign-up and every counter fetch; either is frequent enough.
 */
function forgetOldIps(sql: NeonQueryFunction<false, false>) {
  return sql`
    UPDATE early_access SET ip_hash = NULL
    WHERE ip_hash IS NOT NULL AND updated_at < now() - interval '1 day'`;
}

/** How many of the free places are still going. */
async function placesLeft(sql: NeonQueryFunction<false, false>) {
  const rows = (await sql`SELECT count(*)::int AS n FROM early_access`) as { n: number }[];
  const taken = rows[0]?.n ?? 0;
  return { taken, left: Math.max(0, EARLY_ACCESS.freeSpots - taken) };
}

/**
 * The counter on the form: how many free places are left.
 *
 * ALWAYS 200, even with no database and even when the query fails —
 * `spotsLeft` is simply null and the form then shows no number at all. A
 * decorative count that can't be fetched is not a server error, and answering
 * 503 filled the dev log and anyone's console with red lines for a page that
 * was working perfectly. The reasons are logged on the server instead.
 *
 * POST still answers 503 without a database, because there it matters: someone
 * has typed their email in and has to be told it wasn't saved.
 */
export async function GET() {
  const url = process.env.DATABASE_URL;
  const none = { spotsLeft: null, freeSpots: EARLY_ACCESS.freeSpots, freeMonths: EARLY_ACCESS.freeMonths };
  if (!url) {
    // Expected until Neon is set up — see README, "Early-access sign-ups".
    return NextResponse.json(none, { headers: { 'Cache-Control': 'no-store' } });
  }
  try {
    const sql = neon(url);
    await ensureTable(sql);
    const [{ left }] = await Promise.all([placesLeft(sql), forgetOldIps(sql)]);
    return NextResponse.json(
      { ...none, spotsLeft: left },
      // Up to half a minute stale is fine for a counter, and it keeps a busy
      // day on the front page from waking the free database once per visitor.
      // What actually decides a free place is counted again inside POST.
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=60' } },
    );
  } catch (err) {
    console.error('free-places count failed', err);
    return NextResponse.json(none, { headers: { 'Cache-Control': 'no-store' } });
  }
}

const pick = <T extends string>(v: unknown, allowed: readonly T[]): T | null =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Please fill in the form and try again.' }, { status: 400 });
  }

  // A field no person can see. Bots fill it; the reply is identical so they
  // learn nothing, and nothing is stored.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({
      ok: true,
      freeMonths: EARLY_ACCESS.freeMonths,
      freeSpots: EARLY_ACCESS.freeSpots,
    });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'That email address doesn’t look right.' }, { status: 422 });
  }
  if (body.agree !== true) {
    return NextResponse.json({ error: 'Please tick the box so we can email you.' }, { status: 422 });
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) || null : null;
  const lookingAfter = pick(body.lookingAfter, LOOKING_AFTER);
  const theirPhone = pick(body.theirPhone, PHONES);
  const wantsToTest = body.wantsToTest === true;
  const country = isCountryCode(body.country) ? body.country.toUpperCase() : countryFromHeaders(req.headers);

  const url = process.env.DATABASE_URL;
  if (!url) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const ip = (req.headers.get('x-forwarded-for')?.split(',')[0] ?? req.headers.get('x-real-ip') ?? '').trim();
  const ipHash = ip
    ? createHash('sha256').update(`${process.env.JOIN_SALT ?? 'lampsill'}:${ip}`).digest('hex')
    : null;

  try {
    const sql = neon(url);
    await ensureTable(sql);

    if (ipHash) {
      const rows = (await sql`
        SELECT count(*)::int AS n FROM early_access
        WHERE ip_hash = ${ipHash} AND updated_at > now() - interval '1 hour'`) as { n: number }[];
      if ((rows[0]?.n ?? 0) >= PER_IP_PER_HOUR) {
        return NextResponse.json({ error: 'Too many sign-ups from here. Please try again later.' }, { status: 429 });
      }
    }

    // THIS PERSON'S PLACE. Two sign-ups landing in the same instant can read
    // the same count and share a number — which would hand out one extra free
    // place, not one fewer. At this size that is the right way round to be
    // wrong, and a lock across a serverless pool is not worth it for a
    // landing page.
    const { taken } = await placesLeft(sql);
    const spot = taken + 1;
    const freeMonths = taken < EARLY_ACCESS.freeSpots ? EARLY_ACCESS.freeMonths : 0;

    // SIGNING UP TWICE IS FINE. The same email updates its answers and keeps its
    // original date, place and free months — so nobody loses their number by
    // filling the form in again, and nobody moves up the queue by doing it
    // either. The reply is the same shape whichever happened, so the form never
    // reveals whether an address is already on the list.
    const rows = (await sql`
      INSERT INTO early_access
        (email, name, looking_after, their_phone, wants_to_test, country, spot, free_months, consent_version, ip_hash)
      VALUES
        (${email}, ${name}, ${lookingAfter}, ${theirPhone}, ${wantsToTest}, ${country},
         ${spot}, ${freeMonths}, ${EARLY_ACCESS.consentVersion}, ${ipHash})
      ON CONFLICT (email) DO UPDATE SET
        name          = COALESCE(EXCLUDED.name, early_access.name),
        looking_after = COALESCE(EXCLUDED.looking_after, early_access.looking_after),
        their_phone   = COALESCE(EXCLUDED.their_phone, early_access.their_phone),
        wants_to_test = early_access.wants_to_test OR EXCLUDED.wants_to_test,
        country       = COALESCE(EXCLUDED.country, early_access.country),
        consent_version = EXCLUDED.consent_version,
        ip_hash       = EXCLUDED.ip_hash,
        updated_at    = now()
      RETURNING spot, free_months`) as { spot: number | null; free_months: number }[];

    await forgetOldIps(sql);

    const mine = rows[0];
    return NextResponse.json({
      ok: true,
      spot: mine?.spot ?? spot,
      freeMonths: mine?.free_months ?? freeMonths,
      freeSpots: EARLY_ACCESS.freeSpots,
    });
  } catch (err) {
    // The driver's error can include the host; keep it in the server log.
    console.error('early access insert failed', err);
    return NextResponse.json({ error: 'Something went wrong saving that. Please try again.' }, { status: 502 });
  }
}
