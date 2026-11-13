'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Mark } from '@/components/Chrome';
import type { CarePage, Code, Invite, Person } from '@/lib/care';
import { act, addClients, addStaff, newCode, removeStaff, signOut, type Result } from './actions';

/**
 * The signed-in care page: look A, "one calm list" (14 Nov 2026).
 *
 * One sentence says how things are. Phones that haven't been used sit at the
 * top with their buttons showing; everyone else is one quiet list, each row
 * opening in place. Adding clients is one blue button; the team sits behind
 * your initial. Both open as a panel from the bottom.
 *
 * Live: it asks for the team's page every 10 seconds while the tab is in
 * front, and straight away when the person comes back to it. Buttons change
 * the screen at once and the server's answer settles it. A failed check never
 * replaces the page: it says "Can't reach Lampsill" and tries again.
 */

const EVERY_MS = 10_000;

const LONDON = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});
const day = (iso: string | null) => (iso ? LONDON.format(new Date(iso)) : '');
const hours = (h: number) => (h === 1 ? '1 hour' : `${h} hours`);

/** Who needs a look comes first; then Normal, then the choices, then waiting. */
const ORDER = (p: Person) =>
  p.status === 'alert' ? 0 : p.reason === 'notifications_off' ? 1 : p.status === 'ok' ? 2 : p.reason === 'removed' ? 4 : 3;

export function CareApp({ initial }: { initial: CarePage }) {
  const [page, setPage] = useState(initial);
  const [offline, setOffline] = useState(false);
  const [codes, setCodes] = useState<Code[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'add' | 'team' | null>(null);
  // Bumped by every action, so a check that started before it can't put
  // older news back on screen.
  const version = useRef(0);
  const busy = useRef(0);

  const signedOut = () => window.location.assign('/care');

  const check = useCallback(async () => {
    if (busy.current > 0 || document.visibilityState !== 'visible') return;
    const started = version.current;
    try {
      const res = await fetch('/care/data', { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (res.status === 401) return signedOut();
      if (!res.ok) throw new Error(String(res.status));
      const fresh = (await res.json()) as CarePage;
      if (version.current === started && busy.current === 0) setPage(fresh);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(check, EVERY_MS);
    const now = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', now);
    window.addEventListener('focus', now);
    window.addEventListener('online', now);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', now);
      window.removeEventListener('focus', now);
      window.removeEventListener('online', now);
    };
  }, [check]);

  const alerts = page.people.filter((p) => p.status === 'alert');
  // The tab says so when a phone hasn't been used, even in the background.
  useEffect(() => {
    document.title = alerts.length > 0 ? `(${alerts.length}) Phone not used · Lampsill` : 'Lampsill for care teams';
  }, [alerts.length]);

  /** Shows the change at once, then lets the server's answer settle it. */
  const run = useCallback(async (guess: ((p: CarePage) => CarePage) | null, call: () => Promise<Result>): Promise<Result> => {
    version.current += 1;
    busy.current += 1;
    setError(null);
    if (guess) setPage((p) => guess(p));
    let r: Result;
    try {
      r = await call();
      setOffline(false);
    } catch {
      r = { message: "Can't reach Lampsill right now. Try again in a moment." };
      setOffline(true);
    }
    busy.current = Math.max(0, busy.current - 1);

    if (r.signedOut) signedOut();
    if (r.page) setPage(r.page);
    if (r.codes) setCodes(r.codes);
    if (r.message) {
      setError(r.message);
      // Refused: put back what is really there, undoing the guess.
      if (!r.page) await check();
    }
    return r;
  }, [check]);

  const person = (id: string, change: (p: Person) => Person | null) => (pg: CarePage): CarePage => ({
    ...pg,
    people: pg.people.flatMap((p) => (p.id === id ? (change(p) ? [change(p) as Person] : []) : [p])),
  });

  const { team, people, pending, windows, staff, me } = page;
  const rest = people.filter((p) => p.status !== 'alert').sort((a, b) => ORDER(a) - ORDER(b));
  const fixes = rest.filter((p) => p.reason === 'notifications_off');

  const state =
    alerts.length === 1 ? { warn: true, text: `${alerts[0].name}’s phone hasn’t been used.` }
    : alerts.length > 1 ? { warn: true, text: `${alerts.length} clients’ phones haven’t been used.` }
    : fixes.length === 1 ? { warn: true, text: `${fixes[0].name} needs a fix on their phone.` }
    : fixes.length > 1 ? { warn: true, text: `${fixes.length} clients need a fix on their phone.` }
    : people.length === 0 && pending.length === 0 ? { warn: false, text: 'No clients yet.' }
    : people.length === 0 ? { warn: false, text: 'Waiting for your clients to type in their codes.' }
    : rest.every((p) => p.status === 'ok' && p.reason === null) ? { warn: false, text: 'Everyone is Normal.' }
    : { warn: false, text: 'Nobody needs a look right now.' };

  const closeAdd = () => { setSheet(null); setCodes(null); };

  return (
    <>
      <div className="care-top">
        <a className="lockup" href="/" aria-label="Lampsill, home">
          <Mark />
          <span className="wordmark">Lampsill</span>
        </a>
        <button className="care-me" type="button" aria-label="Your team and account" onClick={() => setSheet('team')}>
          {me.email.slice(0, 1).toUpperCase()}
        </button>
      </div>

      <h1 className="care-title">{team.name}</h1>
      <p className={`care-live${offline ? ' is-off' : ''}`} role="status">
        <span className="care-dot" aria-hidden="true" />
        {offline ? "Can't reach Lampsill. Trying again…" : 'Live'}
      </p>
      <p className={`care-state${state.warn ? ' is-warn' : ''}`} role="status" aria-atomic="true">{state.text}</p>

      {!team.has_duty && <p className="care-said">This team isn&rsquo;t fully set up yet. Write to <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.</p>}
      {error && !sheet && <p className="care-error care-said" role="alert">{error}</p>}

      {alerts.map((p) => (
        <AlertBlock
          key={p.id}
          p={p}
          onChecking={() => run(person(p.id, (x) => ({ ...x, checking_me: true, checking_by: null })), () => act(`/clients/${p.id}/checking`))}
          onOk={() => run(person(p.id, (x) => ({ ...x, status: 'ok', reason: null, checking_me: false, checking_by: null })), () => act(`/clients/${p.id}/ok`))}
        />
      ))}

      {(rest.length > 0 || pending.length > 0) && (
        <ul className="care-list" aria-label="Clients">
          {rest.map((p) => (
            <ClientRow key={p.id} p={p} onStop={() => run(person(p.id, () => null), () => act(`/clients/${p.id}/stop`))} />
          ))}
          {pending.map((i) => (
            <WaitingRow
              key={i.id}
              i={i}
              onNewCode={() => { setSheet('add'); run(null, () => newCode(i.id)); }}
              onRemove={() => run((pg) => ({ ...pg, pending: pg.pending.filter((x) => x.id !== i.id) }), () => act(`/invites/${i.id}/remove`))}
            />
          ))}
        </ul>
      )}
      {people.length === 0 && pending.length === 0 && team.has_duty && (
        <p className="care-quiet">Add your clients&rsquo; names and Lampsill makes a code for each. They type it into Lampsill on their phone.</p>
      )}

      <p className="care-quiet care-small care-foot">
        Your team sees what a family member sees: Normal, paused, or that a phone hasn&rsquo;t been used. Never when or how anyone used their phone.
      </p>

      {team.has_duty && (
        <div className="care-fab-wrap">
          <button className="care-fab" type="button" onClick={() => setSheet('add')}>
            <Icon d="M12 5v14M5 12h14" /> Add clients
          </button>
        </div>
      )}

      <Sheet open={sheet === 'add'} typeFirst title={codes ? 'Their codes' : 'Add clients'} onClose={closeAdd}>
        {codes ? (
          <Codes codes={codes} onDone={closeAdd} />
        ) : team.seats_left === 0 ? (
          <p className="care-quiet">
            Your package is full ({team.seats} clients). Remove a waiting invite, or ask Lampsill for more at{' '}
            <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.
          </p>
        ) : (
          <AddClients windows={windows} seats={team.seats} counted={team.counted} onAdd={(names, w) => run(null, () => addClients(names, w))} />
        )}
        {error && sheet === 'add' && !codes && <p className="care-error" role="alert">{error}</p>}
      </Sheet>

      <Sheet open={sheet === 'team'} title="Your team" onClose={() => setSheet(null)}>
        <Team
          staff={staff ?? []}
          onAdd={(emails) => run(null, () => addStaff(emails))}
          onRemove={(email) => run((pg) => ({ ...pg, staff: (pg.staff ?? []).filter((s) => s.email !== email) }), () => removeStaff(email))}
        />
        <form action={signOut} className="care-signout">
          <span className="care-quiet care-small care-email-full">Signed in as {me.email}</span>
          <button className="care-btn" type="submit">Sign out</button>
        </form>
      </Sheet>
    </>
  );
}

function AlertBlock({ p, onChecking, onOk }: { p: Person; onChecking: () => void; onOk: () => void }) {
  const who = p.checking_me ? 'your team is checking' : p.checking_by ? `${p.checking_by} is checking` : 'nobody checking yet';
  return (
    <section className="care-alert care-in" aria-label={`${p.name}: phone not used`}>
      <div className="care-head">
        <Window kind="quiet" />
        <div className="care-who">
          <div className="care-name">{p.name}</div>
          <div className="care-status alert">Phone not used · {who}</div>
        </div>
      </div>
      {p.note && <p className="care-small care-quiet care-note">Their note: {p.note}</p>}
      <div className="care-actions">
        {p.phone && (
          <a className="care-btn primary" href={`tel:${p.phone}`} aria-label={`Call ${p.name} on ${p.phone}`}>
            <Icon d={PHONE} fill /> Call <span className="care-num">{p.phone}</span>
          </a>
        )}
        {!p.checking_me && <button className="care-btn warn" type="button" onClick={onChecking}>I&rsquo;m checking</button>}
        <button className="care-btn" type="button" onClick={onOk}>They&rsquo;re OK</button>
      </div>
    </section>
  );
}

function ClientRow({ p, onStop }: { p: Person; onStop: () => void }) {
  const [asking, setAsking] = useState(false);
  const [kind, word, tone] =
    p.status === 'paused' ? ['curtains', `Paused until ${day(p.paused_until)}`, 'off']
    : p.reason === 'switched_off' ? ['curtains', 'Switched off', 'off']
    : p.reason === 'removed' ? ['open', 'Removed you', 'off']
    : p.reason === 'notifications_off' ? ['open-warn', 'Needs a fix on their phone', 'alert']
    : ['lit', 'Normal', 'ok'];
  const removed = p.reason === 'removed';

  return (
    <li className="care-in">
      <details className="care-row">
        <summary>
          <Window kind={kind} />
          <span className="care-who">
            <span className="care-name">{p.name}</span>
            <span className={`care-status ${tone}`} suppressHydrationWarning>{word}</span>
          </span>
          <Chevron />
        </summary>
        <div className="care-body">
          {p.status === 'ok' && p.reason === null && <p className="care-quiet">You&rsquo;d be told if their phone isn&rsquo;t used for {hours(p.window_hours)}.</p>}
          {p.reason === 'notifications_off' && <p className="care-quiet">Lampsill can&rsquo;t ask them &ldquo;Are you OK?&rdquo;. Help them turn notifications back on.</p>}
          {removed && <p className="care-quiet">They took your team off their list.</p>}
          {asking ? (
            <>
              {!removed && <p className="care-quiet">You won&rsquo;t hear if their phone isn&rsquo;t used. They see that you have stopped, and their own Lampsill carries on. This frees their place in your package.</p>}
              <div className="care-actions">
                <button className="care-btn warn" type="button" onClick={onStop}>{removed ? 'Clear' : 'Stop'}</button>
                <button className="care-btn" type="button" onClick={() => setAsking(false)}>Keep</button>
              </div>
            </>
          ) : (
            <div className="care-actions">
              {p.phone && !removed && (
                <a className="care-btn" href={`tel:${p.phone}`} aria-label={`Call ${p.name} on ${p.phone}`}><Icon d={PHONE} fill /> {p.phone}</a>
              )}
              <button className="care-btn quiet" type="button" onClick={() => setAsking(true)}>{removed ? 'Clear from the list' : 'Stop looking out'}</button>
            </div>
          )}
        </div>
      </details>
    </li>
  );
}

function WaitingRow({ i, onNewCode, onRemove }: { i: Invite; onNewCode: () => void; onRemove: () => void }) {
  const ranOut = new Date(i.expires_at) < new Date();
  return (
    <li className="care-in">
      <details className="care-row">
        <summary>
          <Window kind="waiting" />
          <span className="care-who">
            <span className="care-name">{i.name}</span>
            <span className={`care-status ${ranOut ? 'alert' : 'off'}`} suppressHydrationWarning>
              {ranOut ? 'Waiting · code ran out' : 'Waiting for their code'}
            </span>
          </span>
          <Chevron />
        </summary>
        <div className="care-body">
          <p className="care-quiet" suppressHydrationWarning>
            Asks after {hours(i.window_hours)}. {ranOut ? 'Make a new code and give it to them.' : `Their code works until ${day(i.expires_at)}.`}
          </p>
          <div className="care-actions">
            <button className="care-btn" type="button" onClick={onNewCode}>New code</button>
            <button className="care-btn quiet" type="button" onClick={onRemove}>Remove</button>
          </div>
        </div>
      </details>
    </li>
  );
}

/** The codes, shown once: only a hash of each is kept on the server. */
function Codes({ codes, onDone }: { codes: Code[]; onDone: () => void }) {
  return (
    <div role="status">
      <p>Give each person their code. They open Lampsill, tap <strong>&ldquo;I have a code&rdquo;</strong> and type it in. Codes work for 48 hours.</p>
      <ul className="care-list care-codes">
        {codes.map((c) => (
          <li key={c.name + c.code}>
            <span className="care-name">{c.name}</span>
            <span className="care-code">{c.code.slice(0, 4)} {c.code.slice(4)}</span>
          </li>
        ))}
      </ul>
      <p className="care-quiet care-small">These are shown once. Write them down before you close this.</p>
      <button className="care-btn primary" type="button" onClick={onDone}>Done</button>
    </div>
  );
}

function AddClients({ windows, seats, counted, onAdd }: {
  windows: number[]; seats: number | null; counted: number; onAdd: (names: string, w: number) => Promise<Result>;
}) {
  const [names, setNames] = useState('');
  const [w, setW] = useState(12);
  const [adding, setAdding] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setAdding(true);
        const r = await onAdd(names, w);
        setAdding(false);
        // Refused: the names stay, so nothing typed is lost.
        if (r.codes) setNames('');
      }}
    >
      <label className="care-label" htmlFor="names">Names, one a line</label>
      <textarea className="care-input care-names" id="names" value={names} onChange={(e) => setNames(e.target.value)} maxLength={4000} required />
      <label className="care-label care-gap" htmlFor="window_hours">Ask &ldquo;Are you OK?&rdquo; when their phone isn&rsquo;t used for</label>
      <select className="care-input" id="window_hours" value={w} onChange={(e) => setW(Number(e.target.value))}>
        {[12, 24, 48, 1].filter((x) => windows.includes(x)).map((x) => (
          <option key={x} value={x}>{x === 1 ? '1 hour — to try it together' : hours(x)}</option>
        ))}
      </select>
      <div className="care-actions care-gap">
        <button className="care-btn primary" type="submit" disabled={adding}>{adding ? 'Making codes…' : 'Make codes'}</button>
        {seats !== null && <span className="care-quiet care-small">{counted} of {seats} clients</span>}
      </div>
    </form>
  );
}

function Team({ staff, onAdd, onRemove }: {
  staff: CarePage['staff']; onAdd: (emails: string) => Promise<Result>; onRemove: (email: string) => void;
}) {
  const [emails, setEmails] = useState('');
  const [adding, setAdding] = useState(false);
  const [said, setSaid] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <>
      <p className="care-quiet">{staff.length <= 1 ? 'Only you can open this page so far.' : `${staff.length} people can open this page.`}</p>
      <ul className="care-list care-staff">
        {staff.map((s) => (
          <li key={s.email}>
            <span className="care-who">
              <span className="care-email-full">{s.email}</span>
              <span className="care-small care-quiet">
                {[s.me ? 'You' : '', s.team_email ? 'Team email: alerts go here' : ''].filter(Boolean).join(' · ')}
              </span>
            </span>
            {!s.me && !s.team_email && (
              <button className="care-btn quiet" type="button" aria-label={`Remove ${s.email}`} onClick={() => onRemove(s.email)}>Remove</button>
            )}
          </li>
        ))}
      </ul>
      <form
        className="care-gap"
        onSubmit={async (e) => {
          e.preventDefault();
          setAdding(true);
          const r = await onAdd(emails);
          setAdding(false);
          setSaid(r.said ?? null);
          setMessage(r.said ? null : r.message ?? null);
          if (r.said) setEmails('');
        }}
      >
        <label className="care-label" htmlFor="staff-emails">Add a colleague</label>
        <p className="care-small care-quiet care-line">Their work email, one a line. Each is sent a link to this page.</p>
        <textarea className="care-input" id="staff-emails" rows={2} value={emails} onChange={(e) => setEmails(e.target.value)} maxLength={10000} required />
        {message && <p className="care-error" role="alert">{message}</p>}
        {said && <p className="care-said" role="status">{said}</p>}
        <button className="care-btn primary care-gap" type="submit" disabled={adding}>{adding ? 'Adding…' : 'Add'}</button>
      </form>
    </>
  );
}

/**
 * A panel from the bottom on a phone, in the middle on a computer. The
 * browser's own dialog: it keeps the keyboard inside, Esc closes it, and
 * focus goes back to the button that opened it.
 */
function Sheet({ open, title, onClose, typeFirst = false, children }: {
  open: boolean; title: string; onClose: () => void; typeFirst?: boolean; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      // Adding clients starts with typing, so the cursor waits in the box.
      if (typeFirst) d.querySelector<HTMLElement>('textarea')?.focus();
    }
    if (!open && d.open) d.close();
  }, [open, typeFirst]);

  return (
    <dialog
      ref={ref}
      className="care-sheet"
      aria-labelledby={id}
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <div className="care-sheet-in">
        <div className="care-sheet-top">
          <h2 id={id} className="care-sheet-title">{title}</h2>
          <button className="care-close" type="button" aria-label="Close" onClick={onClose}>
            <Icon d="M6 6l12 12M18 6L6 18" />
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}

const PHONE = 'M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.6a1 1 0 01-.25 1z';

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg className="care-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="care-chev" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The app's window, one meaning per look (window figure rules):
 * lit = Normal; curtains grey = paused or switched off (a choice); open crown
 * grey = took you off their list; open crown in warning colour = needs a fix;
 * dark whole in warning colour = phone not used; empty frame with three dots
 * = waiting for a yes.
 */
function Window({ kind }: { kind: string }) {
  const clip = `glass${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const warn = kind === 'quiet' || kind === 'open-warn';
  const stroke = kind === 'lit' ? 'var(--vesper)' : warn ? 'var(--ember)' : 'var(--ink3)';
  const open = kind === 'open' || kind === 'open-warn';
  const glass = 'M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z';
  return (
    <svg className="care-win" viewBox="0 0 64 64" aria-hidden="true">
      {kind === 'quiet' && <path d={glass} fill="color-mix(in srgb, var(--ember) 22%, transparent)" />}
      {kind === 'lit' && <rect x="20" y="37.5" width="9" height="10.5" rx="1" fill="var(--lamp)" />}
      {kind !== 'waiting' && (
        // With the crown open, the upright hangs from below the break.
        <path d={`M32 ${open ? 20 : 14} L32 52 M17 34 L47 34`} fill="none" stroke={stroke} strokeWidth="3.2" opacity="0.5" />
      )}
      {kind === 'curtains' && (
        // As the app draws it: two drapes across the glass, gathered to the
        // sides at the foot, as a house looks when nobody is home.
        <>
          <clipPath id={clip}><path d={glass} /></clipPath>
          <g clipPath={`url(#${clip})`} fill={stroke} opacity="0.55">
            <path d="M16 12 L31 12 Q26 34 21 52 L16 52 Z" />
            <path d="M48 12 L33 12 Q38 34 43 52 L48 52 Z" />
          </g>
        </>
      )}
      <path
        d={open ? 'M26 13.2 A16 16 0 0 0 16 28 L16 52 L48 52 L48 28 A16 16 0 0 0 38 13.2' : glass}
        fill="none" stroke={stroke} strokeWidth="4.8" strokeLinejoin="round" strokeLinecap="round"
      />
      {kind === 'waiting' && [24, 32, 40].map((x) => <circle key={x} cx={x} cy="38" r="2.6" fill="var(--ink3)" />)}
    </svg>
  );
}
