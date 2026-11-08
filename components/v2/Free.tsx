'use client';

import { motion } from 'framer-motion';
import { APP_STORE_URL, FREE_UNTIL } from '@/lib/copy';
import { StoreBadges } from '../StoreBadges';

/**
 * The price, while payments are paused (PRICING_PAUSED in lib/copy.ts): free
 * until FREE_UNTIL, for everyone. After it, the same words as the FAQ and the
 * terms: it may stay free or there may be a small charge, never without agreeing.
 */
const IN_IT = [
  'Told if their phone isn’t used',
  '“Are you OK?” on their phone first',
  'Everyone you look out for, on one account',
  'One tap to call them or someone nearby',
  'Their note, away mode, reminders and steps',
];

export default function Free() {
  return (
    <section className="v2-free" id="price" aria-labelledby="v2-free-h">
      <div className="v2-wrap">
        <motion.div
          className="v2-free-card"
          initial={{ opacity: 0, y: 40, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="v2-eyebrow">Price</p>
            <h2 id="v2-free-h" className="v2-h2">
              Free until <em>{FREE_UNTIL}.</em>
            </h2>
            <p className="v2-body">All of it, for everyone. No card, no trial to cancel. After January it may stay free, or there may be a small charge. You&rsquo;ll hear well before, and nothing is charged unless you agree.</p>
            <StoreBadges size={40} pair />
            {APP_STORE_URL ? null : <p className="v2-free-ios">On Android now. Coming to iPhone soon.</p>}
          </div>
          <ul className="v2-free-list">
            {IN_IT.map((x, i) => (
              <motion.li
                key={x}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.07 }}
              >
                <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
                  <path d="M3.5 8.4l2.9 2.9 6-6.4" fill="none" stroke="#F5C97B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {x}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
