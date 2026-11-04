'use client';

import { RefObject, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * A row you swipe through on a phone (CSS scroll-snap does the swiping; this
 * only keeps count). `at` is the card nearest the middle of the row.
 */
export function useSwipeIndex(ref: RefObject<HTMLElement | null>) {
  const [at, setAt] = useState(0);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    let raf = 0;
    const read = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const mid = row.scrollLeft + row.clientWidth / 2;
        let best = 0;
        let gap = Infinity;
        Array.from(row.children).forEach((c, i) => {
          const el = c as HTMLElement;
          const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
          if (d < gap) {
            gap = d;
            best = i;
          }
        });
        setAt(best);
      });
    };
    row.addEventListener('scroll', read, { passive: true });
    return () => {
      row.removeEventListener('scroll', read);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
  return at;
}

export function goTo(ref: RefObject<HTMLElement | null>, i: number) {
  const row = ref.current;
  const el = row?.children[i] as HTMLElement | undefined;
  if (!row || !el) return;
  // cards snap to the row's left padding
  const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  row.scrollTo({ left: el.offsetLeft - pad, behavior: calm ? 'auto' : 'smooth' });
}

/** The dots under a swipe row; each one is a button to that card. */
export function Dots({
  n,
  at,
  onPick,
  label,
  className = '',
}: {
  n: number;
  at: number;
  onPick: (i: number) => void;
  label: (i: number) => string;
  className?: string;
}) {
  return (
    <div className={`v2-dots ${className}`.trim()}>
      {Array.from({ length: n }, (_, i) => (
        <button key={i} type="button" aria-label={label(i)} aria-current={i === at ? 'true' : undefined} onClick={() => onPick(i)}>
          <motion.span initial={false} animate={{ width: i === at ? 22 : 7, opacity: i === at ? 1 : 0.4 }} transition={{ type: 'spring', stiffness: 300, damping: 26 }} />
        </button>
      ))}
    </div>
  );
}
