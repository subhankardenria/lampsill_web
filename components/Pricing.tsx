'use client';

import { useState } from 'react';
import { ALWAYS_FREE, FREE_UNTIL, STANDARD, TRIAL_MONTHS } from '@/lib/copy';
import { MarketPicker, Price, TaxNote, usePrice } from './Price';

/* WHO PAYS, AND FOR WHAT (decided 6 Oct 2026). Whoever is TOLD pays: being
   told about someone else is Standard, one month free and then paid. One
   price per ACCOUNT, however many people it looks out for — the app has never
   limited that, and charging per person would cost most the customer who
   looks out for both parents. Lampsill for yourself is free, and the person
   being looked out for never pays. The rule and its reasons: `lib/copy.ts`.

   Every line checked against the worked example, not written to sound good.
   Earlier versions of this list said "12 hours to a week" (the solo app offers
   12/24/48), "sleep time" for the solo version (it only exists in this family
   version), and "no third party in the loop" (payment goes through a provider).
   "Away time and sleep time" came back, and has gone again (5 Oct 2026): the
   app has away time — a pause of up to seven days — and no sleep time at all. */
/* TWO LISTS, NOT ONE (6 Oct 2026). The card used to list everything the
   product does under one price, which was true while everything was paid. Now
   some of it is free for good, and a list that mixes the two would have a
   visitor paying for what they could have had for nothing — or not installing
   because they think none of it is free. */

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
  const { market, plan: chosen, setPlan, country } = usePrice();
  // Where there is no monthly plan there is nothing to switch between.
  const yearOnly = market.month === null;
  const plan = yearOnly ? 'year' : chosen;

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
          <p className="eyebrow">Free for now &middot; one simple price after</p>

          {!yearOnly && (
            <div className="plan-switch" role="radiogroup" aria-label="How often to pay">
              <button type="button" role="radio" aria-checked={plan === 'month'} onClick={() => setPlan('month')}>
                Monthly
              </button>
              <button type="button" role="radio" aria-checked={plan === 'year'} onClick={() => setPlan('year')}>
                Yearly <span className="plan-save">{market.freeMonths} months free</span>
              </button>
            </div>
          )}

          {/* FREE IS THE HEADLINE, because until then it is the price. What it
              costs afterwards is said straight under it, in the visitor's own
              currency: a free period that hides the price behind it is the
              start of a subscription nobody remembers agreeing to. */}
          <h2 className="price-figure">
            Free
            <span className="per"> until {FREE_UNTIL}</span>
          </h2>
          <p className="price-sub" key={`${market.key}-${plan}`}>
            Then <Price plan={plan} /> a {periodWord}
            {yearOnly ? (
              <>
                . One payment a year. <TaxNote />
              </>
            ) : plan === 'year' ? (
              <>
                , instead of {market.monthTimes12} paid monthly. <TaxNote />
              </>
            ) : (
              <>
                , or <Price plan="year" /> a year. <TaxNote />
              </>
            )}
          </p>
          <p className="lede" style={{ margin: '1rem auto 0' }}>
            Lampsill for yourself is free. Standard is for looking out for someone
            else: one price for everyone, on one account.
          </p>
        </div>

        <div className="price-card lit reveal">
          <div className="tiers">
            <div>
              <p className="tier-h">Always free</p>
              <ul className="incl">
                {ALWAYS_FREE.map((t) => (
                  <li key={t}>
                    <span className="incl-tick" aria-hidden="true">
                      ✓
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="tier-h">Standard</p>
              <ul className="incl">
                {STANDARD.map((t) => (
                  <li key={t}>
                    <span className="incl-tick" aria-hidden="true">
                      ✓
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* The month is everyone's, before January and after it, and it
              starts without a card: it cannot become a charge by itself. */}
          <p className="tier-trial">
            Every new account gets {TRIAL_MONTHS === 1 ? 'a month' : `${TRIAL_MONTHS} months`} of
            Standard free, no card needed &mdash; now, and after {FREE_UNTIL} too.
          </p>

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
            Nothing is charged before {FREE_UNTIL}, and only if you choose to carry on.
            Coming to iPhone and Android.
          </p>
          <p className="price-small">
            <MarketPicker />
          </p>
        </div>
      </div>
    </section>
  );
}
