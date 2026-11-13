import type { Metadata } from 'next';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { care, careIsOpen, EMAIL_COOKIE, SESSION_COOKIE, type CarePage, type Person } from '@/lib/care';
import { act, removeStaff } from './actions';
import { Frame } from './Frame';
import { SignIn } from './SignIn';
import { AddClients, AddStaff, NewCode, Refresher } from './Live';
import './care.css';

/**
 * lampsill.com/care — for care teams (13 Nov 2026).
 *
 * NOTHING MORE THAN THE DUTY PHONE. A team's clients chose its duty account
 * with a code, as family would, and this page shows what that phone shows:
 * Normal, phone not used, paused, switched off, removed, or that something
 * needs fixing. Never when or how anyone used their phone — the server never
 * sends it (lampsill_api CareController). Words are the app's own.
 *
 * Not in the sitemap, and not indexed.
 */
/** One call per page view, shared by the title and the page. */
const load = cache(async () => {
  const jar = await cookies();
  return careIsOpen() && jar.has(SESSION_COOKIE) ? care<CarePage>('GET', '') : null;
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await load();
  const alerts = page?.ok ? page.data.people.filter((p) => p.status === 'alert').length : 0;
  return {
    // The tab says so when a phone hasn't been used, even in the background.
    title: alerts > 0 ? `(${alerts}) Phone not used · Lampsill` : 'Lampsill for care teams',
    description: 'Your clients at a glance: the same list your duty phone shows.',
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

const LONDON = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});
const day = (iso: string | null) => (iso ? LONDON.format(new Date(iso)) : '');
const hours = (h: number) => (h === 1 ? '1 hour' : `${h} hours`);

export default async function CarePageRoute() {
  if (!careIsOpen()) {
    return (
      <Frame>
        <h1 className="care-title">Lampsill for care teams</h1>
        <p className="care-quiet">This page isn&rsquo;t open yet. Write to <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.</p>
      </Frame>
    );
  }

  const jar = await cookies();
  const page = await load();

  if (!page?.ok) {
    return (
      <Frame>
        {page && page.status !== 401 && <p className="care-said" role="alert">{page.message}</p>}
        <SignIn email={jar.get(EMAIL_COOKIE)?.value ?? null} />
      </Frame>
    );
  }

  const { team, me, staff, people, pending, windows } = page.data;
  const alerts = people.filter((p) => p.status === 'alert').length;

  return (
    <Frame me={me.email}>
      <Refresher />
      <h1 className="care-title">{team.name}</h1>
      {alerts > 0 ? (
        <p className="care-status alert">
          {alerts === 1 ? "1 client's phone hasn't been used" : `${alerts} clients' phones haven't been used`}
        </p>
      ) : (
        people.length > 0 && <p className="care-quiet">Everyone is Normal or paused. You&rsquo;d be told if a phone isn&rsquo;t used.</p>
      )}
      {!team.has_duty && <p className="care-said">This team isn&rsquo;t fully set up yet. Write to <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.</p>}

      <h2 className="care-h2">Clients</h2>
      <div className="care-card">
        {people.length === 0 && <p className="care-quiet care-flush">No clients yet. Add them below, then help each one type in their code.</p>}
        {people.map((p) => <Client key={p.id} p={p} />)}
      </div>

      {pending.length > 0 && (
        <>
          <h2 className="care-h2">Waiting for a yes</h2>
          <div className="care-card">
            {pending.map((i) => {
              const ranOut = new Date(i.expires_at) < new Date();
              return (
                <div className="care-row" key={i.id}>
                  <div className="care-who">
                    <div className="care-name">{i.name}</div>
                    <div className="care-small care-quiet">
                      Asks after {hours(i.window_hours)} · {ranOut ? 'code ran out — make a new one' : `code works until ${day(i.expires_at)}`}
                    </div>
                    <div className="care-actions">
                      <NewCode inviteId={i.id} />
                      <form action={act.bind(null, `/invites/${i.id}/remove`)}>
                        <button className="care-btn" type="submit">Remove</button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {team.has_duty && (
        <>
          <h2 className="care-h2">Add clients</h2>
          {team.seats_left === 0 ? (
            <p className="care-quiet">
              Your package is full ({team.seats} clients). Remove a waiting invite, or ask Lampsill for more at{' '}
              <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.
            </p>
          ) : (
            <AddClients windows={windows} seats={team.seats} counted={team.counted} />
          )}
        </>
      )}

      <h2 className="care-h2">Your team</h2>
      <details className="care-card care-more care-team">
        <summary>{staff.length === 1 ? 'Only you so far' : `${staff.length} people can open this page`} · add a colleague</summary>
        <div className="care-gap">
          {staff.map((s) => (
            <div className="care-row care-staff" key={s.email}>
              <div className="care-who">
                <div className="care-email-full">{s.email}</div>
                <div className="care-small care-quiet">
                  {s.me ? 'You' : ''}{s.me && s.team_email ? ' · ' : ''}{s.team_email ? 'Team email: alerts go here' : ''}
                </div>
              </div>
              {!s.me && !s.team_email && (
                <form action={removeStaff.bind(null, s.email)}>
                  <button className="care-btn" type="submit" aria-label={`Remove ${s.email}`}>Remove</button>
                </form>
              )}
            </div>
          ))}
          <AddStaff />
        </div>
      </details>

      <p className="care-quiet care-small care-foot">
        Your team sees what a family member sees: Normal, paused, or that a phone hasn&rsquo;t been used. Never when or how anyone used their phone.
      </p>
    </Frame>
  );
}

function Client({ p }: { p: Person }) {
  const [kind, word, tone] =
    p.status === 'alert' ? ['alert', 'Phone not used', 'alert']
    : p.status === 'paused' ? ['curtains', `Paused until ${day(p.paused_until)}`, 'off']
    : p.reason === 'switched_off' ? ['curtains', 'Switched off', 'off']
    : p.reason === 'removed' ? ['broken', 'Removed you', 'off']
    : p.reason === 'notifications_off' ? ['broken', 'Needs a fix on their phone', 'alert']
    : ['ok', 'Normal', 'ok'];
  const removed = p.reason === 'removed';

  return (
    <div className={`care-row${p.status === 'alert' ? ' is-alert' : ''}`}>
      <Window kind={kind} />
      <div className="care-who">
        <div className="care-name">{p.name}</div>
        <div className={`care-status ${tone}`}>{word}</div>

        {p.status === 'alert' && (
          <>
            <p className="care-small care-line">
              {p.checking_me ? 'Your team is checking.' : p.checking_by ? `${p.checking_by} is checking.` : "Nobody has said they're checking yet."}
            </p>
            {p.note && <p className="care-small care-quiet care-line">Their note: {p.note}</p>}
            {p.phone && <p className="care-small care-line"><a href={`tel:${p.phone}`}>{p.phone}</a></p>}
            <div className="care-actions">
              {!p.checking_me && (
                <form action={act.bind(null, `/clients/${p.id}/checking`)}>
                  <button className="care-btn warn" type="submit">I&rsquo;m checking</button>
                </form>
              )}
              <form action={act.bind(null, `/clients/${p.id}/ok`)}>
                <button className="care-btn" type="submit">They&rsquo;re OK</button>
              </form>
            </div>
          </>
        )}
        {p.status === 'ok' && (
          <p className="care-small care-quiet care-line">You&rsquo;d be told if their phone isn&rsquo;t used for {hours(p.window_hours)}.</p>
        )}
        {p.reason === 'notifications_off' && (
          <p className="care-small care-quiet care-line">Lampsill can&rsquo;t ask them &ldquo;Are you OK?&rdquo;. Help them turn notifications back on.</p>
        )}

        {p.status !== 'alert' && (
          <details className="care-more">
            <summary>{removed ? 'Clear from the list' : 'Stop looking out'}</summary>
            <form action={act.bind(null, `/clients/${p.id}/stop`)}>
              <p className="care-small care-quiet">
                {removed
                  ? 'They already took your team off their list. This clears them away.'
                  : "You won't hear if their phone isn't used. They see that you have stopped, and their own Lampsill carries on. This frees their place in your package."}
              </p>
              <button className="care-btn" type="submit">{removed ? 'Clear' : 'Stop'}</button>
            </form>
          </details>
        )}
      </div>
    </div>
  );
}

/** The app's window, one meaning per look (window figure rules). */
function Window({ kind }: { kind: string }) {
  const stroke = kind === 'ok' ? 'var(--vesper)' : kind === 'alert' ? 'var(--ember)' : 'var(--ink3)';
  return (
    <svg className="care-win" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" fill="none" stroke={stroke} strokeWidth="4.8" strokeLinejoin="round" strokeDasharray={kind === 'broken' ? '6 5' : undefined} />
      <path d="M32 13 L32 52 M17 34 L47 34" fill="none" stroke={stroke} strokeWidth="3.2" strokeLinecap="round" opacity="0.5" />
      {kind === 'ok' && <rect x="20" y="37.5" width="9" height="10.5" rx="1" fill="var(--lamp)" />}
      {kind === 'curtains' && <path d="M20 30 Q24 42 20 50 M44 30 Q40 42 44 50" fill="none" stroke="var(--ink3)" strokeWidth="3" strokeLinecap="round" />}
    </svg>
  );
}
