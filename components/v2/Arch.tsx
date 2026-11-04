'use client';

import { motion, isMotionValue, type MotionValue } from 'framer-motion';

/**
 * The mark's window, with its two moving parts exposed: how lit the pane is,
 * and the frame's colour. Same paths and stroke widths as Mark in Chrome.tsx
 * and StateWindow.tsx — the mark is not redrawn per placement.
 *
 * Colours are hex, not var(--vesper): Framer Motion can tween between two
 * colours but not between two custom properties. /v2 is night-only, so the
 * dark tokens are the only ones it needs.
 *
 * A motion value goes in `style` (it drives the attribute every frame); a
 * plain value goes in `animate`, so a change — "On" to "Quiet" — tweens
 * instead of being ignored. A plain number in `style` is read once, on mount.
 */
export const VESPER = '#8FBCE0';
export const EMBER = '#F0A184';
export const LAMP = '#F5C97B';

const FRAME = 'M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z';

type N = number | MotionValue<number>;
type C = string | MotionValue<string>;

const EASE = { duration: 0.5 };
const stroke = (v: C) => ({
  initial: false as const,
  style: isMotionValue(v) ? { stroke: v } : undefined,
  animate: isMotionValue(v) ? undefined : { stroke: v as string },
  transition: EASE,
});
const opacity = (v: N) => ({
  initial: false as const,
  style: isMotionValue(v) ? { opacity: v } : undefined,
  animate: isMotionValue(v) ? undefined : { opacity: v as number },
  transition: EASE,
});

export default function Arch({
  pane = 1,
  frame = VESPER,
  className,
}: {
  pane?: N;
  frame?: C;
  className?: string;
}) {
  return (
    <svg viewBox="13.6 9.6 36.8 44.8" className={className} aria-hidden="true">
      <motion.path d={FRAME} fill="none" strokeWidth="4.8" strokeLinejoin="round" {...stroke(frame)} />
      <motion.g fill="none" strokeWidth="3.2" strokeLinecap="round" opacity="0.5" {...stroke(frame)}>
        <path d="M32 14 L32 52" />
        <path d="M17 34 L47 34" />
      </motion.g>
      <motion.rect x="20" y="37.5" width="9" height="10.5" rx="1" fill={LAMP} {...opacity(pane)} />
    </svg>
  );
}
