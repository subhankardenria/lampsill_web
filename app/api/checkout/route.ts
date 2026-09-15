import { NextResponse } from 'next/server';
import { countryFromHeaders, isCountryCode, type Plan } from '@/lib/pricing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dodo Payments checkout, created server-side.
 *
 * Dodo is the merchant of record: it collects and pays VAT, GST and sales tax
 * in each country, which is why it replaced Stripe (see "Payments" in the
 * README). The price is NOT sent from here. Each product carries Localized
 * Pricing rules in the Dodo dashboard that match lib/pricing.ts, and Dodo picks
 * the rule from the billing country the customer confirms at checkout. This
 * route only says which plan, and pre-fills the country.
 *
 * IT REFUSES CLEANLY WHEN UNCONFIGURED. With no DODO_API_KEY or product ids this
 * returns 503 and the price section tells the reader subscriptions are not open
 * yet. That is deliberate and is the most important line in the file: a payment
 * button that appears to work and does not is worse than no button, and a
 * pretend success on a paid safety product is the kind of thing that ends up
 * in front of a regulator.
 *
 * Configure in the host's environment settings (never in the repo):
 *   DODO_API_KEY               from Dodo dashboard → Developer → API keys
 *   DODO_ENV                   "live" for real money; anything else uses test mode
 *   DODO_PRODUCT_MONTHLY       pdt_… the monthly subscription product
 *   DODO_PRODUCT_YEARLY        pdt_… the yearly subscription product
 *   NEXT_PUBLIC_SITE_URL       https://lampsill.com
 *
 * No SDK: one POST to their REST API keeps the dependency tree small and the
 * cold start short.
 *
 * NO WEBHOOK HERE, on purpose. A subscription has to switch the paying account
 * on and off, and accounts live in lampsill_api. Dodo's webhooks
 * (subscription.active, .renewed, .on_hold, .cancelled …) belong there, next to
 * the account they change — plan item 6.3.
 */
export async function POST(req: Request) {
  const key = process.env.DODO_API_KEY;
  const products: Record<Plan, string | undefined> = {
    month: process.env.DODO_PRODUCT_MONTHLY,
    year: process.env.DODO_PRODUCT_YEARLY,
  };

  let body: { plan?: unknown; country?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* an empty or malformed body just means the defaults below */
  }
  const plan: Plan = body.plan === 'month' ? 'month' : 'year';
  const product = products[plan];

  if (!key || !product) {
    return NextResponse.json(
      { error: 'not_configured', message: 'Subscriptions are not open yet.' },
      { status: 503 },
    );
  }

  // The visitor's pick first (they may be paying from another country's card),
  // then the request's own country. Only a pre-fill: the customer can change it.
  const country = isCountryCode(body.country)
    ? body.country.toUpperCase()
    : countryFromHeaders(req.headers);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lampsill.com';
  const base = process.env.DODO_ENV === 'live' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

  const payload = {
    product_cart: [{ product_id: product, quantity: 1 }],
    ...(country ? { billing_address: { country } } : {}),
    return_url: `${site}/?subscribed=1`,
    cancel_url: `${site}/#price`,
    feature_flags: { allow_discount_code: true },
    customization: { theme: 'dark' },
    metadata: { plan, source: 'website' },
  };

  try {
    const res = await fetch(`${base}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // The error body can carry account details; log it server-side and tell
      // the browser nothing beyond "it failed".
      console.error('dodo checkout failed', res.status, await res.text());
      return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
    }

    const session = (await res.json()) as { checkout_url?: string | null };
    if (!session.checkout_url) return NextResponse.json({ error: 'no_url' }, { status: 502 });

    return NextResponse.json({ url: session.checkout_url });
  } catch (err) {
    console.error('dodo checkout threw', err);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 502 });
  }
}
