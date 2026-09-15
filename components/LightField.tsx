'use client';

import { useEffect } from 'react';

/**
 * The single light source the whole page is lit by.
 *
 * It writes two custom properties on <html> and nothing else. Everything
 * visible is CSS: `.lightfield` paints the bloom, and every `.lit` surface
 * paints a specular from the same two numbers using `background-attachment:
 * fixed`, so one light falls across many planes without measuring any of them.
 *
 * Three things this deliberately does NOT do:
 *   - write on every pointermove. Pointer events fire far faster than frames;
 *     the handler only stores the target and a rAF does the one write per
 *     frame it is worth doing.
 *   - jump. The value eases toward the pointer, so the light has some mass.
 *     A light that snaps reads as a cursor effect; a light that lags slightly
 *     reads as a lamp being carried.
 *   - follow a finger. On touch there is no hover, and a light that only moves
 *     while you are dragging the page is worse than one that sits still, so
 *     coarse pointers get a fixed, flattering position and no listener at all.
 */
export default function LightField() {
  useEffect(() => {
    const root = document.documentElement;

    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine) return;

    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.32;
    let x = tx;
    let y = ty;
    let raf = 0;
    let running = true;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const frame = () => {
      if (!running) return;
      // Critically damped enough to feel like weight rather than lag. Reduced
      // motion gets the light placed exactly, with no easing to watch.
      const k = calm ? 1 : 0.085;
      x += (tx - x) * k;
      y += (ty - y) * k;
      root.style.setProperty('--lxp', `${(x / window.innerWidth) * 100}%`);
      root.style.setProperty('--lyp', `${(y / window.innerHeight) * 100}%`);
      raf = requestAnimationFrame(frame);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <div className="lightfield" aria-hidden="true" />;
}
