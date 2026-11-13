'use client';

import { useActionState } from 'react';
import { differentEmail, sendCode, signIn, type FormState } from './actions';
import { go, safely } from './stale';

const failed = (message: string): FormState => ({ message });
/** Signed in: load /care afresh, so the page is always the newest site. */
const onward = (r: FormState) => (r.go ? go('/care') : r);

/** Email, then the emailed code. The pending email is a cookie, so a reload keeps the step. */
export function SignIn({ email }: { email: string | null }) {
  const [sent, send, sending] = useActionState<FormState, FormData>((s, f) => safely(() => sendCode(s, f), failed), {});
  const [tried, enter, entering] = useActionState<FormState, FormData>(
    async (s, f) => onward(await safely(() => signIn(s, f), failed)),
    {},
  );
  const [other, switchEmail, switching] = useActionState<FormState>(async () => onward(await safely(differentEmail, failed)), {});

  return (
    <>
      <h1 className="care-title">Your clients, <em>at a glance.</em></h1>
      <p className="care-quiet">Who&rsquo;s fine, and whose phone has gone quiet. Sign in with your work email.</p>

      <div className="care-card care-space">
        {sent.said && <p className="care-said" role="status">{sent.said}</p>}

        {email ? (
          <>
            <form action={enter}>
              <label className="care-label" htmlFor="code">Code from your email</label>
              <input className="care-input" id="code" name="code" inputMode="numeric" autoComplete="one-time-code" autoFocus required maxLength={20} />
              {(tried.message || other.message) && <p className="care-error" role="alert">{tried.message || other.message}</p>}
              <button className="care-btn primary care-gap" type="submit" disabled={entering}>{entering ? 'Signing in…' : 'Sign in'}</button>
            </form>
            <div className="care-actions care-gap">
              <form action={send}>
                <input type="hidden" name="email" value={email} />
                <button className="care-link" type="submit" disabled={sending}>Send a new code</button>
              </form>
              <form action={switchEmail}>
                <button className="care-link" type="submit" disabled={switching}>Use a different email</button>
              </form>
            </div>
          </>
        ) : (
          <form action={send}>
            <label className="care-label" htmlFor="email">Work email</label>
            <input className="care-input" id="email" name="email" type="email" autoComplete="email" autoFocus required maxLength={190} />
            {sent.message && <p className="care-error" role="alert">{sent.message}</p>}
            <button className="care-btn primary care-gap" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send me a code'}</button>
          </form>
        )}
      </div>

      <p className="care-quiet care-small care-gap">Not set up yet? Write to <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.</p>
    </>
  );
}
