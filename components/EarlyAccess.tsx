'use client';

import { useEffect, useState } from 'react';
import { EARLY_ACCESS } from '@/lib/copy';
import { Price, usePrice } from './Price';

type Who = 'parent' | 'child' | 'self';
type Phone = 'iphone' | 'android' | 'unsure';

const WHO: { v: Who; label: string }[] = [
  { v: 'parent', label: 'A parent' },
  { v: 'child', label: 'A son or daughter' },
  { v: 'self', label: 'Myself' },
];
const PHONES: { v: Phone; label: string }[] = [
  { v: 'iphone', label: 'iPhone' },
  { v: 'android', label: 'Android' },
  { v: 'unsure', label: 'Not sure' },
];

/**
 * EARLY ACCESS: the first hundred people get two free months.
 *
 * The real test of whether this is worth building. A visitor who fills this in
 * has read the page and wants it enough to hand over an address — a far
 * stronger signal than a click on a price.
 *
 * Only the email and the consent tick are required. The two chip questions are
 * optional but they are the useful ones: who people look out for decides which
 * tab leads the page, and iPhone vs Android decides whether the product can be
 * built at all (iOS can't see phone unlocks — see README).
 *
 * WHY A LIMIT AND NOT A DRAW. A limited number of places gives the same pull as
 * a prize draw — this might not still be here tomorrow — and one thing a draw
 * can never do: the moment somebody presses the button, the page can tell them
 * exactly where they stand. "You're number 37" is worth more than "we'll be in
 * touch if you win", and it doesn't need rules, a closing date or a way to pick
 * winners. The count is the real one from the database, never a number made up
 * to hurry anyone.
 *
 * THE OFFER IS STATED IN FULL, next to the button: nothing is charged now, no
 * card is asked for, and what it costs after the free months. An offer with
 * its catch hidden is how a good first impression becomes a complaint. The same
 * rule decides the "places gone" case — those people are told plainly, on the
 * spot, that theirs is at the normal price.
 */
export default function EarlyAccess() {
  const { country, market } = usePrice();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [who, setWho] = useState<Who | null>(null);
  const [phone, setPhone] = useState<Phone | null>(null);
  const [test, setTest] = useState(false);
  const [agree, setAgree] = useState(false);
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'closed' | 'error'>('idle');
  const [message, setMessage] = useState('');
  /** what the database said when this person signed up: their place, and
   *  whether it came with free months */
  const [got, setGot] = useState<{ spot: number | null; freeMonths: number }>({ spot: null, freeMonths: 0 });
  /** free places still going; null until the count arrives, and null forever
   *  if it can't — the form then simply doesn't mention a number */
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    fetch('/api/join')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { spotsLeft?: number } | null) => {
        if (live && typeof d?.spotsLeft === 'number') setLeft(d.spotsLeft);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState('error');
      setMessage('That email address doesn’t look right.');
      return;
    }
    if (!agree) {
      setState('error');
      setMessage('Please tick the box so we can email you.');
      return;
    }
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          lookingAfter: who,
          theirPhone: phone,
          wantsToTest: test,
          agree,
          country: country && market.countries.includes(country) ? country : market.countries[0],
          website: trap,
        }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { spot?: number; freeMonths?: number };
        setGot({
          spot: typeof data.spot === 'number' ? data.spot : null,
          freeMonths: typeof data.freeMonths === 'number' ? data.freeMonths : EARLY_ACCESS.freeMonths,
        });
        setState('done');
        return;
      }
      if (res.status === 503) {
        setState('closed');
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setState('error');
      setMessage(data.error ?? 'Something went wrong. Please try again.');
    } catch {
      setState('error');
      setMessage('Couldn’t reach us just now. Please check your connection and try again.');
    }
  }

  const months = EARLY_ACCESS.freeMonths;
  const spots = EARLY_ACCESS.freeSpots;
  const gone = left === 0;
  const won = got.freeMonths > 0;

  return (
    <section className="section join" id="join">
      <div className="wrap narrow">
        <div className="reveal join-head">
          <p className="eyebrow">Early access</p>
          <h2>
            The first {spots} get {months} months free.
          </h2>
          <p className="lede">
            Lampsill isn&rsquo;t open yet. Leave your email and we&rsquo;ll tell you the day it
            is. The first {spots} people on the list start with {months} months free &mdash;
            the form says straight away whether you&rsquo;re one of them.
          </p>
        </div>

        <div className="join-card lit reveal">
          {state === 'done' ? (
            <div className="join-done" role="status">
              <div className="join-lamp" aria-hidden="true" />
              {won ? (
                <>
                  <h3>
                    You&rsquo;re in{got.spot ? <> &mdash; number {got.spot}</> : null}.
                  </h3>
                  <p>
                    Your first {months} months are free. We&rsquo;ll email <strong>{email}</strong> the
                    day Lampsill opens{test ? ', and before that about helping us test it' : ''}.
                  </p>
                </>
              ) : (
                <>
                  <h3>You&rsquo;re on the list{got.spot ? <> &mdash; number {got.spot}</> : null}.</h3>
                  <p>
                    The {spots} free places had gone, so yours starts at the usual{' '}
                    <Price plan="month" /> a month. We&rsquo;ll still email <strong>{email}</strong>{' '}
                    the day Lampsill opens{test ? ', and before that about helping us test it' : ''}.
                  </p>
                </>
              )}
              <p className="join-small">Changed your mind? Email hello@lampsill.com and we&rsquo;ll remove you.</p>
            </div>
          ) : (
            <form className="join-form" onSubmit={submit} noValidate>
              <div className="join-row">
                <label className="join-field">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="join-field">
                  <span>
                    First name <em>(optional)</em>
                  </span>
                  <input
                    type="text"
                    autoComplete="given-name"
                    maxLength={80}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              </div>

              <fieldset className="join-chips">
                <legend>
                  Who are you looking out for? <em>(optional)</em>
                </legend>
                {WHO.map((o) => (
                  <label key={o.v} className="chip">
                    <input type="radio" name="who" checked={who === o.v} onChange={() => setWho(o.v)} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="join-chips">
                <legend>
                  {who === 'self' ? 'What phone do you use?' : 'What phone do they use?'} <em>(optional)</em>
                </legend>
                {PHONES.map((o) => (
                  <label key={o.v} className="chip">
                    <input type="radio" name="phone" checked={phone === o.v} onChange={() => setPhone(o.v)} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </fieldset>

              <label className="join-check">
                <input type="checkbox" checked={test} onChange={(e) => setTest(e.target.checked)} />
                <span>I&rsquo;d happily help test Lampsill before it launches.</span>
              </label>
              <label className="join-check">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
                <span>{EARLY_ACCESS.consent}</span>
              </label>

              {/* for bots only: hidden from people and from screen readers */}
              <div className="join-trap" aria-hidden="true">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
              </div>

              {/* The real count, or nothing at all. A scarcity line with no
                  database behind it would be a made-up number. */}
              {left !== null && (
                <p className="join-spots" role="status">
                  {gone ? (
                    <>
                      The {spots} free places have gone &mdash; the list is still open.
                    </>
                  ) : (
                    <>
                      <strong>{left}</strong> of {spots} free places left
                    </>
                  )}
                </p>
              )}

              <button className="btn lamp join-submit" type="submit" disabled={state === 'sending'}>
                {state === 'sending' ? 'Saving…' : gone ? 'Join the list' : 'Take a free place'}
              </button>

              {state === 'error' && (
                <p className="price-note" role="alert">
                  {message}
                </p>
              )}
              {state === 'closed' && (
                <p className="price-note" role="status">
                  Sign-ups aren&rsquo;t open just yet. Email{' '}
                  <a href="mailto:hello@lampsill.com?subject=Early%20access">hello@lampsill.com</a> and
                  we&rsquo;ll add you by hand.
                </p>
              )}

              <p className="join-small">
                No card needed, and nothing is charged. Places go in the order people sign up
                &mdash; if yours is one of the first {spots}, your first {months} months are free
                when Lampsill opens. After that it&rsquo;s <Price plan="month" /> a month or{' '}
                <Price plan="year" /> a year, only if you choose to carry on.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
