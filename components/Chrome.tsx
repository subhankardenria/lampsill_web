'use client';

import { useEffect, useRef, useState } from 'react';
import { Price } from './Price';
import { EARLY_ACCESS } from '@/lib/copy';

/** The standard cut of the mark. Same paths, widths and opacities everywhere
 *  it appears; only favicon.svg is allowed to differ, and it says why. */
export function Mark({ className = 'mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="13.5 9.5 37 45" role="img" aria-label="Lampsill">
      <g fill="none" stroke="var(--vesper)" strokeWidth="4.8" strokeLinejoin="round">
        <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" />
      </g>
      <g fill="none" stroke="var(--vesper)" strokeWidth="3.2" strokeLinecap="round" opacity="0.5">
        <path d="M32 13 L32 52" />
        <path d="M17 34 L47 34" />
      </g>
      <rect x="20" y="37.5" width="9" height="10.5" rx="1" fill="var(--lamp)" />
    </svg>
  );
}

/**
 * Masthead and the scroll-progress hairline.
 *
 * The bar frosts once you have left the hero rather than being frosted from
 * the start, so the first screen is uninterrupted and the bar earns its
 * background by being needed.
 */
export function Masthead() {
  const [stuck, setStuck] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setStuck(y > 40);
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        if (bar.current) {
          bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header className={`masthead${stuck ? ' stuck' : ''}`}>
      <div className="wrap masthead-in">
        <a className="lockup" href="#main" aria-label="Lampsill, back to top">
          <Mark />
          <span className="wordmark">Lampsill</span>
        </a>
        <nav className="mast-nav">
          <a href="#how">How it works</a>
          <a href="#story">A story</a>
          <a href="#faq">Questions</a>
          <a className="btn lamp mast-cta" href="#join">
            {EARLY_ACCESS.freeSpots} free places
          </a>
        </nav>
      </div>
      <div className="progress" aria-hidden="true">
        <div className="progress-bar" ref={bar} />
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="lockup">
          <Mark />
          <span className="wordmark">Lampsill</span>
        </div>
        <p>
          For anyone you love who lives alone. If their phone goes quiet, it rings
          them first. No answer? You&rsquo;re told, and one tap asks someone nearby
          to check. From <Price plan="month" /> a month.
        </p>
        <p className="footer-small">
          Lampsill is not an emergency service. It can&rsquo;t detect a fall or a
          medical problem. In an emergency, call your local emergency number.
        </p>
        <p className="footer-small">
          <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>
        </p>
      </div>
    </footer>
  );
}

/**
 * Marks anything with `.reveal` as seen once it scrolls in. One observer for
 * the whole page rather than one per section.
 *
 * IT SETS AN ATTRIBUTE, NOT A CLASS, and that is the fix for the dial vanishing
 * the moment you pressed it. This used to `classList.add('seen')` — a change
 * React knows nothing about. The dial's className is React state (it gains
 * `dragging` while held), so pressing it made React rewrite the whole class
 * attribute from its own idea of it, `seen` was wiped, `.reveal` dropped back
 * to opacity 0, and since the observer had already stopped watching that
 * element nothing ever put it back.
 *
 * React only ever writes the attributes it renders. `data-seen` is never
 * rendered by any component, so no re-render anywhere can clear it.
 */
export function Reveals() {
  useEffect(() => {
    // React is running: cancel the no-JS failsafe set up in layout.tsx.
    document.documentElement.setAttribute('data-ready', '');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const io = calm
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                e.target.setAttribute('data-seen', '');
                io?.unobserve(e.target);
              }
            });
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
        );

    const watch = (el: Element) => {
      if (el.hasAttribute('data-seen')) return;
      if (calm) el.setAttribute('data-seen', '');
      else io?.observe(el);
    };
    document.querySelectorAll('.reveal').forEach(watch);

    /* AND EVERY .reveal THAT APPEARS LATER. This used to collect the page's
       .reveal elements once, on load. The story remounts when the reader picks
       a tab, which replaces its header with a brand-new element the observer
       had never been given — so after any tab switch "Anna, Maya, Leo, and one
       Tuesday night" sat at opacity 0 forever, even scrolled into view, even
       after switching back. Watching for added nodes means no remount anywhere
       on the page can leave something invisible. Observing an element already
       on screen fires immediately, so a header that remounts in view reveals
       straight away. */
    const mo = new MutationObserver((records) => {
      records.forEach((r) =>
        r.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          if (n.matches('.reveal')) watch(n);
          n.querySelectorAll('.reveal').forEach(watch);
        }),
      );
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, []);
  return null;
}
