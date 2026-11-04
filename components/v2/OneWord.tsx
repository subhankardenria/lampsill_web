'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useInView } from 'framer-motion';
import StateWindow from '../StateWindow';

/**
 * "You see one word, not her day" — shown, not said.
 *
 * One phone, two faces. First, what an app that watches someone shows: a map,
 * a pin, "last seen", the day in numbers. None of it is Lampsill's; it is the
 * thing the visitor is afraid of being, or of doing to their mother. A moment
 * after the section comes into view the phone turns over to Lampsill's real
 * screen: a window and a word. The toggle turns it back, so the comparison is
 * the reader's to repeat.
 */

export default function OneWord() {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { amount: 0.5, once: true });
  const [ours, setOurs] = useState(false);

  useEffect(() => {
    if (!seen) return;
    const t = window.setTimeout(() => setOurs(true), 2400);
    return () => window.clearTimeout(t);
  }, [seen]);

  return (
    <section className="v2-one" id="privacy" ref={ref} aria-labelledby="v2-one-h">
      <div className="v2-wrap v2-one-grid">
        <div>
          <p className="v2-eyebrow">What you see</p>
          <h2 id="v2-one-h" className="v2-h2">
            One word. <em>Not their day.</em>
          </h2>
          <p className="v2-body">
            No map. No step counts. No &ldquo;last seen&rdquo;. Looking out for someone shouldn&rsquo;t mean
            watching them. You see whether their light is on, and that&rsquo;s it.
          </p>

          <div className="v2-switch" role="group" aria-label="Compare what you would see">
            <LayoutGroup id="v2-switch">
              {[
                { on: false, label: 'Watching apps' },
                { on: true, label: 'Lampsill' },
              ].map((o) => (
                <button key={o.label} type="button" aria-pressed={ours === o.on} onClick={() => setOurs(o.on)}>
                  {ours === o.on && <motion.span layoutId="v2-switch-pill" className="v2-switch-pill" />}
                  <span className="v2-switch-label">{o.label}</span>
                </button>
              ))}
            </LayoutGroup>
          </div>

          <ul className="v2-legend">
            <li><StateWindow state="normal" size={26} /><b>On</b><span>their phone is being used</span></li>
            <li><StateWindow state="away" size={26} /><b>Away</b><span>their choice, like a trip away</span></li>
            <li><StateWindow state="quiet" size={26} /><b>Quiet</b><span>it hasn&rsquo;t been, for longer than you chose</span></li>
          </ul>
        </div>

        <div className="v2-one-stage" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={ours ? 'l' : 'w'}
              className={`v2-flip-tag ${ours ? 'ours' : ''}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {ours ? 'Lampsill: what you see' : 'A typical watching app'}
            </motion.p>
          </AnimatePresence>
          <div className="v2-flip">
            <motion.div
              className="v2-flip-in"
              initial={false}
              animate={{ rotateY: ours ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 60, damping: 14 }}
            >
              <div className="v2-flip-face front">
                <Watching />
              </div>
              <div className="v2-flip-face back">
                <img src="/v2/app-light-on.webp" alt="" width={804} height={1748} loading="lazy" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* What a watching app shows: a map, a pin, and the day in numbers. It is
   generic on purpose (no real app's look or name); it is what people fear
   being, or doing to their mother. Bright and busy, against Lampsill's night. */
function Watching() {
  return (
    <div className="v2-w">
      <div className="v2-w-bar">
        <b>11:04</b>
        <span>●●● 41%</span>
      </div>
      <div className="v2-w-head">
        <span className="v2-w-av">M</span>
        <div>
          <b>Mum</b>
          <span>At Tesco Extra · since 11:02</span>
        </div>
      </div>
      <svg className="v2-w-map" viewBox="0 0 300 250">
        <rect width="300" height="250" fill="#E8EBEE" />
        <path d="M0 190 C70 170 110 215 170 200 S260 150 300 160 V250 H0 Z" fill="#C5DFF0" />
        <path d="M200 20 h80 v70 h-60 z" fill="#CFE6C8" />
        <path d="M20 30 h60 v40 h-60 z" fill="#DADFE3" />
        <path d="M110 110 h50 v35 h-50 z" fill="#DADFE3" />
        <g stroke="#FFFFFF" strokeWidth="9" fill="none" strokeLinecap="round">
          <path d="M-10 95 H310" />
          <path d="M95 -10 V260" />
          <path d="M-10 0 L300 175" />
          <path d="M185 -10 L175 260" />
        </g>
        <g stroke="#D3D8DC" strokeWidth="1" fill="none">
          <path d="M-10 90 H310 M-10 100 H310" />
        </g>
        <motion.path
          d="M40 160 C60 120 95 120 95 95 S150 60 182 58"
          fill="none"
          stroke="#E5484D"
          strokeWidth="3.5"
          strokeDasharray="1 7"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8 }}
        />
        <circle cx="182" cy="58" r="18" fill="#E5484D" opacity="0.18">
          <animate attributeName="r" values="12;24;12" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="182" cy="58" r="11" fill="#E5484D" stroke="#fff" strokeWidth="3" />
        <text x="182" y="62" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">M</text>
      </svg>
      <div className="v2-w-sheet">
        <div className="v2-w-row"><span>Last seen</span><b>2 min ago</b></div>
        <div className="v2-w-row"><span>Battery</span><b className="v2-w-batt"><i /> 41%</b></div>
        <div className="v2-w-row"><span>Steps today</span><b>3,402</b></div>
        <div className="v2-w-row"><span>Went to sleep</span><b>11:48 pm</b></div>
        <div className="v2-w-row"><span>Screen time</span><b>3 h 12 m</b></div>
      </div>
    </div>
  );
}
