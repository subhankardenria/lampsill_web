'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Inertial scrolling, and the wiring that stops it fighting ScrollTrigger.
 *
 * Lenis moves the page on its own rAF rather than letting the browser scroll
 * natively, which is most of why this site feels like it has weight. The two
 * lines that matter are the ones below the Lenis constructor: without them,
 * ScrollTrigger reads scroll positions on a different clock from the one Lenis
 * is writing them on, and every scrubbed animation lags the page by a frame or
 * two — which looks exactly like a slow site.
 *
 * Reduced motion turns the inertia off completely and hands scrolling back to
 * the browser. Smoothed scrolling is precisely the sort of motion somebody who
 * sets that flag is asking not to have.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      // A shallow exponential: fast to respond, slow to settle.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // In-page anchors have to go through Lenis too, or clicking one teleports
    // the page while the inertia carries on from where it was.
    const onClick = (e: MouseEvent) => {
      // a link that handled itself (the hero's story button) must not also scroll
      if (e.defaultPrevented) return;
      const el = (e.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!el) return;
      const id = el.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      // Clear the sticky masthead. A fixed -24 left every section's eyebrow
      // hidden underneath it, so "How it works" landed on a page with its own
      // label missing. Measured, because the masthead's height changes with
      // the font load and the viewport.
      const header = document.querySelector('.masthead') as HTMLElement | null;
      const clearance = (header?.getBoundingClientRect().height ?? 0) + 20;
      lenis.scrollTo(target as HTMLElement, { offset: -clearance });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
