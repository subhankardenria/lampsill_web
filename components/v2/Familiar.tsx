'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import Arch, { VESPER } from './Arch';

/**
 * "SOUND FAMILIAR?" One ordinary evening, from two homes at once. You ring,
 * it rings out, you text, you ring again. Two hours away she's out with
 * friends, phone on silent, and is fine. From where you are, nothing and
 * something look exactly the same; that is the feeling the product answers.
 *
 * Photographs from Unsplash (free licence, no attribution required; ids in
 * public/v2/CREDITS.txt). Everything over them is drawn here.
 */
type Ev = {
  who: 'you' | 'her';
  at: string;
  kind: 'call' | 'missed' | 'msg' | 'think' | 'note' | 'notif' | 'reply';
  t: string;
  d?: string;
};

const EVENING: Ev[] = [
  { who: 'you', at: '19:02', kind: 'call', t: 'Calling Mum…', d: 'Ringing' },
  { who: 'you', at: '19:03', kind: 'missed', t: 'Mum', d: 'No answer' },
  { who: 'you', at: '19:05', kind: 'msg', t: 'Mum, ring me when you see this x', d: 'Delivered' },
  { who: 'her', at: '19:40', kind: 'note', t: 'Out with Pat and June.', d: 'Phone on silent, in her bag.' },
  { who: 'you', at: '20:31', kind: 'missed', t: 'Mum', d: 'No answer · third try' },
  { who: 'you', at: '21:15', kind: 'think', t: 'Is it too late to knock next door?' },
  { who: 'her', at: '21:48', kind: 'notif', t: '3 missed calls, 1 message', d: 'From you' },
  { who: 'her', at: '21:52', kind: 'reply', t: 'Sorry love, was out! All fine x' },
];

function Card({ e }: { e: Ev }) {
  switch (e.kind) {
    case 'call':
      return (
        <div className="v2-ev v2-ev-call">
          <span className="v2-ev-ring" aria-hidden="true">
            <PhoneIcon />
          </span>
          <div>
            <b>{e.t}</b>
            <span>{e.d}</span>
          </div>
        </div>
      );
    case 'missed':
      return (
        <div className="v2-ev v2-ev-missed">
          <span className="v2-ev-ic" aria-hidden="true">
            <PhoneIcon />
          </span>
          <div>
            <b>{e.t}</b>
            <span className="warn">{e.d}</span>
          </div>
        </div>
      );
    case 'msg':
      return (
        <div className="v2-ev-bubble me">
          {e.t}
          <small>{e.d}</small>
        </div>
      );
    case 'reply':
      return <div className="v2-ev-bubble them">{e.t}</div>;
    case 'think':
      return <div className="v2-ev-think">{e.t}</div>;
    case 'note':
      return (
        <div className="v2-ev-note">
          <b>{e.t}</b> {e.d}
        </div>
      );
    case 'notif':
      return (
        <div className="v2-ev v2-ev-notif">
          <span className="v2-ev-ic" aria-hidden="true">
            <PhoneIcon />
          </span>
          <div>
            <b>{e.t}</b>
            <span>{e.d}</span>
          </div>
        </div>
      );
  }
}

export default function Familiar() {
  const calm = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  const [n, setN] = useState(0);
  const [round, setRound] = useState(0);
  const done = n >= EVENING.length;

  useEffect(() => {
    if (!seen) return;
    if (calm) {
      setN(EVENING.length);
      return;
    }
    if (done) return;
    const t = window.setTimeout(() => setN((x) => x + 1), n === 0 ? 400 : 1500);
    return () => window.clearTimeout(t);
  }, [seen, n, calm, done, round]);

  const clock = n === 0 ? '19:00' : EVENING[n - 1].at;

  return (
    <section className="v2-familiar" id="story" aria-labelledby="v2-familiar-h">
      <div className="v2-wrap">
        <motion.div
          className="v2-head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
        >
          <p className="v2-eyebrow">Sound familiar?</p>
          <h2 id="v2-familiar-h" className="v2-h2">
            Nobody wants to watch their parents. <em>Nobody wants to be the last to know.</em>
          </h2>
        </motion.div>

        <div className="v2-eve" ref={ref}>
          <figure className="v2-eve-photo you">
            <img src="/v2/you-at-night.webp" alt="" width={720} height={900} loading="lazy" />
            <figcaption>
              <b>You</b> at home
            </figcaption>
          </figure>

          <div className="v2-eve-feed" aria-live="polite">
            <div className="v2-eve-clock" aria-label={`The time: ${clock}`}>
              <span>Tuesday evening</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.b
                  key={clock}
                  initial={{ y: '60%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '-60%', opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {clock}
                </motion.b>
              </AnimatePresence>
            </div>
            <ol className="v2-eve-list">
              <AnimatePresence initial={false}>
                {EVENING.slice(0, n).map((e, i) => (
                  <motion.li
                    key={`${round}-${i}`}
                    className={e.who}
                    layout
                    initial={{ opacity: 0, x: e.who === 'you' ? -24 : 24, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  >
                    <span className="v2-eve-at">
                      {e.who === 'you' ? 'You' : 'Mum'} · {e.at}
                    </span>
                    <Card e={e} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </div>

          <figure className="v2-eve-photo her">
            <img src="/v2/mum-out.webp" alt="" width={720} height={900} loading="lazy" />
            <figcaption>
              <b>Mum</b>, two hours away
            </figcaption>
          </figure>
        </div>

        <motion.div
          className="v2-eve-end"
          initial={false}
          animate={{ opacity: done ? 1 : 0, y: done ? 0 : 20 }}
          transition={{ duration: 0.7, delay: calm ? 0 : 0.6 }}
          aria-hidden={!done}
        >
          <p className="v2-eve-moral">
            Most nights it&rsquo;s nothing. <em>But from two hours away, nothing and something look the same.</em>
          </p>
          <div className="v2-eve-lamp">
            <Arch className="v2-eve-win" pane={1} frame={VESPER} />
            <div>
              <b>With Lampsill: Mum&rsquo;s light is on</b>
              <span>Her phone is being used as usual. No ringing round to find out.</span>
            </div>
          </div>
          <button
            type="button"
            className="v2-link v2-eve-again"
            onClick={() => {
              setN(0);
              setRound((r) => r + 1);
            }}
            tabIndex={done ? 0 : -1}
          >
            Play the evening again
          </button>
        </motion.div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16">
      <path
        d="M6.6 3.2l1.6 3.3-1.6 1.2a9.6 9.6 0 004.7 4.7l1.2-1.6 3.3 1.6-.6 2.6c-.1.5-.6.9-1.1.8C8.3 15.3 4.7 11.7 4 5.9c0-.5.3-1 .8-1.1l1.8-1.6z"
        fill="currentColor"
      />
    </svg>
  );
}
