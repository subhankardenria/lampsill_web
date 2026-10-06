'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { PerPrice } from './Price';
import { FREE_UNTIL } from '@/lib/copy';
import Diorama from './Diorama';

/* Both directions of the relationship, in words every English reader shares.
   "Mum", "Dad" and "Gran" were warmer and regional — Mum is British, Mom is
   American, Gran is British again — and the headline is the one line a reader
   anywhere must not have to translate. */
const WHO = ['your mother’s', 'your son’s', 'your father’s', 'your daughter’s', 'your grandmother’s'];

/**
 * The one word in the headline that changes. It rolls up out of a mask the same
 * way the rest of the headline set itself, so it reads as part of the type
 * rather than a ticker bolted onto it.
 *
 * THE SLOT IS MEASURED, NOT RESERVED. The first version held the width of the
 * longest word, which left "If Dad's" followed by a hole the size of "Grandad's"
 * before "phone" — a gap in the middle of a sentence reads as a rendering bug.
 * Now every word is measured once, after the webfont has loaded (measuring
 * before it swaps in gives fallback-font widths), and the slot eases between
 * them, so the rest of the line slides over smoothly instead of jumping.
 */
function RotatingWho() {
  const [i, setI] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const measure = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let alive = true;
    const run = () => {
      const el = measure.current;
      if (!el || !alive) return;
      setWidths(Array.from(el.children).map((c) => (c as HTMLElement).getBoundingClientRect().width));
    };
    document.fonts?.ready.then(run);
    run();
    window.addEventListener('resize', run);
    return () => {
      alive = false;
      window.removeEventListener('resize', run);
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % WHO.length), 2600);
    return () => window.clearInterval(t);
  }, []);

  return (
    <span className="rot" style={widths.length ? { width: widths[i] } : undefined}>
      <span className="rot-measure" ref={measure} aria-hidden="true">
        {WHO.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </span>
      <span className="rot-word" key={i}>
        {WHO[i]}
      </span>
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (calm) {
        gsap.set('.hero-word > span, .hero-fade', { y: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.hero-word > span', { y: '0%', duration: 0.9, stagger: 0.055 })
        .to('.hero-fade', { y: 0, opacity: 1, duration: 0.7, stagger: 0.09 }, 0.45)
        .to('.hero-stage', { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0.15);

      gsap.to('.scroll-cue-dot', {
        y: 9,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, el);

    // pointer parallax
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const fine = window.matchMedia('(pointer: fine)').matches && !calm;

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const frame = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.setProperty('--px', String(cx));
      el.style.setProperty('--py', String(cy));
      raf = requestAnimationFrame(frame);
    };
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      raf = requestAnimationFrame(frame);
    }

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  // Split by word rather than by character. Character-splitting a serif
  // headline breaks the kerning pairs and screen readers read it out letter by
  // letter; word boxes keep both intact.
  const line2 = ['Lampsill', 'tells', 'you.'];

  return (
    <div className="hero" ref={root}>
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="eyebrow hero-fade">For anyone you love who lives alone</p>

          {/* THE HEADLINE NAMES THE RELATIONSHIP. The old one — "How long
              before anyone noticed?" — was a good question and told a skimming
              reader nothing about who the product is for or what it does. This
              one says both in seven words: somebody you love, their phone, you.
              The rotating word does the inclusion so the sentence doesn't have
              to say "a parent, relative or friend". */}
          <h1 aria-label="If someone you love's phone goes quiet, Lampsill tells you.">
            <span aria-hidden="true">
              {/* THREE FIXED LINES. With "your daughter's" in the rotation the
                  first line's length varies by half its width, and a headline
                  that re-wraps every 2.6 seconds shoves the whole page up and
                  down under the reader. The rotating word gets a line to
                  itself, so the line count never changes. */}
              <span className="hero-line">
                <span className="hero-word"><span>If</span></span>
                <span className="hero-word rot-wrap"><span><RotatingWho /></span></span>
              </span>
              <span className="hero-line">
                <span className="hero-word"><span>phone</span></span>
                <span className="hero-word"><span>goes</span></span>
                <span className="hero-word"><span>quiet,</span></span>
              </span>
              <span className="hero-line">
                {line2.map((w) => (
                  <span className="hero-word" key={w}>
                    <span>{w}</span>
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className="lede hero-lede hero-fade">
            <span className="hero-feel">You can&rsquo;t be there every day.</span>{' '}
            If their phone goes quiet, it rings them first. No answer? You&rsquo;re
            told &mdash; and one tap asks someone nearby to knock.
          </p>

          <div className="actions hero-fade">
            <a className="btn lamp" href="#how">
              See how it works <span aria-hidden="true">&darr;</span>
            </a>
            {/* ONLY WHERE THERE'S NO 3D STREET. With the street on screen, its own
                "Play the story" button right under the scene is the one control —
                two buttons that did the same thing, side by side, was one too many.
                On phones (no street) or where WebGL fails, this is how to reach
                the story: a plain link to the illustrated one further down. */}
            <a className="btn ghost hero-story-link" href="#story">
              Read the story
            </a>
          </div>

          <ul className="hero-points hero-fade">
            <li>Nothing for them to set up</li>
            <li>No maps. No reports. One word.</li>
            <li>
              Free until {FREE_UNTIL} &middot; then <PerPrice />
            </li>
          </ul>
        </div>

        {/* A small street at night in real 3D, with the lit window mark as its
            first paint and its fallback. Decorative: everything it shows is
            said in words elsewhere, so it stays hidden from screen readers. */}
        <div className="hero-stage" aria-hidden="true">
          <Diorama />
        </div>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <span className="scroll-cue-rail">
          <span className="scroll-cue-dot" />
        </span>
      </div>
    </div>
  );
}
