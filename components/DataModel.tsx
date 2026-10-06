'use client';

import { useEffect, useRef } from 'react';
import { FAMILY } from '@/lib/copy';
import StateWindow, { type WindowState } from './StateWindow';

/* The four things the app can show about someone, each with its window —
   exactly as it draws them beside a person's name. */
const STATES: [WindowState, string][] = [
  ['normal', 'Normal'],
  ['paused', 'Paused'],
  ['lost', 'Permission lost'],
  ['quiet', 'Phone gone quiet'],
];

/**
 * "You see one word, not her day", drawn as a swarm of dots against a single
 * word.
 *
 * The swarm is deliberately unlabelled and slightly uncomfortable — no
 * invented statistic, no named competitor, no claim about what any other app
 * collects. It is a shape that means "a lot", next to a shape that means
 * "one". The sentence underneath does the actual arguing.
 *
 * Canvas rather than 400 DOM nodes: the dots drift, and drifting 400 elements
 * on the main thread is how a scroll gets janky.
 */
export default function DataModel() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    type Dot = { x: number; y: number; vx: number; vy: number; r: number };
    let dots: Dot[] = [];

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = Array.from({ length: 320 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.4 + 0.5,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(143,188,224,0.30)';
      for (const d of dots) {
        if (!calm) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0) d.x = w;
          if (d.x > w) d.x = 0;
          if (d.y < 0) d.y = h;
          if (d.y > h) d.y = 0;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!calm) raf = requestAnimationFrame(draw);
    };

    size();
    draw();
    const onResize = () => {
      size();
      if (calm) draw();
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <section className="section" id="privacy">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: '2.5rem' }}>
          <p className="eyebrow">What you see, day to day</p>
          <h2>
            One word.
            <br />
            Not their day.
          </h2>
          <p className="lede">
            A lit window and one word. Never where they went, who they saw, or when
            they woke up.
          </p>
        </div>

        <div className="dm-grid reveal">
          <figure className="dm-panel lit">
            <canvas ref={canvas} className="dm-canvas" aria-hidden="true" />
            <figcaption>
              <span className="dm-label">What tracking apps often show</span>
              <span className="dm-sub">Location, steps, sleep, heart rate, daily reports</span>
            </figcaption>
          </figure>

          <figure className="dm-panel lit dm-one">
            <div className="dm-single">
              <StateWindow state="normal" size={64} />
              <span className="dm-word">Normal</span>
            </div>
            <figcaption>
              <span className="dm-label">What Lampsill shows you</span>
              <span className="dm-sub">One window, one of {FAMILY.states.length} words</span>
            </figcaption>
          </figure>
        </div>

        {/* The whole vocabulary, as the app draws it. A lit window is the only
            one that needs no reading. */}
        <ul className="dm-states reveal" aria-label="Everything Lampsill can show you about someone">
          {STATES.map(([state, word]) => (
            <li key={state} data-state={state}>
              <StateWindow state={state} size={34} />
              <span>{word}</span>
            </li>
          ))}
        </ul>

        <p className="lede reveal" style={{ marginTop: '2rem' }}>
          No timeline, no report, no map. Lampsill doesn&rsquo;t even ask for location.
        </p>
      </div>
    </section>
  );
}
