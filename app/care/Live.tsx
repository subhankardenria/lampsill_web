'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addClients, addStaff, newCode, type FormState, type StaffState } from './actions';
import type { Code } from '@/lib/care';

const hours = (h: number) => (h === 1 ? '1 hour' : `${h} hours`);

/** The codes, shown once: only a hash of each is kept on the server. */
function Codes({ codes, onDone }: { codes: Code[]; onDone: () => void }) {
  return (
    <div className="care-codes" data-busy>
      <p>Give each person their code. They open Lampsill, tap <strong>&ldquo;I have a code&rdquo;</strong> and type it in. Codes work for 48 hours.</p>
      {codes.map((c) => (
        <div className="care-row" key={c.name + c.code}>
          <div className="care-who care-name">{c.name}</div>
          <div className="care-code">{c.code.slice(0, 4)} {c.code.slice(4)}</div>
        </div>
      ))}
      <p className="care-quiet care-small care-gap">
        These are shown once. Write them down or print this page.{' '}
        <button className="care-link" type="button" onClick={onDone}>Done</button>
      </p>
    </div>
  );
}

export function AddClients({ windows, seats, counted }: { windows: number[]; seats: number | null; counted: number }) {
  const [state, add, adding] = useActionState<FormState, FormData>(addClients, {});
  const [shown, setShown] = useState<Code[] | null>(null);
  useEffect(() => { if (state.codes) setShown(state.codes); }, [state]);

  return (
    <>
      {shown && <Codes codes={shown} onDone={() => setShown(null)} />}
      <div className="care-card">
        <form action={add} key={state.tries ?? 0}>
          <label className="care-label" htmlFor="names">Names, one a line</label>
          <textarea className="care-input care-names" id="names" name="names" maxLength={4000} required defaultValue={state.names ?? ''} />
          {state.message && <p className="care-error" role="alert">{state.message}</p>}
          <label className="care-label care-gap" htmlFor="window_hours">Ask &ldquo;Are you OK?&rdquo; when their phone isn&rsquo;t used for</label>
          <select className="care-input" id="window_hours" name="window_hours" defaultValue="12">
            {[12, 24, 48, 1].filter((w) => windows.includes(w)).map((w) => (
              <option key={w} value={w}>{w === 1 ? '1 hour — to try it together' : hours(w)}</option>
            ))}
          </select>
          <div className="care-actions care-gap">
            <button className="care-btn primary" type="submit" disabled={adding}>Make codes</button>
            {seats !== null && <span className="care-quiet care-small">{counted} of {seats} clients</span>}
          </div>
        </form>
      </div>
    </>
  );
}

export function NewCode({ inviteId }: { inviteId: string }) {
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, start] = useTransition();

  return (
    <>
      <button
        className="care-btn"
        type="button"
        disabled={busy}
        onClick={() => start(async () => {
          const r = await newCode(inviteId);
          setMessage(r.message ?? null);
          setCodes(r.codes ?? null);
        })}
      >
        New code
      </button>
      {message && <p className="care-error" role="alert">{message}</p>}
      {codes && <div className="care-wide"><Codes codes={codes} onDone={() => setCodes(null)} /></div>}
    </>
  );
}

/** Colleagues' emails, one a line. Each is sent a link to this page. */
export function AddStaff() {
  const [state, add, adding] = useActionState<StaffState, FormData>(addStaff, {});

  return (
    <form action={add} key={state.tries ?? 0} className="care-gap">
      <label className="care-label" htmlFor="staff-emails">Add a colleague</label>
      <p className="care-small care-quiet care-line">Their work email, one a line. Each is sent a link to this page.</p>
      <textarea className="care-input" id="staff-emails" name="emails" rows={2} defaultValue={state.emails} maxLength={10000} />
      {state.message && <p className="care-error" role="alert">{state.message}</p>}
      {state.said && <p className="care-said" role="status">{state.said}</p>}
      <button className="care-btn primary care-gap" type="submit" disabled={adding}>Add</button>
    </form>
  );
}

/** Fresh every minute, unless someone is typing or codes are on screen. */
export function Refresher() {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      const names = document.getElementById('names') as HTMLTextAreaElement | null;
      const busy = document.querySelector('[data-busy]')
        || (names && (names.value.trim() !== '' || document.activeElement === names))
        || document.querySelector('details.care-more[open]')
        || (document.getElementById('staff-emails') as HTMLTextAreaElement | null)?.value.trim();
      if (!busy && document.visibilityState === 'visible') router.refresh();
    }, 60_000);
    return () => clearInterval(id);
  }, [router]);
  return null;
}
