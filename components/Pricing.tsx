'use client';

import { useState } from 'react';
import { FAMILY } from '@/lib/copy';
import { MarketPicker, Price, TaxNote, usePrice } from './Price';

/* Every line checked against the worked example, not written to sound good.
   Earlier versions of this list said "12 hours to a week" (the solo app offers
   12/24/48), "sleep time" for the solo version (it only exists in this family
   version), and "no third party in the loop" (payment goes through a provider).
   "Away time and sleep time" is back because in THIS version it is real. */
const INCLUDED = [
  'Set up in minutes on your phone. Two taps for them.',
  'Their phone rings first. If they answer, nobody else is bothered.',
  `Your phone makes a sound, and keeps going for up to ${FAMILY.soundMinutes} minutes until you open it`,
  'Call them, or text someone nearby, in one tap',
  'Away time and sleep time, so holidays and lie-ins don’t set it off',
  'No ads. Their data is never sold.',
];

/**
 * One product, two ways to pay, priced for the visitor's country.
 *
 * YEARLY IS PRESELECTED. Dodo Payments charges a fixed ~40¢ on every payment:
 * about a fifth of a £1.99 monthly charge, and under a tenth of a yearly one.
 * Monthly stays one tap away — nobody is steered into a commitment they didn't
 * choose, and the "save" line states the real difference, not an invented one.
 *
 * The button talks to /api/checkout, which refuses cleanly with a 503 until
 * the Dodo keys are configured. That refusal is surfaced as "not open yet" with
 * a working mailto, and NOT as a spinner that never resolves or a fake success
 * — a payment control that appears to work and doesn't is the single worst
 * thing this page could do.
 */
/** Flip to "1" in the host's settings on launch day, once Dodo is set up. Until
 *  then the button leads to the early-access list, not a checkout. */
const CHECKOUT_OPEN = process.env.NEXT_PUBLIC_CHECKOUT_OPEN === '1';

export default function Pricing() {
  const [state, setState] = useState<'idle' | 'loading' | 'closed' | 'error'>('idle');
  const { market, plan, setPlan, country } = usePrice();

  async function subscribe() {
    setState('loading');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pre-fills the billing country at checkout. The price itself is decided
        // by Dodo from the billing country the customer confirms there.
        body: JSON.stringify({
          plan,
          country: country && market.countries.includes(country) ? country : market.countries[0],
        }),
      });
      if (res.status === 503) {
        setState('closed');
        return;
      }
      if (!res.ok) {
        setState('error');
        return;
      }
      const data = (await res.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setState('error');
    } catch {
      setState('error');
    }
  }

  const periodWord = plan === 'year' ? 'year' : 'month';

  return (
    <section className="section pricing" id="price">
      <div className="wrap narrow">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow">One simple price</p>

          <div className="plan-switch" role="radiogroup" aria-label="How often to pay">
            <button type="button" role="radio" aria-checked={plan === 'month'} onClick={() => setPlan('month')}>
              Monthly
            </button>
            <button type="button" role="radio" aria-checked={plan === 'year'} onClick={() => setPlan('year')}>
              Yearly <span className="plan-save">{market.freeMonths} months free</span>
            </button>
          </div>

          <h2 key={`${market.key}-${plan}`} className="price-figure">
            <Price plan={plan} />
            <span className="per"> a {periodWord}</span>
          </h2>
          <p className="price-sub">
            {plan === 'year' ? (
              <>
                Instead of {market.monthTimes12} paid monthly. <TaxNote />
              </>
            ) : (
              <>
                Or <Price plan="year" /> a year. <TaxNote />
              </>
            )}
          </p>
          <p className="lede" style={{ margin: '1rem auto 0' }}>
            For one person you look out for, with everything included. No upgrades, no
            extras.
          </p>
        </div>

        <div className="price-card lit reveal">
          <ul className="incl">
            {INCLUDED.map((t) => (
              <li key={t}>
                <span className="incl-tick" aria-hidden="true">
                  ✓
                </span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <div className="price-cta">
            {CHECKOUT_OPEN ? (
              <button className="btn lamp" onClick={subscribe} disabled={state === 'loading'}>
                {state === 'loading' ? (
                  'One moment…'
                ) : (
                  <>
                    Get Lampsill — <Price plan={plan} />/{periodWord}
                  </>
                )}
              </button>
            ) : (
              <a className="btn lamp" href="#join">
                Take a free place <span aria-hidden="true">&darr;</span>
              </a>
            )}
            <a className="btn ghost" href="#how">
              See it work first
            </a>
          </div>

          {state === 'closed' && (
            <p className="price-note" role="status">
              Not open yet &mdash; we&rsquo;re still building the app.{' '}
              <a href="mailto:hello@lampsill.com?subject=Tell%20me%20when%20Lampsill%20is%20out">
                Tell me when it&rsquo;s ready
              </a>{' '}
              and you&rsquo;ll be the first to know.
            </p>
          )}
          {state === 'error' && (
            <p className="price-note" role="status">
              Something went wrong starting that. Try again, or email{' '}
              <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.
            </p>
          )}

          <p className="price-small">
            Cancel any time. Coming to iPhone and Android.
          </p>
          <p className="price-small">
            <MarketPicker />
          </p>
        </div>
      </div>
    </section>
  );
}
