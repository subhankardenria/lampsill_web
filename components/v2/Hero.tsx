'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import Phone3D from './Phone3D';
import { PlayBadge } from '../PlayBadge';
import { FREE_UNTIL } from '@/lib/copy';

/* The line that changes. All of them sit in one grid cell, so the box is as
   tall as the tallest and the page never moves when they swap. */
const WHY = ['You’re miles away.', 'You’re at work.', 'You’re abroad.'];

/* What floats beside the phones, in the app's own words (SilenceNotices,
   PushPayloads, the looking-out screen). One at a time, so it reads as a
   life going on rather than a dashboard. */
const NEWS = [
  { k: 'on', t: 'Asha’s light is on', d: 'Her phone is being used as usual' },
  { k: 'ask', t: 'Are you OK?', d: 'Asked on her phone first, if it goes unused' },
  { k: 'ok', t: 'I’m OK', d: 'One tap from her, and nobody is told' },
];

export default function Hero() {
  const calm = useReducedMotion() ?? false;
  const root = useRef<HTMLElement>(null);
  const [w, setW] = useState(0);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (calm) return;
    const a = window.setInterval(() => setW((x) => (x + 1) % WHY.length), 2800);
    const b = window.setInterval(() => setN((x) => (x + 1) % NEWS.length), 3600);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, [calm]);

  // the pointer turns both phones a little, like picking them up
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 70, damping: 18 });
  const sy = useSpring(py, { stiffness: 70, damping: 18 });
  const frontY = useTransform(sx, (v) => -16 + v * 10);
  const frontX = useTransform(sy, (v) => 6 - v * 7);
  const backY = useTransform(sx, (v) => 20 + v * 8);
  const backX = useTransform(sy, (v) => 4 - v * 5);

  useEffect(() => {
    if (calm || !window.matchMedia('(pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      px.set((e.clientX / window.innerWidth - 0.5) * 2);
      py.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [calm, px, py]);

  // leaving the hero: the photo sinks slowest, the phones a little faster
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const phonesY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const words = ['They', 'live', 'alone.'];
  const rise = (d: number) =>
    calm ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: d, duration: 0.7 } };

  return (
    <section className="v2-hero" ref={root}>
      {/* a real street at night: every lit window is somebody's evening */}
      <motion.div className="v2-hero-photo" style={calm ? undefined : { y: photoY }} aria-hidden="true">
        <motion.img
          src="/v2/tower-night.webp"
          alt=""
          initial={calm ? false : { scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
      <div className="v2-hero-shade" aria-hidden="true" />

      <div className="v2-wrap v2-hero-grid">
        <div className="v2-hero-copy">
          <motion.p className="v2-eyebrow" {...rise(0)}>
            For anyone you love who lives alone
          </motion.p>

          <h1 className="v2-h1">
            <span className="v2-h1-line">
              {words.map((word, i) => (
                <span className="v2-mask" key={word}>
                  <motion.span
                    initial={calm ? false : { y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </span>
            <span className="v2-why">
              {WHY.map((p) => (
                <span className="v2-why-size" key={p} aria-hidden="true">
                  {p}
                </span>
              ))}
              <AnimatePresence initial={false}>
                <motion.em
                  key={w}
                  className="v2-why-now"
                  initial={{ opacity: 0, y: '0.4em', filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: '-0.4em', filter: 'blur(6px)' }}
                  transition={{ duration: 0.45 }}
                >
                  {WHY[w]}
                </motion.em>
              </AnimatePresence>
            </span>
          </h1>

          <motion.p className="v2-lede" {...rise(0.6)}>
            Lampsill is an app that notices when their phone hasn&rsquo;t been used for a while. It asks them{' '}
            <b>&ldquo;Are you OK?&rdquo;</b> first. If they don&rsquo;t answer, it tells you, with one tap to call
            them or someone nearby.
          </motion.p>

          <motion.div className="v2-hero-cta" {...rise(0.75)}>
            <PlayBadge height={56} />
            <a className="v2-ghost" href="#how">
              See how it works <span aria-hidden="true">&darr;</span>
            </a>
          </motion.div>

        </div>

        <motion.div
          className="v2-hero-phones"
          style={calm ? undefined : { y: phonesY }}
          initial={calm ? false : { opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <div className="v2-hero-back">
            <Phone3D src="/v2/app-their-home.webp" rotateX={backX} rotateY={backY} />
            <span className="v2-phone-label">Asha&rsquo;s phone</span>
          </div>
          <div className="v2-hero-front">
            <Phone3D src="/v2/app-light-on.webp" rotateX={frontX} rotateY={frontY} />
            <span className="v2-phone-label">Your phone</span>
          </div>

          <div className="v2-news">
            <AnimatePresence mode="wait">
              <motion.div
                key={NEWS[n].k}
                className={`v2-news-card ${NEWS[n].k}`}
                initial={{ opacity: 0, y: 18, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              >
                <span className="v2-news-dot" />
                <div>
                  <p className="v2-news-t">{NEWS[n].t}</p>
                  <p className="v2-news-d">{NEWS[n].d}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* beside the words on a computer; under the phones on a phone */}
        <motion.ul className="v2-trust" {...rise(0.9)}>
          <li>
            <Tick /> Free until {FREE_UNTIL}
          </li>
          <li>
            <Tick /> Nothing for them to do each day
          </li>
          <li>
            <Tick /> No location. No maps.
          </li>
        </motion.ul>
      </div>
    </section>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="rgba(245,201,123,.14)" />
      <path d="M4.8 8.3l2.1 2.1 4.3-4.6" fill="none" stroke="#F5C97B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
