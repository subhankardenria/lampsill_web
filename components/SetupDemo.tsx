'use client';

import { useEffect, useState } from 'react';
import { PlayBadge } from './PlayBadge';

/**
 * THE SETUP, TAPPED THROUGH (owner, 2 Nov 2026: "create a actual setup demo
 * for someone first ... has to be very clear and easy to understand", for
 * Mum or Dad, and for a son or daughter).
 *
 * The real screens, as Google Play users get them, drawn by the app's screen
 * tool and dist/setup-demo/make_demo.py into public/setup/. The same steps
 * make the WhatsApp videos there; change one, change the other.
 *
 * Every step says whose phone it is on, in words and in the phone's edge
 * (blue for yours, lamp for theirs), and a card stands between the two
 * phones: whose phone a step is done on is what people get wrong. The lamp
 * ring is where to tap; tapping it, Next, or the right arrow key moves on.
 */
type Who = 'you' | 'them';
type Step = { who: Who; shot: string; line: React.ReactNode; tap?: [number, number]; label?: string };
type Path = {
  key: 'parent' | 'child';
  pick: string;
  them: string;
  steps: Step[];
  after: React.ReactNode;
};

// Tap points are in the screens' own points (402 x 874).
const PLAY: [number, number] = [201, 560];
const ALLOW: [number, number] = [201, 533];

const PATHS: Path[] = [
  {
    key: 'parent',
    pick: 'For Mum or Dad',
    them: 'Mum',
    steps: [
      { who: 'you', shot: 'd1-front-door', line: <>Open Lampsill. Tap <b>Someone else</b>.</>, tap: [295, 422], label: 'Someone else' },
      { who: 'you', shot: 'd2-who', line: <>Tap <b>Mum</b> or <b>Dad</b>.</>, tap: [50, 356], label: 'Mum' },
      { who: 'you', shot: 'm2-who-mum-tapped', line: <>48 hours suits most people. Tap <b>Continue with Google</b>.</>, tap: [201, 743], label: 'Continue with Google' },
      { who: 'you', shot: 'm3-the-code', line: <>Tap <b>Send them the code</b>. WhatsApp is fine.</>, tap: [201, 684], label: 'Send them the code' },
      { who: 'them', shot: 'x-play-from-ravi', line: <>Mum gets Lampsill from Google Play.</>, tap: PLAY, label: 'Get it on Google Play' },
      { who: 'them', shot: 'd1-front-door', line: <>She opens it and taps <b>I have a code</b>.</>, tap: [201, 739], label: 'I have a code' },
      { who: 'them', shot: 'd5-code-typed', line: <>She types the code. Tap <b>Continue</b>.</>, tap: [201, 796], label: 'Continue' },
      { who: 'them', shot: 'm6-from-ravi', line: <>She sees what it does. Tap <b>Yes, that&rsquo;s fine</b>.</>, tap: [201, 739], label: "Yes, that's fine" },
      { who: 'them', shot: 'm7a-mum-allow', line: <>When the phone asks, tap <b>Allow</b>.</>, tap: ALLOW, label: 'Allow' },
      { who: 'them', shot: 'm7-mum-light-on', line: <>Done. Her light is on. Nothing to do each day.</> },
      { who: 'you', shot: 'm8-ravi-looking-out', line: <>On your phone: <b>Mum&rsquo;s light is on</b>.</> },
    ],
    after: (
      <>
        If Mum&rsquo;s phone isn&rsquo;t used for 48 hours, it asks her <b>&ldquo;Are you OK?&rdquo;</b> No
        answer, and you&rsquo;re told.
      </>
    ),
  },
  {
    key: 'child',
    pick: 'For a son or daughter',
    them: 'Priya',
    steps: [
      { who: 'you', shot: 'd1-front-door', line: <>Open Lampsill. Tap <b>Someone else</b>.</>, tap: [295, 422], label: 'Someone else' },
      { who: 'you', shot: 'd2-who', line: <>Tap <b>Child</b>, then type their name.</>, tap: [292, 356], label: 'Child' },
      { who: 'you', shot: 'c2-who-child-tapped', line: <>48 hours suits most people. Tap <b>Continue with Google</b>.</>, tap: [201, 743], label: 'Continue with Google' },
      { who: 'you', shot: 'c3-the-code', line: <>Tap <b>Send them the code</b>. WhatsApp is fine.</>, tap: [201, 684], label: 'Send them the code' },
      { who: 'them', shot: 'x-play-from-asha', line: <>Priya gets Lampsill from Google Play.</>, tap: PLAY, label: 'Get it on Google Play' },
      { who: 'them', shot: 'd1-front-door', line: <>She opens it and taps <b>I have a code</b>.</>, tap: [201, 739], label: 'I have a code' },
      { who: 'them', shot: 'd5-code-typed', line: <>She types the code. Tap <b>Continue</b>.</>, tap: [201, 796], label: 'Continue' },
      { who: 'them', shot: 'c6-from-asha', line: <>She sees what it does. Tap <b>Yes, that&rsquo;s fine</b>.</>, tap: [201, 739], label: "Yes, that's fine" },
      { who: 'them', shot: 'c7a-priya-allow', line: <>When the phone asks, tap <b>Allow</b>.</>, tap: ALLOW, label: 'Allow' },
      { who: 'them', shot: 'c7-priya-light-on', line: <>Done. Her light is on. Nothing to do each day.</> },
      { who: 'you', shot: 'c8-asha-looking-out', line: <>On your phone: <b>Priya&rsquo;s light is on</b>.</> },
    ],
    after: (
      <>
        If Priya&rsquo;s phone isn&rsquo;t used for 48 hours, it asks her <b>&ldquo;Are you OK?&rdquo;</b> No
        answer, and you&rsquo;re told.
      </>
    ),
  },
];

/** The steps with a card wherever the phone changes hands, and one at the end. */
type Page = { kind: 'step'; step: Step } | { kind: 'switch'; to: Who } | { kind: 'done' };

function pagesOf(path: Path): Page[] {
  const out: Page[] = [];
  path.steps.forEach((step, i) => {
    if (i > 0 && step.who !== path.steps[i - 1].who) out.push({ kind: 'switch', to: step.who });
    out.push({ kind: 'step', step });
  });
  out.push({ kind: 'done' });
  return out;
}

export default function SetupDemo({ children }: { children?: React.ReactNode }) {
  const [pathKey, setPathKey] = useState<Path['key']>('parent');
  const [at, setAt] = useState(0);
  const path = PATHS.find((p) => p.key === pathKey)!;
  const pages = pagesOf(path);
  const page = pages[at];
  const total = path.steps.length;
  // How far along, as a line, not a count: "Step 1 of 11" made it feel long
  // (owner, 2 Nov 2026).
  const done = page.kind === 'done' ? 1 : pages.slice(0, at + 1).filter((p) => p.kind === 'step').length / total;

  const next = () => setAt((a) => Math.min(a + 1, pages.length - 1));
  const back = () => setAt((a) => Math.max(a - 1, 0));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setAt((a) => Math.min(a + 1, pages.length - 1));
      if (e.key === 'ArrowLeft') setAt((a) => Math.max(a - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pages.length]);

  function choose(key: Path['key']) {
    setPathKey(key);
    setAt(0);
  }

  // Whose phone the page is about, for the tag and the phone's edge.
  const who: Who = page.kind === 'step' ? page.step.who : page.kind === 'switch' ? page.to : 'you';
  const phoneName = who === 'you' ? 'On your phone' : `On ${path.them}’s phone`;
  const following = pages.slice(at + 1).find((p): p is Extract<Page, { kind: 'step' }> => p.kind === 'step');

  return (
    <div className={`demo ${who}`}>
      <div className="demo-intro">{children}</div>
      <div className="demo-pick" role="group" aria-label="Who are you setting it up for?">
        {PATHS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={p.key === pathKey ? 'on' : ''}
            aria-pressed={p.key === pathKey}
            onClick={() => choose(p.key)}
          >
            {p.pick}
          </button>
        ))}
      </div>

      <div className="demo-words" aria-live="polite">
          {page.kind === 'step' && (
            <>
              <p className="demo-tag">{phoneName}</p>
              <p className="demo-line">{page.step.line}</p>
              {page.step.tap && <p className="demo-hint">Tap the ring, or Next.</p>}
            </>
          )}
          {page.kind === 'switch' && (
            <>
              <p className="demo-tag">{page.to === 'them' ? 'Now' : 'Back'}</p>
              <p className="demo-line big">
                {page.to === 'them' ? <>on {path.them}&rsquo;s phone</> : <>on your phone</>}
              </p>
              {page.to === 'them' && <p className="demo-hint">{path.them} needs Lampsill too.</p>}
            </>
          )}
          {page.kind === 'done' && (
            <>
              <p className="demo-tag">That&rsquo;s it</p>
              <p className="demo-line">{path.after}</p>
              <PlayBadge height={56} />
              <p className="demo-other">
                <button type="button" className="demo-link" onClick={() => choose(path.key === 'parent' ? 'child' : 'parent')}>
                  {path.key === 'parent' ? 'Now see it for a son or daughter' : 'Now see it for Mum or Dad'}
                </button>
              </p>
            </>
          )}
        </div>

        <div className="demo-controls">
          <div className="demo-nav">
            <button type="button" className="demo-back" onClick={back} disabled={at === 0}>
              Back
            </button>
            {page.kind === 'done' ? (
              <button type="button" className="demo-next" onClick={() => setAt(0)}>
                Start again
              </button>
            ) : (
              <button type="button" className="demo-next" onClick={next}>
                Next
              </button>
            )}
          </div>
          <div className="demo-progress" aria-hidden="true">
            <span style={{ width: `${done * 100}%` }} />
          </div>
        </div>

        <div className="demo-phone-col">
          {page.kind === 'step' ? (
            <div className="demo-phone">
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed screens, sized by CSS */}
              <img src={`/setup/${page.step.shot}.webp`} width={804} height={1748} alt="" />
              {page.step.tap && (
                <button
                  type="button"
                  className="demo-ring"
                  style={{ left: `${(page.step.tap[0] / 402) * 100}%`, top: `${(page.step.tap[1] / 874) * 100}%` }}
                  onClick={next}
                  aria-label={`Tap ${page.step.label}`}
                />
              )}
            </div>
          ) : (
            // Between the phones, theirs waits, dimmed; at the end, your
            // phone with their light on.
            <div className={`demo-phone${page.kind === 'switch' ? ' dim' : ''}`} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/setup/${(page.kind === 'switch' ? following!.step : path.steps[total - 1]).shot}.webp`}
                width={804}
                height={1748}
                alt=""
              />
            </div>
          )}
          {/* The next screen, fetched now so the tap doesn't wait for it. */}
          {following && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="demo-preload" src={`/setup/${following.step.shot}.webp`} alt="" aria-hidden="true" />
          )}
        </div>
    </div>
  );
}
