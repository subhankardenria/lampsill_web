'use client';

import { useEffect, useRef, useState } from 'react';
import { Dots, goTo, useSwipeIndex } from './Swipe';
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';
import { MAX_PAUSE_DAYS, WINDOW_HINTS, WINDOW_OPTIONS } from '@/lib/copy';
import Arch, { EMBER, VESPER } from './Arch';
import Phone3D from './Phone3D';
import StateWindow from '../StateWindow';

/**
 * WHAT'S IN IT, as a bento: each tile is one feature with one small working
 * piece of it. Every claim is the app's: the hints are WINDOW_HINTS (copied
 * from the app's SilenceConfig), the note and "checking" wording are the
 * alert screen's, away is 1 to MAX_PAUSE_DAYS days and switches itself back.
 */
function Tile({
  className = '',
  i,
  children,
}: {
  className?: string;
  i: number;
  children: React.ReactNode;
}) {
  const calm = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const gx = useMotionValue(50);
  const gy = useMotionValue(0);
  const glint = useMotionTemplate`radial-gradient(22rem circle at ${gx}% ${gy}%, rgba(255,231,188,.10), transparent 60%)`;
  return (
    <motion.div
      ref={ref}
      className={`v2-tile ${className}`}
      initial={calm ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: (i % 3) * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={calm ? undefined : { y: -4 }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        gx.set(((e.clientX - r.left) / r.width) * 100);
        gy.set(((e.clientY - r.top) / r.height) * 100);
      }}
    >
      <motion.span className="v2-tile-glint" style={{ background: glint }} aria-hidden="true" />
      {children}
    </motion.div>
  );
}

/* Real times for the choice: last used Friday 9pm, asked after the hours
   chosen, told GRACE_MINUTES later only if there's no answer. */
const WHEN: Record<(typeof WINDOW_OPTIONS)[number], string> = { 12: 'Sat 9:00am', 24: 'Sat 9:00pm', 48: 'Sun 9:00pm' };
const TOLD: Record<(typeof WINDOW_OPTIONS)[number], string> = { 12: 'Sat 9:10am', 24: 'Sat 9:10pm', 48: 'Sun 9:10pm' };

function HowLong() {
  const [h, setH] = useState<(typeof WINDOW_OPTIONS)[number]>(48);
  return (
    <div className="v2-howlong">
      <div className="v2-seg" role="group" aria-label="How long is too long">
        <LayoutGroup id="v2-seg">
          {[...WINDOW_OPTIONS].map((o) => (
            <button key={o} type="button" aria-pressed={h === o} onClick={() => setH(o)}>
              {h === o && <motion.span layoutId="v2-seg-pill" className="v2-seg-pill" />}
              <span className="v2-seg-n">{o}</span>
              <span className="v2-seg-u">hours</span>
            </button>
          ))}
        </LayoutGroup>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={h}
          className="v2-howlong-hint"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {WINDOW_HINTS[h]}
        </motion.p>
      </AnimatePresence>
      <ol className="v2-when" aria-label="What happens, and when">
        <li>
          <i />
          <span>Phone last used</span>
          <b>Fri 9:00pm</b>
        </li>
        <li className="ask">
          <i />
          <span>Asked &ldquo;Are you OK?&rdquo;</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.b key={h} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {WHEN[h]}
            </motion.b>
          </AnimatePresence>
        </li>
        <li className="told">
          <i />
          <span>No answer? You&rsquo;re told</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.b key={h} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {TOLD[h]}
            </motion.b>
          </AnimatePresence>
        </li>
      </ol>
    </div>
  );
}

/* AWAY, as the week it covers: today the curtains are drawn, and on the day
   you pick the light comes back on by itself. Day names are the reader's
   own week, worked out in the browser (not at build time). */
const SLOTS = MAX_PAUSE_DAYS + 1;

function Away() {
  const [d, setD] = useState(3);
  const [week, setWeek] = useState<{ short: string; long: string }[] | null>(null);
  useEffect(() => {
    const s = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
    const l = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });
    const t = new Date();
    setWeek(
      Array.from({ length: SLOTS }, (_, i) => {
        const x = new Date(t);
        x.setDate(t.getDate() + i);
        return { short: s.format(x), long: l.format(x) };
      }),
    );
  }, []);

  return (
    <div className="v2-away">
      <div className="v2-week" role="group" aria-label="Away for how many days">
        <span className="v2-week-track" aria-hidden="true">
          <motion.span
            className="v2-week-band"
            initial={false}
            animate={{ width: `${(d / SLOTS) * 100}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
        </span>
        <div className="v2-week-cell today">
          <span className="v2-week-d">{week ? 'Today' : '\u00a0'}</span>
          <StateWindow state="away" size={24} />
          <span className="v2-week-n">Away</span>
        </div>
        {Array.from({ length: MAX_PAUSE_DAYS }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className="v2-week-cell"
            aria-pressed={d === n}
            aria-label={`${n} ${n === 1 ? 'day' : 'days'}`}
            onClick={() => setD(n)}
          >
            <span className="v2-week-d">{week ? week[n].short : '\u00a0'}</span>
            <span className="v2-week-fig" aria-hidden="true">
              {d === n ? (
                <motion.span
                  className="v2-week-on"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Arch pane={1} frame={VESPER} />
                </motion.span>
              ) : (
                <span className={`v2-week-dot ${n < d ? 'in' : ''}`} />
              )}
            </span>
            <span className="v2-week-n">{n}</span>
          </button>
        ))}
      </div>
      <p className="v2-away-note" aria-live="polite">
        Away for {d} {d === 1 ? 'day' : 'days'}. Your people are told. It turns back on by itself
        {week ? <>, on <b>{week[d].long}</b>.</> : '.'}
      </p>
    </div>
  );
}

/* "Are you OK?" on a whole phone, which leans towards the pointer. */
function AskPhone() {
  const calm = useReducedMotion();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (!ok) return;
    const t = window.setTimeout(() => setOk(false), 5000);
    return () => window.clearTimeout(t);
  }, [ok]);
  const rx = useMotionValue(6);
  const ry = useMotionValue(-14);
  const sx = useSpring(rx, { stiffness: 90, damping: 18 });
  const sy = useSpring(ry, { stiffness: 90, damping: 18 });
  return (
    <div
      className="v2-ask-phone"
      onPointerMove={(e) => {
        if (calm) return;
        const r = e.currentTarget.getBoundingClientRect();
        ry.set(-14 + ((e.clientX - r.left) / r.width - 0.5) * 22);
        rx.set(6 - ((e.clientY - r.top) / r.height - 0.5) * 14);
      }}
      onPointerLeave={() => {
        rx.set(6);
        ry.set(-14);
      }}
    >
      <motion.div
        animate={calm ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Phone3D
          src={ok ? '/v2/app-their-home.webp' : '/v2/app-are-you-ok.webp'}
          alt={ok ? 'Her home screen: your light is on' : "The Are you OK? screen, with I'm OK and I need help buttons"}
          rotateX={calm ? 0 : sx}
          rotateY={calm ? -8 : sy}
        />
      </motion.div>
      <div className="v2-ask-try">
        <AnimatePresence mode="wait" initial={false}>
          {ok ? (
            <motion.p
              key="ok"
              className="v2-ask-done"
              role="status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Nobody was told. Her light stays on.
            </motion.p>
          ) : (
            <motion.button
              key="btn"
              type="button"
              className="v2-ask-ok"
              onClick={() => setOk(true)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.96 }}
            >
              Try it: I&rsquo;m OK
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* A notification as it lands on a lock screen, in the app's own words. */
function Notif({ t, d, when = 'now', delay = 0 }: { t: string; d: string; when?: string; delay?: number }) {
  return (
    <motion.div
      className="v2-notif"
      initial={{ opacity: 0, y: -14, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 22 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- the app's icon, a small svg */}
      <img className="v2-notif-ic" src="/icon.svg" alt="" width={34} height={34} />
      <div>
        <p className="v2-notif-top">
          <b>Lampsill</b>
          <span>{when}</span>
        </p>
        <p className="v2-notif-t">{t}</p>
        <p className="v2-notif-d">{d}</p>
      </div>
    </motion.div>
  );
}

const TILES = ['It asks them first', 'You choose how long', 'Their note', 'Nobody panics twice', 'Away for a few days', 'Something for them'];

export default function Features() {
  // on a phone the tiles are a row you swipe through
  const row = useRef<HTMLDivElement>(null);
  const at = useSwipeIndex(row);
  return (
    <section className="v2-features" id="features" aria-labelledby="v2-features-h">
      <div className="v2-wrap">
        <motion.div
          className="v2-head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
        >
          <p className="v2-eyebrow">What&rsquo;s in it</p>
          <h2 id="v2-features-h" className="v2-h2">
            A small app. <em>Careful where it counts.</em>
          </h2>
        </motion.div>

        <div className="v2-bento" ref={row}>
          <Tile className="big ask" i={0}>
            <div className="v2-tile-copy">
              <h3>It asks them first</h3>
              <p>
                Before anyone is told, their own phone asks &ldquo;Are you OK?&rdquo; A late night or a flat
                battery ends with one tap, and nobody is bothered.
              </p>
            </div>
            <AskPhone />
          </Tile>

          <Tile className="wide" i={1}>
            <div className="v2-tile-copy">
              <h3>You choose how long</h3>
              <p>How long their phone can go unused before they&rsquo;re asked. They can change it too.</p>
            </div>
            <HowLong />
          </Tile>

          <Tile i={2}>
            <div className="v2-tile-copy">
              <h3>Their note, when it matters</h3>
              <p>Kept private, and shown only if you&rsquo;re told.</p>
            </div>
            <div className="v2-note-card">
              <svg className="v2-note-house" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                <path d="M3.5 9.5L10 4l6.5 5.5V16h-13z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="v2-note-k">Asha&rsquo;s note</p>
                <p>Spare key is with Mrs Iyer at no.&nbsp;12.</p>
                <p>Dr Shah: 020 7946 0018.</p>
              </div>
            </div>
          </Tile>

          <Tile i={3}>
            <div className="v2-tile-copy">
              <h3>Nobody panics twice</h3>
              <p>When one of you is checking, everyone else looking out is told.</p>
            </div>
            <div className="v2-lock">
              <p className="v2-lock-k">On Ade&rsquo;s phone</p>
              <Notif t="Asha’s phone hasn’t been used" d="This isn’t an emergency alert. Nothing is known." when="21:10" />
              <Notif t="Ravi is checking on Asha" d="You’ll be told here when it’s picked up again." when="21:12" delay={0.9} />
            </div>
          </Tile>

          <Tile className="wide" i={4}>
            <div className="v2-tile-copy">
              <h3>Away for a few days</h3>
              <p>A trip, a hospital stay, a week at yours. They choose, and it switches itself back on.</p>
            </div>
            <Away />
          </Tile>

          <Tile i={5}>
            <div className="v2-tile-copy">
              <h3>Something for them, too</h3>
              <p>Reminders, notes and a step count, free, on their own phone and nobody else&rsquo;s.</p>
            </div>
            <div className="v2-lock">
              <p className="v2-lock-k">On Asha&rsquo;s phone</p>
              <Notif t="Morning tablets" d="Your reminder for 8:00am." when="08:00" />
              <Notif t="Water the plants" d="Your reminder for 6:30pm." when="18:30" delay={0.5} />
            </div>
          </Tile>
        </div>
        <Dots n={TILES.length} at={at} onPick={(i) => goTo(row, i)} label={(i) => `Show: ${TILES[i]}`} className="v2-only-m" />
      </div>
    </section>
  );
}
