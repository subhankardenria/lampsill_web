'use client';

import { useRef, useState } from 'react';
import { LayoutGroup, motion, useInView } from 'framer-motion';
import { FREE_UNTIL, GRACE_MINUTES } from '@/lib/copy';
import { StoreBadges } from '../StoreBadges';

/**
 * THE GAP. The worry isn't the phone call; it's the days between calls. The
 * reader says how often they speak, and the week is drawn twice: once as it
 * is now (you'd find out at the next call), once with Lampsill (asked first
 * after the hours chosen, you're told GRACE_MINUTES later).
 *
 * Nothing here claims to know what happened. It only measures how long a
 * phone nobody has touched could go unnoticed.
 */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SPAN = 7; // the week drawn, in days from Monday 9am

const OFTEN = [
  { k: 'few', label: 'Every few days', at: 3, big: '3 days', line: 'You’d find out at Thursday’s call.' },
  { k: 'week', label: 'Once a week', at: 6, big: '6 days', line: 'You’d find out at Sunday’s call.' },
  { k: 'less', label: 'When we can', at: SPAN, big: 'A week or more', line: 'You might not find out this week at all.' },
] as const;

const WINDOW_DAYS = 1; // 24 hours, drawn; 12 or 48 are the reader's choice in the app

export default function Gap() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.2 });
  const [k, setK] = useState<(typeof OFTEN)[number]['k']>('week');
  const o = OFTEN.find((x) => x.k === k)!;
  const pct = (d: number) => `${(Math.min(d, SPAN) / SPAN) * 100}%`;
  const spring = { type: 'spring' as const, stiffness: 70, damping: 18 };

  return (
    <section className="v2-gap" aria-labelledby="v2-gap-h">
      <div className="v2-wrap">
        <motion.div
          className="v2-head"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7 }}
        >
          <p className="v2-eyebrow">The gap</p>
          <h2 id="v2-gap-h" className="v2-h2">
            It&rsquo;s not the call you worry about. <em>It&rsquo;s the days between.</em>
          </h2>
          <p className="v2-body">Say her phone isn&rsquo;t touched from Monday morning. How long until you&rsquo;d know?</p>
        </motion.div>

        <div className="v2-gap-card" ref={ref}>
          <div className="v2-gap-ask">
            <span className="v2-gap-q">How often do you speak?</span>
            <div className="v2-switch v2-gap-switch" role="group" aria-label="How often do you speak?">
              <LayoutGroup id="v2-gap">
                {OFTEN.map((x) => (
                  <button key={x.k} type="button" aria-pressed={k === x.k} onClick={() => setK(x.k)}>
                    {k === x.k && <motion.span layoutId="v2-gap-pill" className="v2-switch-pill" />}
                    <span className="v2-switch-label">{x.label}</span>
                  </button>
                ))}
              </LayoutGroup>
            </div>
          </div>

          <div className="v2-gap-chart" aria-hidden="true">
            <div className="v2-gap-days">
              {DAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="v2-gap-lane">
              <span className="v2-gap-lab">Now</span>
              <div className="v2-gap-track">
                <motion.span
                  className={`v2-gap-bar now ${o.at >= SPAN ? 'open' : ''}`}
                  initial={{ width: 0 }}
                  animate={{ width: seen ? pct(o.at) : 0 }}
                  transition={spring}
                />
                {o.at < SPAN && (
                  <motion.span
                    className="v2-gap-pin now"
                    initial={{ left: 0, opacity: 0 }}
                    animate={{ left: seen ? pct(o.at) : 0, opacity: seen ? 1 : 0 }}
                    transition={spring}
                  >
                    <i />
                    <b>The call</b>
                  </motion.span>
                )}
              </div>
            </div>

            <div className="v2-gap-lane">
              <span className="v2-gap-lab lamp">Lampsill</span>
              <div className="v2-gap-track">
                <motion.span
                  className="v2-gap-bar with"
                  initial={{ width: 0 }}
                  animate={{ width: seen ? pct(WINDOW_DAYS) : 0 }}
                  transition={{ ...spring, delay: 0.5 }}
                />
                <motion.span
                  className="v2-gap-pin with"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: seen ? 1 : 0, scale: seen ? 1 : 0.6 }}
                  transition={{ delay: 1.1, type: 'spring', stiffness: 260, damping: 18 }}
                  style={{ left: pct(WINDOW_DAYS) }}
                >
                  <i />
                  <b>You&rsquo;re told</b>
                </motion.span>
              </div>
            </div>
          </div>

          <div className="v2-gap-sum">
            <div>
              <motion.p key={o.big} className="v2-gap-big now" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                {o.big}
              </motion.p>
              <p className="v2-gap-d">{o.line}</p>
            </div>
            <div>
              <p className="v2-gap-big lamp">About a day</p>
              <p className="v2-gap-d">
                Her phone asks &ldquo;Are you OK?&rdquo; first. No answer, and you&rsquo;re told {GRACE_MINUTES}{' '}
                minutes later.
              </p>
            </div>
          </div>

          <div className="v2-gap-cta">
            <StoreBadges size={40} />
            <span>Free until {FREE_UNTIL}. Two minutes to set up.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
