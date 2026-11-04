'use client';

import { useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { PlayBadge } from '../PlayBadge';

/**
 * The last screen: a house at night, and a pull cord — the same cord that
 * hangs on the app's home screen. Pull it (drag, tap, or Enter) and the
 * house's window comes up to full warmth.
 *
 * Nothing is hidden behind the pull: the badge and the words are there in the
 * dark too. The light is the reward, not the gate.
 */
export default function LampCta() {
  const calm = useReducedMotion();
  const [on, setOn] = useState(false);
  const dragged = useRef(false);
  const y = useMotionValue(0);
  const cord = useTransform(y, (v) => 150 + Math.max(0, v));

  const toggle = () => setOn((o) => !o);

  return (
    <section className={`v2-cta ${on ? 'on' : ''}`} id="get" aria-labelledby="v2-cta-h">
      {/* links to /#join from the early-access days land here */}
      <span id="join" aria-hidden="true" />
      <motion.img
        className="v2-cta-photo"
        src="/v2/house-lit-window.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        animate={{ filter: on ? 'brightness(1.15) saturate(1.1)' : 'brightness(0.5) saturate(0.7)' }}
        transition={{ duration: calm ? 0 : 1.2 }}
      />
      <motion.div
        className="v2-cta-glow"
        animate={{ opacity: on ? 1 : 0 }}
        transition={{ duration: calm ? 0 : 1.2 }}
        aria-hidden="true"
      />
      <div className="v2-cta-shade" aria-hidden="true" />

      <div className="v2-cord">
        <svg viewBox="0 0 40 260" aria-hidden="true">
          <motion.line x1="20" y1="0" x2="20" y2={cord} className="v2-cord-line" />
        </svg>
        <motion.button
          type="button"
          className="v2-pull"
          aria-pressed={on}
          aria-label={on ? 'Switch the light off' : 'Switch the light on'}
          drag={calm ? false : 'y'}
          dragConstraints={{ top: 0, bottom: 70 }}
          dragElastic={0.25}
          dragSnapToOrigin
          style={{ y }}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 30) toggle();
            window.setTimeout(() => (dragged.current = false), 0);
          }}
          onClick={() => {
            if (dragged.current) return;
            toggle();
            if (!calm) animate(y, [0, 40, 0], { duration: 0.45 });
          }}
        >
          <span className="v2-pull-knob" />
        </motion.button>
        <motion.p className="v2-pull-hint" animate={{ opacity: on ? 0 : 1 }}>
          Pull
        </motion.p>
      </div>

      <div className="v2-wrap v2-cta-copy">
        <h2 id="v2-cta-h" className="v2-h2 big">
          Leave a light on <em>for them.</em>
        </h2>
        <p className="v2-body">Two minutes to set up. Then nothing, unless it matters.</p>
        <motion.div
          className="v2-cta-badge"
          animate={on && !calm ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <PlayBadge height={64} />
        </motion.div>
        <p className="v2-fine">
          Lampsill is not an emergency service. It can&rsquo;t tell why a phone isn&rsquo;t used. If you&rsquo;re
          worried right now, call them, or your local emergency number.
        </p>
      </div>
    </section>
  );
}
