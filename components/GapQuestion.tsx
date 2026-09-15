'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersona } from './Persona';

const MAX = 14;

/**
 * The question that does the selling, with a control you can feel.
 *
 * A native range input would work and would be one line. It is replaced here
 * because this slider IS the argument — the reader answers a question about
 * their own life and the number they produce is the whole pitch — and a
 * default range input feels like a settings screen.
 *
 * It stays a real <input type="range"> underneath, visually hidden but focused
 * and operable, because reimplementing keyboard handling, ARIA values and the
 * form semantics of a range input is how sliders end up unusable. The painted
 * control is driven from its value; the input is the source of truth.
 *
 * The 30 ticks light up one at a time and the number is a mechanical roll, so
 * dragging it feels like counting rather than scrubbing.
 */
export default function GapQuestion() {
  const { persona: P } = usePersona();
  const [days, setDays] = useState(4);
  const [dragging, setDragging] = useState(false);
  // "Drag me" until the first interaction. A custom control doesn't look like a
  // control to everyone, and one nudge is cheaper than a paragraph explaining it.
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pct = ((days - 1) / (MAX - 1)) * 100;

  const answer = (d: number) => {
    if (d === 1) return 'The same day.';
    if (d === 2) return 'The next day.';
    if (d === 7) return 'About a week later.';
    if (d >= MAX) return 'Two weeks. Maybe more.';
    return `${['', '', '', 'Three', 'Four', 'Five', 'Six'][d] ?? d} days later.`;
  };

  /* Asked of the person who would pay, about somebody they love — so guilt is
     the failure mode to design against. Nobody who speaks to their mother weekly
     is a bad son, and a page that implies it loses the sale and deserves to.
     Every band says the reader's habit is normal, then says what the gap is. */
  const caption = (d: number) => {
    if (d <= 2) return P.dial.close;
    if (d <= 6) return P.dial.unwell;
    if (d <= 13) return 'Lots of close families talk once a week. It just means a quiet spell could last a while before anyone knew.';
    return 'That’s not unusual, especially far away. It just means nothing would tell you sooner.';
  };

  const onInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDays(Number(e.target.value));
    setTouched(true);
  }, []);

  // Dragging anywhere on the painted track should work, not only on the thumb.
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const set = (clientX: number) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      setDays(Math.round(1 + p * (MAX - 1)));
    };
    const down = (e: PointerEvent) => {
      setDragging(true);
      setTouched(true);
      el.setPointerCapture(e.pointerId);
      set(e.clientX);
    };
    const move = (e: PointerEvent) => {
      if (el.hasPointerCapture(e.pointerId)) set(e.clientX);
    };
    const up = (e: PointerEvent) => {
      setDragging(false);
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  return (
    <section className="section question" id="question">
      <div className="wrap narrow">
        <h2 className="reveal">{P.dial.q}</h2>
        <p className="lede reveal">
          {P.dial.lede}
        </p>

        <div className={`dial reveal${dragging ? ' dragging' : ''}`} style={{ ['--p' as string]: `${pct}%` }}>
          <label className="sr-only" htmlFor="gap">
            {P.dial.srLabel}
          </label>
          <input
            ref={inputRef}
            className="sr-only"
            id="gap"
            type="range"
            min={1}
            max={MAX}
            step={1}
            value={days}
            onChange={onInput}
          />

          <div className="dial-track" ref={trackRef} aria-hidden="true">
            <div className="dial-fill" />
            <div className="dial-ticks">
              {Array.from({ length: MAX }, (_, i) => (
                <span key={i} className={`tick${i < days ? ' on' : ''}`} />
              ))}
            </div>
            <div className="dial-thumb">
              {!touched && <span className="dial-hint">Drag me</span>}
            </div>
          </div>

          <div className="dial-scale" aria-hidden="true">
            <span>Same day</span>
            <span>Two weeks</span>
          </div>
        </div>

        <p className="q-answer reveal" aria-live="polite">
          {answer(days)}
        </p>
        <p className="q-caption reveal">{caption(days)}</p>

        {/* THE BRIDGE, NOT A PROMISE. This used to end on "with Lampsill you'd
            know in hours" — a timing claim that depends on the 12-hour window
            and on the payer seeing the notification. The three phones right
            below show the real timing instead, so this just points at them. */}
        <a className="q-next reveal" href="#how">
          Here&rsquo;s what happens with Lampsill <span aria-hidden="true">&darr;</span>
        </a>
      </div>
    </section>
  );
}
