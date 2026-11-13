'use client';

import { useActionState } from 'react';
import { openLink, type FormState } from '../actions';
import { go, safely } from '../stale';

export function OpenLink({ token }: { token: string }) {
  const [state, open, opening] = useActionState<FormState, FormData>(async () => {
    const r = await safely(() => openLink(token), (message): FormState => ({ message }));
    return r.go ? go('/care') : r;
  }, {});
  const broken = !token || !!state.message;

  return (
    <>
      <h1 className="care-title">Your clients, <em>at a glance.</em></h1>
      {broken ? (
        <div className="care-card care-space">
          <p className="care-error care-flush" role="alert">
            {state.message ?? 'This link is missing a part. Open it again from the email.'}
          </p>
          <p className="care-quiet care-gap">
            You can still sign in with a code sent to your email: <a href="/care">sign in</a>.
          </p>
        </div>
      ) : (
        <form action={open} className="care-card care-space">
          <p className="care-quiet care-flush">Who&rsquo;s fine, and whose phone has gone quiet. This signs you in on this computer for 12 hours.</p>
          <button className="care-btn primary care-gap" type="submit" disabled={opening} autoFocus>{opening ? 'Opening…' : 'Open my care page'}</button>
        </form>
      )}
    </>
  );
}
