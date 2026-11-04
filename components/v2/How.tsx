'use client';

import { useEffect, useRef, useState } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Phone3D from './Phone3D';
import { Dots, goTo, useSwipeIndex } from './Swipe';

/**
 * HOW IT WORKS, on the real screens. The phone stays pinned while the four
 * steps scroll past; at each step it swings round and lands on that step's
 * screen, so the turn itself marks "next".
 *
 * On a phone there is no room to pin. Instead one phone sits above a row of
 * step cards you swipe; each swipe turns the phone round to that step's
 * screen, the same "turn means next" as on a computer.
 */
const STEPS = [
  {
    n: '01',
    t: 'Set it up together, once',
    d: 'You start it on your phone and send them a code. They type it in and say yes. About two minutes, and that’s all they ever do.',
    src: '/setup/m3-the-code.webp',
    link: { href: '/setup', label: 'See setup step by step' },
  },
  {
    n: '02',
    t: 'They carry on as usual',
    d: 'Their phone, used as usual, is the check-in. No buttons, no daily call. Their light stays on, and they get free reminders, notes and steps for themselves.',
    src: '/v2/app-their-home.webp',
  },
  {
    n: '03',
    t: 'If it goes quiet, it asks them first',
    d: 'If their phone isn’t used for 12, 24 or 48 hours, your choice, it rings: “Are you OK?” One tap and it’s over. Nobody is told.',
    src: '/v2/app-are-you-ok.webp',
  },
  {
    n: '04',
    t: 'No answer? You’re told',
    d: 'Ten minutes later you’re told, with one tap to call them, or someone nearby, and the note they left for a moment like this.',
    src: '/v2/app-not-used.webp',
  },
];

const SCREENS = STEPS.map((s) => s.src);

export default function How() {
  const calm = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [at, setAt] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(p, 'change', (v) => setAt(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))));

  // one swing per step: the phone turns away between steps and faces you on them
  const swing = useTransform(p, (v) => Math.sin(v * STEPS.length * Math.PI) * -22);
  const rotateY = useSpring(swing, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(p, [0, 1], [8, -4]);
  const bar = useTransform(p, [0, 1], ['0%', '100%']);

  // phones: the swipe row drives the phone
  const row = useRef<HTMLOListElement>(null);
  const mAt = useSwipeIndex(row);
  const mY = useMotionValue(-10);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (calm) return;
    const a = animate(mY, [-10, 24, -10], { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    return () => a.stop();
  }, [mAt, calm, mY]);

  return (
    <section className="v2-how" id="how" ref={ref} aria-labelledby="v2-how-h">
      <div className="v2-how-pin">
        <div className="v2-wrap v2-how-grid">
          <div className="v2-how-copy">
            <p className="v2-eyebrow">How it works</p>
            <h2 id="v2-how-h" className="v2-h2">
              Four steps. <em>Three of them happen by themselves.</em>
            </h2>
            <ol className="v2-steps">
              {STEPS.map((s, i) => (
                <li key={s.n} className={i === at ? 'on' : ''}>
                  <span className="v2-step-n">{s.n}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <motion.div
                      initial={false}
                      animate={{ height: i === at ? 'auto' : 0, opacity: i === at ? 1 : 0 }}
                      transition={{ duration: calm ? 0 : 0.35 }}
                      className="v2-step-d"
                    >
                      <p>{s.d}</p>
                      {s.link && (
                        <a className="v2-link" href={s.link.href}>
                          {s.link.label} <span aria-hidden="true">&rarr;</span>
                        </a>
                      )}
                    </motion.div>
                  </div>
                </li>
              ))}
            </ol>
            <div className="v2-how-bar" aria-hidden="true">
              <motion.span style={{ width: bar }} />
            </div>
          </div>

          <div className="v2-how-stage" aria-hidden="true">
            <div className="v2-how-glow" />
            <Phone3D src={STEPS[at].src} screens={SCREENS} rotateX={calm ? 0 : rotateX} rotateY={calm ? 0 : rotateY} className="big" />
          </div>
        </div>
      </div>

      {/* phones: one phone, and the steps as cards you swipe */}
      <div className="v2-how-m">
        <div className="v2-how-m-stage" aria-hidden="true">
          <div className="v2-how-glow" />
          <Phone3D src={STEPS[mAt].src} screens={SCREENS} rotateX={4} rotateY={calm ? 0 : mY} />
        </div>
        <ol className="v2-steps-m" ref={row}>
          {STEPS.map((s, i) => (
            <li key={s.n} className={i === mAt ? 'on' : ''}>
              <span className="v2-step-n">
                {s.n} <span aria-hidden="true">/ 0{STEPS.length}</span>
              </span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              {s.link && (
                <a className="v2-link" href={s.link.href}>
                  {s.link.label} <span aria-hidden="true">&rarr;</span>
                </a>
              )}
            </li>
          ))}
        </ol>
        <Dots n={STEPS.length} at={mAt} onPick={(i) => goTo(row, i)} label={(i) => `Step ${STEPS[i].n}: ${STEPS[i].t}`} />
      </div>
    </section>
  );
}
