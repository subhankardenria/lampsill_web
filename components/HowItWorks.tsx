'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FAMILY } from '@/lib/copy';
import { PersonaTabs, usePersona } from './Persona';

type Phase =
  | 'idle' | 'quiet' | 'ringing' | 'notified'
  // your call to them, and the four ways it can end
  | 'calling' | 'talking' | 'talked' | 'declined' | 'hungup' | 'called'
  | 'messaged' | 'answered';
/** what your call left behind on their phone, once it is over */
type Outcome = 'none' | 'missed' | 'declined' | 'talked';
/** how a station looks right now: `idle` before a run (everything readable),
 *  `on` is where the story is, `done` has been passed, `off` not reached yet */
type Lit = 'idle' | 'on' | 'done' | 'off';

const QUIET_MS = 4200; // stands in for 12 hours
const RING_MS = 5000; // stands in for 10 minutes
const CALL_MS = 4500; // your call to them, ringing out if nobody touches it
const TALK_S = 6; // a call that's picked up ends by itself after this

const Handset = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor" />
  </svg>
);

/**
 * HOW IT WORKS AND TRY IT, AS ONE THING.
 *
 * These were two sections that said the same thing twice: a cast of three
 * people holding static screens, then three live phones to play with. Now the
 * three live phones ARE the explanation. Each one sits above the one sentence
 * that says what that person gets, the story plays across them when the
 * section scrolls in, and the light travels along the line from one person to
 * the next only when the one before hasn't answered.
 *
 * Deliberately NOT automated past the notification. If the visitor sits on it
 * and does nothing, nothing else happens and the status says so. That is Branch
 * C of the worked example and it is the true behaviour: there is no server
 * fallback, and a demo that messaged the nearest person on its own would be
 * selling a feature that does not exist.
 *
 * "Anna answers" (and its equivalents) is available the whole time the phone
 * is ringing, because that is how most alerts in this product's life end.
 */
export default function HowItWorks() {
  const { persona: P } = usePersona();
  const [phase, setPhase] = useState<Phase>('idle');
  const [hours, setHours] = useState(0);
  const [replied, setReplied] = useState(false);
  const [idleHint, setIdleHint] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>('none');
  const [secs, setSecs] = useState(0);
  const [active, setActive] = useState(0);
  const raf = useRef(0);
  const timers = useRef<number[]>([]);
  const section = useRef<HTMLElement>(null);
  const row = useRef<HTMLOListElement>(null);
  /** set once a run has started, so a tab switch replays for the new family */
  const hasRun = useRef(false);

  const clear = useCallback(() => {
    cancelAnimationFrame(raf.current);
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);
  useEffect(() => clear, [clear]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const stations = () => Array.from(row.current?.querySelectorAll<HTMLElement>('.station') ?? []);

  // On a phone the three stations are a horizontal swipe; keep the one that
  // matters on screen. Scrolls the ROW, never the page, so it cannot fight Lenis.
  const focusStation = useCallback((i: number) => {
    const r = row.current;
    const card = stations()[i];
    if (!r || !card || r.scrollWidth <= r.clientWidth) return;
    r.scrollTo({ left: card.offsetLeft - (r.clientWidth - card.clientWidth) / 2, behavior: 'smooth' });
  }, []);

  const ring = () => {
    setPhase('ringing');
    later(() => {
      setPhase('notified');
      focusStation(1);
      later(() => setIdleHint(true), 4500);
    }, RING_MS);
  };

  const start = () => {
    clear();
    hasRun.current = true;
    setReplied(false);
    setOutcome('none');
    setIdleHint(false);
    setHours(0);
    setPhase('quiet');
    focusStation(0);
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / QUIET_MS);
      setHours(Math.floor(p * FAMILY.quietHours));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else ring();
    };
    raf.current = requestAnimationFrame(tick);
  };
  // the observer and the tab effect below hold onto the first render's closure
  const startRef = useRef(start);
  startRef.current = start;

  const answer = () => {
    clear();
    setPhase('answered');
    focusStation(0);
  };

  // YOUR CALL LANDS ON THEIR PHONE, and both ends of it are real buttons.
  // Their phone rings with a decline and an answer button; yours shows
  // "Calling…" with a hang-up button. Nobody touches anything and it rings out
  // into a missed call. Every ending hands back to your phone, because that is
  // where the next decision is made.
  const call = () => {
    clear();
    setIdleHint(false);
    setPhase('calling');
    focusStation(0);
    later(() => {
      setPhase('called');
      setOutcome('missed');
      focusStation(1);
    }, CALL_MS);
  };

  /** you hang up before they answer */
  const hangUp = () => {
    clear();
    setPhase('hungup');
    setOutcome('missed');
    focusStation(1);
  };

  /* DECLINING OR PICKING UP IS USING THE PHONE, and any use of the phone is
     what Lampsill is watching for. So both endings put your screen back to
     "normal" by themselves: the product reads the phone, you don't have to
     read meaning into a declined call. Only a call nobody touches stays an
     alert. ⚠️ This is the product as designed, not as built — see "Before this
     goes live" in the README before the site makes this claim in public. */
  /** they decline */
  const decline = () => {
    clear();
    setPhase('declined');
    setOutcome('declined');
    later(() => focusStation(1), 700);
  };

  const endCall = () => {
    clear();
    setPhase('talked');
    setOutcome('talked');
    later(() => focusStation(1), 700);
  };

  /** they pick up: a live call with a running timer, which either side can end */
  const pickUp = () => {
    clear();
    setSecs(0);
    setPhase('talking');
    const tick = (n: number) =>
      later(() => {
        setSecs(n);
        if (n < TALK_S) tick(n + 1);
        else endCall();
      }, 1000);
    tick(1);
  };

  const text = () => {
    clear();
    setPhase('messaged');
    focusStation(2);
    later(() => setReplied(true), 1600);
  };

  // PLAYS BY ITSELF the first time the phones are properly on screen, so the
  // explanation happens in front of the reader without needing a button found
  // first. Once only, and never under reduced motion. Watches the SECTION,
  // which never remounts — the row is keyed on the tab, and an observer on a
  // replaced row would be watching a detached node that can never intersect.
  useEffect(() => {
    const el = section.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        if (!hasRun.current) startRef.current();
      },
      { rootMargin: '0px 0px -40% 0px', threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A tab switch mid-run would leave the phones describing two families at
  // once. Reset — and if the reader has already watched one, play the new one.
  const firstKey = useRef(P.key);
  useEffect(() => {
    clear();
    setPhase('idle');
    setHours(0);
    setReplied(false);
    setIdleHint(false);
    setOutcome('none');
    setActive(0);
    row.current?.scrollTo({ left: 0 });
    if (P.key !== firstKey.current && hasRun.current) {
      const t = window.setTimeout(() => startRef.current(), 350);
      return () => window.clearTimeout(t);
    }
  }, [P.key, clear]);

  const onRowScroll = () => {
    const el = row.current;
    const cards = stations();
    if (!el || cards.length < 2) return;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    if (step <= 0) return; // desktop grid: nothing to track
    setActive(Math.max(0, Math.min(cards.length - 1, Math.round(el.scrollLeft / step))));
  };

  const running = phase !== 'idle';
  /** a call is live right now: their phone shows the call, not how the last one ended */
  const onCall = phase === 'calling' || phase === 'talking';
  const lit: [Lit, Lit, Lit] = !running
    ? ['idle', 'idle', 'idle']
    : phase === 'quiet' || phase === 'ringing' || phase === 'answered'
      ? ['on', 'off', 'off']
      : onCall || phase === 'talked' || phase === 'declined'
        ? ['on', 'on', 'off']
        : phase === 'messaged'
          ? ['done', 'done', 'on']
          : ['done', 'on', 'off'];
  const link1 = running && !(phase === 'quiet' || phase === 'ringing' || phase === 'answered');
  const link2 = phase === 'messaged';
  const caller = P.middle.name;
  const clock = `0:${String(secs).padStart(2, '0')}`;
  const people = [P.first.name, P.middle.name, P.nearest.name];

  return (
    <section className="section how" id="how" ref={section}>
      <div className="wrap">
        <div className="reveal how-head">
          <p className="eyebrow">How it works &middot; 20 seconds</p>
          <h2>Three phones. One quiet day.</h2>
          <p className="lede">
            Most days, nothing happens. Here&rsquo;s what happens if {P.theirPhone} sits
            untouched for {FAMILY.quietHours} hours &mdash; played out in front of you.
          </p>
        </div>

        <PersonaTabs id="how">
          <p className="heart" key={`heart-${P.key}`}>
            {P.heart}
          </p>

          <div className="hw-controls">
            <button className="btn lamp hw-play" onClick={start}>
              <span aria-hidden="true">{running ? '↺' : '▶'}</span> {running ? 'Replay' : 'Play'}
            </button>
            <p className="hw-status" aria-live="polite">
              {P.demo.status[phase]}
            </p>
          </div>

          <ol className="hw-row" ref={row} key={P.key} onScroll={onRowScroll}>
            {/* ---------------- 1. the person who lives alone ---------------- */}
            <li className="station" data-lit={lit[0]}>
              <div className="st-who">
                <span className={`avatar sm${P.first.initial.length > 1 ? ' is-word' : ''}`} aria-hidden="true">
                  {P.first.initial}
                </span>
                <span className="st-name">
                  <strong>{P.first.name}</strong>
                  <small>{P.first.role}</small>
                </span>
              </div>

              <div className="st-stage">
              <div
                className={`phone st-phone${phase === 'ringing' || phase === 'calling' ? ' is-ringing' : ''}`}
                data-phase={phase === 'ringing' ? 'alarm' : 'x'}
              >
                <div className="phone-glare" aria-hidden="true" />
                <div className="phone-notch" aria-hidden="true" />
                <div className="phone-screen">
                  {(phase === 'idle' || phase === 'quiet') && (
                    <div className="scr">
                      <div className="scr-clock" aria-hidden="true">
                        <svg viewBox="0 0 100 100">
                          <circle className="cl-bg" cx="50" cy="50" r="42" />
                          <circle
                            className="cl-fg"
                            cx="50"
                            cy="50"
                            r="42"
                            style={{ strokeDashoffset: 264 - 264 * (hours / FAMILY.quietHours) }}
                          />
                        </svg>
                        <span>{hours}h</span>
                      </div>
                      <p className="foot">untouched</p>
                    </div>
                  )}
                  {phase === 'ringing' && (
                    <div className="scr">
                      <div className="scr-ring" aria-hidden="true">?</div>
                      <h4>Still there?</h4>
                      <button className="pill" onClick={answer}>
                        I&rsquo;m fine
                      </button>
                    </div>
                  )}
                  {phase === 'calling' && (
                    <div className="scr st-call">
                      <span className="st-call-kind">Incoming call</span>
                      <span className={`avatar st-call-face ${P.middle.isVisitor ? 'you' : 'helper'}`} aria-hidden="true">
                        {/* "You" in the circle AND as the name reads twice */}
                        {P.middle.initial.length > 1 ? <Handset /> : P.middle.initial}
                      </span>
                      <h4>{caller}</h4>
                      <span className="st-call-btns">
                        <button className="cb no" onClick={decline} aria-label={`${P.first.name} declines`}>
                          <Handset />
                        </button>
                        <button className="cb yes" onClick={pickUp} aria-label={`${P.first.name} picks up`}>
                          <Handset />
                        </button>
                      </span>
                    </div>
                  )}
                  {phase === 'talking' && (
                    <div className="scr st-call">
                      <span className="st-call-kind live">On call</span>
                      <h4>{caller}</h4>
                      <span className="st-timer">{clock}</span>
                      <span className="st-call-btns">
                        <button className="cb no" onClick={endCall} aria-label="End call">
                          <Handset />
                        </button>
                      </span>
                    </div>
                  )}
                  {!onCall && outcome === 'talked' && (
                    <div className="scr">
                      <div className="scr-ring idle" aria-hidden="true"><Handset /></div>
                      <h4>Call ended</h4>
                      <p className="foot">{caller} &middot; {clock}</p>
                    </div>
                  )}
                  {!onCall && outcome === 'declined' && (
                    <div className="scr st-missed">
                      <div className="scr-ring idle" aria-hidden="true"><Handset /></div>
                      <h4>Declined</h4>
                      <p className="foot">call from {caller}</p>
                    </div>
                  )}
                  {!onCall && outcome === 'missed' && (
                    <div className="scr">
                      <div className="scr-ring st-missed-call" aria-hidden="true"><Handset /></div>
                      <h4>Missed call</h4>
                      <p className="foot">from {caller}</p>
                    </div>
                  )}
                  {(phase === 'notified' || phase === 'messaged') && outcome === 'none' && (
                    <div className="scr st-missed">
                      <div className="scr-ring" aria-hidden="true">?</div>
                      <h4>Still there?</h4>
                      <p className="foot">missed</p>
                    </div>
                  )}
                  {phase === 'answered' && (
                    <div className="scr">
                      <div className="scr-ring ok" aria-hidden="true">✓</div>
                      <h4>That&rsquo;s it</h4>
                      <p>Back to normal.</p>
                    </div>
                  )}
                </div>
              </div>
              {phase === 'ringing' && (
                <button className="btn lamp st-side" onClick={answer}>
                  {P.demo.answerBtn}
                </button>
              )}
              </div>

              <div className="st-copy">
                <h3>{P.first.h3}</h3>
                <p>{P.first.body}</p>
              </div>
            </li>

            <li className="hw-link" data-on={link1 ? '' : undefined} aria-hidden="true">
              <span className="hw-line" />
              <span className="hw-label">No answer {FAMILY.ringMinutes}&nbsp;min</span>
            </li>

            {/* ---------------- 2. the person who is told ---------------- */}
            <li className="station" data-lit={lit[1]}>
              <span className="step-chip" aria-hidden="true">↳ No answer for {FAMILY.ringMinutes} min</span>
              <div className="st-who">
                <span className={`avatar sm ${P.middle.isVisitor ? 'you' : 'helper'}`} aria-hidden="true">
                  {P.middle.initial}
                </span>
                <span className="st-name">
                  <strong>{P.middle.name}</strong>
                  <small>{P.middle.role}</small>
                </span>
              </div>

              <div className={`phone st-phone${phase === 'notified' ? ' is-buzzing' : ''}`}>
                <div className="phone-glare" aria-hidden="true" />
                <div className="phone-notch" aria-hidden="true" />
                <div className="phone-screen">
                  {(phase === 'idle' || phase === 'quiet' || phase === 'ringing' || phase === 'answered') && (
                    <div className="scr">
                      <p className="foot">{P.demo.stateOf}</p>
                      <div className="state-word">normal</div>
                      <p className="foot">{P.demo.stateCaption}</p>
                    </div>
                  )}
                  {(phase === 'calling' || phase === 'talking') && (
                    <div className="scr st-call">
                      <span className={`st-call-kind${phase === 'talking' ? ' live' : ''}`}>
                        {phase === 'talking' ? 'On call' : 'Calling…'}
                      </span>
                      {phase === 'calling' && (
                        <span className={`avatar st-call-face${P.first.initial.length > 1 ? ' is-word' : ''}`} aria-hidden="true">
                          {P.first.initial.length > 1 ? <Handset /> : P.first.initial}
                        </span>
                      )}
                      <h4>{P.first.name}</h4>
                      {phase === 'talking' && <span className="st-timer">{clock}</span>}
                      <span className="st-call-btns">
                        <button
                          className="cb no"
                          onClick={phase === 'talking' ? endCall : hangUp}
                          aria-label={phase === 'talking' ? 'End call' : 'Hang up'}
                        >
                          <Handset />
                        </button>
                      </span>
                    </div>
                  )}
                  {(phase === 'talked' || phase === 'declined') && (
                    <div className="scr st-back">
                      <p className="foot">{P.demo.stateOf}</p>
                      <div className="state-word">normal</div>
                      <p className="foot">{P.demo.inUse}</p>
                    </div>
                  )}
                  {(phase === 'notified' || phase === 'called' || phase === 'hungup') && (
                    <div className="scr st-alert">
                      <div className="mp-notif">
                        <span className="mp-app">LAMPSILL · now</span>
                        <span className="mp-ntitle">{P.notif.title}</span>
                        <span className="mp-nbody">
                          Quiet for {FAMILY.quietHours} hours. No answer for {FAMILY.ringMinutes} minutes.
                        </span>
                      </div>
                      <button className="st-act" onClick={call}>
                        {phase === 'notified' ? P.notif.call : 'Call again'}
                      </button>
                      <button className={`st-act hot${idleHint || phase !== 'notified' ? ' nudge' : ''}`} onClick={text}>
                        Text {P.nearest.name}
                      </button>
                    </div>
                  )}
                  {phase === 'messaged' && (
                    <div className="scr">
                      <div className="scr-ring ok" aria-hidden="true">✓</div>
                      <h4>Sent</h4>
                      <p>{P.middle.isVisitor ? 'From your own messages app.' : 'From her own messages app.'}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="st-copy">
                <h3>{P.middle.h3}</h3>
                <p>{P.middle.body}</p>
              </div>
            </li>

            <li className="hw-link" data-on={link2 ? '' : undefined} aria-hidden="true">
              <span className="hw-line" />
              <span className="hw-label">{P.tapLabel}</span>
            </li>

            {/* ---------------- 3. the nearest person ---------------- */}
            <li className="station" data-lit={lit[2]}>
              <span className="step-chip" aria-hidden="true">↳ {P.tapLabel}</span>
              <div className="st-who">
                <span className="avatar sm near" aria-hidden="true">
                  {P.nearest.initial}
                </span>
                <span className="st-name">
                  <strong>{P.nearest.name}</strong>
                  <small>{P.nearest.role}</small>
                </span>
              </div>

              <div className="phone st-phone">
                <div className="phone-glare" aria-hidden="true" />
                <div className="phone-notch" aria-hidden="true" />
                <div className="phone-screen">
                  {phase !== 'messaged' ? (
                    <div className="scr">
                      <div className="scr-ring idle" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                      </div>
                      <p className="foot">no messages</p>
                    </div>
                  ) : (
                    <div className="scr st-thread">
                      <span className="mp-from">{P.fromLabel}</span>
                      <span className="mp-bubble">{P.message}</span>
                      {replied && <span className="mp-reply">{P.reply}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="st-copy">
                <h3>{P.nearest.h3}</h3>
                <p>{P.nearest.body}</p>
              </div>
            </li>
          </ol>

          <div className="cast-nav" aria-label="The three phones">
            {people.map((name, i) => (
              <button
                key={`${P.key}-${name}-${i}`}
                type="button"
                className="cast-dot"
                aria-label={`Show phone ${i + 1}: ${name}`}
                aria-current={active === i ? 'step' : undefined}
                onClick={() => focusStation(i)}
              >
                <span className="cast-dot-n">{i + 1}</span>
                <span className="cast-dot-name">{name}</span>
              </button>
            ))}
          </div>

          {(phase === 'messaged' || phase === 'talked' || phase === 'declined' || phase === 'answered') && (
            <p className="hw-end" key={phase}>
              {phase === 'talked' || phase === 'declined' ? (
                <>
                  Picking up or declining is using the phone, so Lampsill goes back to{' '}
                  <strong>normal</strong> by itself. Only a call nobody touches stays an alert.
                </>
              ) : phase === 'messaged' ? (
                <>
                  Most alerts end sooner &mdash; {P.demo.note}. Press <strong>Replay</strong> and
                  try <strong>{P.demo.answerBtn}</strong>.
                </>
              ) : (
                <>
                  That&rsquo;s how most alerts end. Press <strong>Replay</strong> and let it ring
                  to see the rest.
                </>
              )}
            </p>
          )}

          {P.panelNote && (
            <p className="panel-note" key={`note-${P.key}`}>
              {P.panelNote}
            </p>
          )}
        </PersonaTabs>
      </div>
    </section>
  );
}
