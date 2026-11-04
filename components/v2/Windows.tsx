'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { LAMP, VESPER } from './Arch';

/**
 * WHO IT'S FOR. A block of flats at night: every window an evening going on.
 * Four of them are the mark's own window, and each is someone who lives on
 * their own. It isn't only parents.
 *
 * Window rules (window-figure-rules): every window here is lit, because every
 * light here is on. Nothing is drawn dark or as a warning; this is about who,
 * not about something going wrong.
 */
const PEOPLE = [
  { col: 1, row: 1, tag: 'Mum’s', who: 'Mum, on her own since Dad', line: 'Busy, independent, and two hours away.' },
  { col: 3, row: 3, tag: 'Your brother’s', who: 'Your brother, after the move', line: 'New city, new job, nobody nearby yet.' },
  { col: 0, row: 4, tag: 'Your friend’s', who: 'Your friend who works from home', line: 'Some days she doesn’t see anyone at all.' },
  { col: 4, row: 2, tag: 'Your', who: 'You, if you live alone too', line: 'It works the other way round: someone looks out for you.' },
];

const COLS = 5;
const ROWS = 6;
const CW = 72; // cell
const X0 = 30;
const Y0 = 64;
// every other window: an ordinary evening. Mostly lamplight, a few lit by a
// television, a few with the lamp turned low.
const LIGHTS = [
  { fill: '#FFD99A', o: 0.78 },
  { fill: '#F5C97B', o: 0.6 },
  { fill: '#8FBCE0', o: 0.42 },
  { fill: '#FFE7BC', o: 0.88 },
  { fill: '#F5C97B', o: 0.32 },
];
const light = (c: number, r: number) => LIGHTS[(c * 7 + r * 13) % LIGHTS.length];
const FRAME = 'M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z';

export default function Windows() {
  const calm = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  const [at, setAt] = useState(0);
  const [held, setHeld] = useState(false);

  // until the reader picks one, the light moves from window to window
  useEffect(() => {
    if (!seen || held || calm) return;
    const t = window.setInterval(() => setAt((a) => (a + 1) % PEOPLE.length), 3200);
    return () => window.clearInterval(t);
  }, [seen, held, calm]);

  const isPerson = (c: number, r: number) => PEOPLE.findIndex((p) => p.col === c && p.row === r);

  return (
    <section className="v2-who" aria-labelledby="v2-who-h">
      <div className="v2-wrap v2-who-grid" ref={ref}>
        <div className="v2-who-copy">
          <p className="v2-eyebrow">Who it&rsquo;s for</p>
          <h2 id="v2-who-h" className="v2-h2">
            Someone you love lives behind <em>one of these windows.</em>
          </h2>
        </div>

        <div className="v2-who-people">
          <p className="v2-who-line" aria-live="polite">
            {PEOPLE[at].line}
          </p>
          <ul className="v2-who-list">
            {PEOPLE.map((p, i) => (
              <li key={p.who}>
                <button
                  type="button"
                  aria-pressed={i === at}
                  onClick={() => {
                    setAt(i);
                    setHeld(true);
                  }}
                  onPointerEnter={() => {
                    setAt(i);
                    setHeld(true);
                  }}
                >
                  {i === at && <motion.span layoutId="v2-who-pill" className="v2-who-pill" />}
                  <span className="v2-who-n">0{i + 1}</span>
                  <span className="v2-who-t">
                    <b>{p.who}</b>
                    <span>{p.line}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="v2-who-stage" aria-hidden="true">
          <svg viewBox="0 0 420 520" className="v2-block">
            <defs>
              <linearGradient id="v2-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#141E25" />
                <stop offset="1" stopColor="#0C1317" />
              </linearGradient>
              <radialGradient id="v2-warm" cx="50%" cy="50%" r="50%">
                <stop offset="0" stopColor={LAMP} stopOpacity="0.55" />
                <stop offset="1" stopColor={LAMP} stopOpacity="0" />
              </radialGradient>
            </defs>
            {/* the block, its roofline and a few chimney stacks */}
            <rect x="14" y="40" width="392" height="480" rx="6" fill="url(#v2-wall)" stroke="#22303A" />
            <rect x="60" y="22" width="26" height="22" fill="#121A20" stroke="#22303A" />
            <rect x="320" y="14" width="30" height="30" fill="#121A20" stroke="#22303A" />
            {Array.from({ length: ROWS }).map((_, r) =>
              Array.from({ length: COLS }).map((__, c) => {
                const x = X0 + c * (CW + 4);
                const y = Y0 + r * (CW + 0);
                const p = isPerson(c, r);
                if (p >= 0) {
                  const on = p === at;
                  return (
                    <g key={`${c}-${r}`} transform={`translate(${x} ${y - 6}) scale(1.12)`}>
                      <motion.circle
                        cx="32"
                        cy="36"
                        r="40"
                        fill="url(#v2-warm)"
                        initial={false}
                        animate={{ opacity: seen && on ? 1 : 0 }}
                        transition={{ duration: 0.8 }}
                      />
                      <path d={FRAME} fill="#1A242B" />
                      <path d={FRAME} fill={LAMP} opacity="0.1" />
                      {/* the mark's own pane: lit, because their light is on */}
                      <motion.rect
                        x="20"
                        y="37.5"
                        width="9"
                        height="10.5"
                        rx="1"
                        fill={LAMP}
                        initial={false}
                        animate={{ opacity: seen ? (on ? 1 : 0.65) : 0 }}
                        transition={{ duration: 0.6 }}
                      />
                      <motion.path
                        d={FRAME}
                        fill="none"
                        strokeWidth="4.8"
                        strokeLinejoin="round"
                        initial={false}
                        animate={{ stroke: on ? VESPER : '#5B6B73' }}
                        transition={{ duration: 0.5 }}
                      />
                      <path d="M32 14 L32 52 M17 34 L47 34" stroke={on ? VESPER : '#5B6B73'} strokeWidth="3.2" strokeLinecap="round" opacity="0.5" />
                    </g>
                  );
                }
                return (
                  <g key={`${c}-${r}`}>
                    <rect x={x + 12} y={y + 6} width="48" height="54" rx="3" fill="#0F171C" stroke="#22303A" />
                    <motion.rect
                      x={x + 14}
                      y={y + 8}
                      width="44"
                      height="50"
                      rx="2"
                      fill={light(c, r).fill}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: seen ? light(c, r).o : 0 }}
                      transition={{ duration: 1.2, delay: calm ? 0 : 0.05 * (c + r * COLS) * 0.6 }}
                    />
                    <path d={`M${x + 36} ${y + 8} V${y + 58}`} stroke="#0F171C" strokeWidth="2" opacity="0.6" />
                  </g>
                );
              }),
            )}
            {/* street level */}
            <rect x="0" y="508" width="420" height="12" fill="#0A1014" />
          </svg>
          <motion.div
            key={at}
            className="v2-who-tag"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: seen ? 1 : 0, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              left: `${((X0 + PEOPLE[at].col * (CW + 4) + 36) / 420) * 100}%`,
              top: `${((Y0 + PEOPLE[at].row * CW - 10) / 520) * 100}%`,
            }}
          >
            {PEOPLE[at].tag} light is on
          </motion.div>
        </div>
      </div>
    </section>
  );
}
