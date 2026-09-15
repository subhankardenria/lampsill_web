'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePersona, type PersonaKey } from './Persona';
import StreetScene from './scenes/StreetScene';
import StudentScene from './scenes/StudentScene';

/**
 * ANNA'S STREET — a sticky stage, seven beats, and one street that never changes.
 *
 * The whole section is built on one rule that took three bugs to learn:
 * A BEAT STATES ITS WHOLE WORLD AND NEVER INHERITS. Every trap below only
 * appears when you scroll BACKWARDS or jump, which is precisely what nobody
 * does while building it.
 *
 *  1. Which beat is showing is computed from geometry (`pickActive`), never
 *     from onEnter/onEnterBack. On a jump ScrollTrigger fires every trigger it
 *     crossed and the last to RUN wins, which put the door beat on screen
 *     holding the previous beat's message bubble.
 *  2. `overwrite: 'auto'`, because otherwise the last tween to FINISH wins,
 *     not the last to start. The door fades the bulb up over 0.7s and the
 *     alarm ducks it over 0.4s — the alarm fired last and the door still won,
 *     so the window sat there cosy and gold while the phone was screaming.
 *  3. `clearQueued()` first thing in every beat, because overwrite cannot kill
 *     a tween that has not started. the neighbour's window lights on a 0.55s delay;
 *     scrolling back through that beat fired it into a scene that had moved
 *     on, and her light came on during the alarm — which in this story is not
 *     a glitch, it is a claim that she knew before anyone told her.
 *  4. No `gsap.fromTo` anywhere a beat can run twice. A delayed fromTo keeps
 *     its from-state in `startAt` and re-renders it at progress 0, and
 *     `clearQueued` strips the property without removing the tween. After
 *     eight visits there were eight dormant fromTos on the neighbour's window each
 *     holding `opacity: 0`, and the moment the live tween left the global
 *     timeline a zombie rendered and her light snapped back off on the exact
 *     frame the payoff was meant to land. Use set + to.
 */

type Beat = {
  scene: string;
  when: string;
  title: string;
  body: React.ReactNode;
};

type Captions = Record<'setup' | 'quiet' | 'ill' | 'ring' | 'text' | 'door' | 'after', [string, string]>;

type StoryData = {
  scene: 'street' | 'student';
  /** the story's window in the picker: who it's about, in a few words */
  pick: { name: string; sub: string };
  titleA: string;
  titleB: string;
  lede: string;
  beats: Beat[];
  captions: Captions;
  overlay: { title: string; msg: string; call: string; text: string };
};

/*
 * ONE STORY PER TAB, IN THE SAME SPACE.
 *
 * The page was 20 screens long on a phone before it was cut to 14, and a single
 * story is four of them — so three stacked stories were never an option. The
 * story follows the tab instead: the reader sees the one that is theirs, at no
 * extra length. The engine below is shared and untouched; only the words and
 * the architecture change.
 *
 * The same rules hold in all three: relief, never fear; nobody is rescued;
 * Lampsill never detects anything; no invented quotes presented as real.
 */
const N = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: 'var(--ink)' }}>{children}</strong>
);

const STORIES: Record<PersonaKey, StoryData> = {
  parent: {
    scene: 'street',
    pick: { name: 'Anna & Maya', sub: 'A mother who lives alone' },
    titleA: 'Anna, Maya, Leo,',
    titleB: 'and one Tuesday night.',
    lede: 'Anna lives alone. Her daughter Maya lives two hours away. Leo lives three doors down and has a key. Months of nothing — then one night, it mattered.',
    beats: [
      {
        scene: 'setup',
        when: 'SUNDAY · FOUR MINUTES',
        title: 'Maya sets it up after their Sunday call.',
        body: (
          <>
            <p>
              Anna is 71 and lives alone. She&rsquo;s fine. But some nights, Maya lies
              awake and wonders.
            </p>
            <p>
              Maya puts Lampsill on <em>her own</em> phone. She adds the people nearest to
              Anna: Leo, three doors down, who has a key &mdash; then Anna&rsquo;s sister, Clara.
            </p>
            <p className="aside">
              Anna gets a link and taps twice to say yes. She rolls her eyes a little.
              That&rsquo;s all she ever has to do.
            </p>
          </>
        ),
      },
      {
        scene: 'quiet',
        when: 'THE NEXT FOUR MONTHS',
        title: 'Maya sees one word, and sleeps better.',
        body: (
          <>
            <p>
              <N>normal</N>. No steps, no map, no wake-up time. Just: things are as usual.
            </p>
            <p>
              Anna forgets it&rsquo;s there. Every call, every weather check, every photo of
              the grandchildren resets the clock. Sunday calls are about the garden again.
            </p>
          </>
        ),
      },
      {
        scene: 'ill',
        when: 'TUESDAY · 08:40',
        title: 'Anna comes down with something.',
        body: (
          <>
            <p>
              She checks the weather, leaves her phone on the windowsill, and goes back to
              bed with a fever. Just for an hour, she thinks.
            </p>
            <p>
              She sleeps all day. Lampsill can&rsquo;t tell flu from a lie-in. It only knows
              her phone hasn&rsquo;t been picked up.
            </p>
          </>
        ),
      },
      {
        scene: 'ring',
        when: 'TUESDAY · 20:50',
        title: 'Her phone asks first.',
        body: (
          <>
            <p>
              Twelve quiet hours, most of them in the day. So before anyone else is told,
              Anna&rsquo;s own phone asks: <em>Still there?</em>
            </p>
            <p>
              Usually, that&rsquo;s the end of it. She&rsquo;s in the garden, hears it, taps
              once. Maya never knows.
            </p>
            <p className="aside">Tonight, it rings in an empty kitchen.</p>
          </>
        ),
      },
      {
        scene: 'text',
        when: 'TUESDAY · 21:00',
        title: 'Maya’s phone goes off.',
        body: (
          <>
            <p>
              She&rsquo;s washing up. Her phone makes a sound. She calls her mother. No answer.
            </p>
            <p>
              Her heart is racing. She taps <N>Text Leo</N>. Her messages app opens with a
              note already written. She adds &ldquo;please&rdquo; twice and sends it &mdash;
              from her own number, so Leo knows it&rsquo;s her.
            </p>
          </>
        ),
      },
      {
        scene: 'door',
        when: 'TUESDAY · 21:06',
        title: 'Leo lets himself in.',
        body: (
          <>
            <p>
              Anna is in bed with a fever, embarrassed by the fuss. Leo brings her water,
              sits with her a while, then calls Maya: &ldquo;She&rsquo;s alright.
              Annoyed with you, but alright.&rdquo;
            </p>
            <p>Two hours away, Maya sits on the kitchen floor and cries &mdash; mostly from relief.</p>
            <p className="aside">
              Nothing dramatic happened. Anna would have been fine by morning. She just
              didn&rsquo;t have to be alone until then. And Maya didn&rsquo;t have to lie
              awake wondering.
            </p>
          </>
        ),
      },
      {
        scene: 'after',
        when: 'THE NEXT SUNDAY',
        title: 'Back to one word.',
        body: (
          <>
            <p>
              Anna picks up her phone and the clock resets. No report. No history. No
              record of that night.
            </p>
            <p>
              Maya&rsquo;s screen says <N>normal</N> again. The Sunday call runs a bit
              longer. Anna makes her promise to stop worrying. Maya says she will. She
              won&rsquo;t, quite &mdash; but she sleeps.
            </p>
          </>
        ),
      },
    ],
    captions: {
      setup: ['SUNDAY · SETTING IT UP', 'Maya on her phone. Leo first, then Clara. Anna taps twice.'],
      quiet: ['DAYS OF NOTHING HAPPENING', 'Every time Anna picks up her phone, the clock starts again.'],
      ill: ['TUESDAY, 08:40 — LAST TOUCH', 'For the first time in months, nothing resets it.'],
      ring: ['TUESDAY, 20:50', 'Her own phone rings first. Nobody else knows yet.'],
      text: ['MAYA’S PHONE · 21:00', 'Two buttons. She calls, then taps Text Leo.'],
      door: ['TUESDAY, 21:06', 'Leo lets himself in. Two lights on instead of one.'],
      after: ['SUNDAY · BACK TO NORMAL', 'One word again. A longer phone call.'],
    },
    overlay: { title: 'Anna hasn’t answered', msg: 'Her phone’s been quiet since 08:40. No answer for 10 minutes.', call: 'Call Anna', text: 'Text Leo' },
  },

  child: {
    scene: 'student',
    pick: { name: 'Adam & Sam', sub: 'A son away at university' },
    titleA: 'Adam, Sam,',
    titleB: 'and one long exam week.',
    lede: 'Adam is in his first year away. You’re a long way off, trying not to text too much. Sam lives two doors down the hall. A whole term of nothing — then one evening, it mattered.',
    beats: [
      {
        scene: 'setup',
        when: 'MOVING-IN DAY',
        title: 'You set it up before you head home.',
        body: (
          <>
            <p>
              Adam is 19. His room has a kettle, a desk lamp and a view of the car park.
              He&rsquo;s thrilled. You&rsquo;re thrilled for him &mdash; and not sleeping.
            </p>
            <p>
              You put Lampsill on <em>your own</em> phone. You add the person who lives
              closest: Sam, two doors down, who helped carry the boxes in.
            </p>
            <p className="aside">
              Adam taps twice to say yes, mostly so you&rsquo;ll stop asking. It&rsquo;s his
              choice. He can turn it off any time.
            </p>
          </>
        ),
      },
      {
        scene: 'quiet',
        when: 'THE WHOLE FIRST TERM',
        title: 'You see one word, and let him be.',
        body: (
          <>
            <p>
              <N>normal</N>. Not where he went, when he got in, or who he was with.
              Lampsill doesn&rsquo;t even ask for location.
            </p>
            <p>
              Adam forgets it&rsquo;s there. Lectures, late nights, group chats &mdash; each
              one resets the clock. Your texts stop starting with &ldquo;Just
              checking&hellip;&rdquo;
            </p>
          </>
        ),
      },
      {
        scene: 'ill',
        when: 'EXAM WEEK · 06:10',
        title: 'Adam revises until dawn.',
        body: (
          <>
            <p>
              He&rsquo;s been up all night. He puts his phone face down and falls into bed,
              already coming down with a fever.
            </p>
            <p>
              He sleeps all day. Lampsill can&rsquo;t tell a fever from a long sleep after
              exams. It only knows a phone that&rsquo;s always in his hand hasn&rsquo;t been
              touched.
            </p>
          </>
        ),
      },
      {
        scene: 'ring',
        when: 'EXAM WEEK · 18:20',
        title: 'His phone asks first.',
        body: (
          <>
            <p>
              Twelve quiet hours, most of them in the day. So before anyone else is told,
              Adam&rsquo;s phone asks: <em>Still there?</em>
            </p>
            <p>
              Usually, that&rsquo;s the end of it. He&rsquo;s in the library, sees it, taps
              once. You never know.
            </p>
            <p className="aside">Today it buzzes on the desk while he sleeps.</p>
          </>
        ),
      },
      {
        scene: 'text',
        when: 'EXAM WEEK · 18:30',
        title: 'Your phone goes off.',
        body: (
          <>
            <p>You&rsquo;re making dinner. Your phone makes a sound. You call him. No answer.</p>
            <p>
              Your stomach drops. You tap <N>Text Sam</N>. Your messages app opens with a
              note already written. You add &ldquo;sorry to bother you&rdquo; and send it.
            </p>
          </>
        ),
      },
      {
        scene: 'door',
        when: 'EXAM WEEK · 18:34',
        title: 'Sam knocks. Then knocks louder.',
        body: (
          <>
            <p>
              Adam opens the door in his duvet, shivering, not sure what day it is. Sam
              fills his water bottle, finds some cold medicine, and sends you a photo:
              thumbs up, back in bed.
            </p>
            <p>
              Far away, you sit on the kitchen floor and breathe out for the first time in
              ten minutes.
            </p>
            <p className="aside">
              Nothing dramatic happened. Adam would have been fine by morning. He just
              didn&rsquo;t have to be ill alone. And you didn&rsquo;t have to spend the night
              imagining.
            </p>
          </>
        ),
      },
      {
        scene: 'after',
        when: 'THE NEXT MORNING',
        title: 'Back to one word.',
        body: (
          <>
            <p>
              Adam picks up his phone to a pile of messages. The clock resets. No report.
              No history. No record of that night.
            </p>
            <p>
              Your screen says <N>normal</N> again. At lunch he sends a photo of the soup
              Sam made him: &ldquo;you can relax now&rdquo;. You do. Mostly.
            </p>
          </>
        ),
      },
    ],
    captions: {
      setup: ['MOVING-IN DAY', 'You on your phone. Sam first. Adam taps twice.'],
      quiet: ['A TERM OF NOTHING HAPPENING', 'Every time Adam picks up his phone, the clock starts again.'],
      ill: ['EXAM WEEK, 06:10 — LAST TOUCH', 'For the first time all term, nothing resets it.'],
      ring: ['EXAM WEEK, 18:20', 'His own phone asks first. Nobody else knows yet.'],
      text: ['YOUR PHONE · 18:30', 'Two buttons. You call, then tap Text Sam.'],
      door: ['EXAM WEEK, 18:34', 'The hall lights come on. Two lights instead of one.'],
      after: ['THE NEXT MORNING', 'One word again. And a photo of soup.'],
    },
    overlay: { title: 'Adam hasn’t answered', msg: 'His phone’s been quiet since 06:10. No answer for 10 minutes.', call: 'Call Adam', text: 'Text Sam' },
  },

  self: {
    scene: 'street',
    pick: { name: 'You, Lena & Nina', sub: 'Living alone, happily' },
    titleA: 'You, Lena, Nina,',
    titleB: 'and one Tuesday night.',
    lede: 'You, happy living alone. Your sister Lena, two hours away. Nina next door, with your spare key. Months of nothing — then one night, it mattered.',
    beats: [
      {
        scene: 'setup',
        when: 'SUNDAY · FOUR MINUTES',
        title: 'Lena sets it up, with your OK.',
        body: (
          <>
            <p>
              You love living alone &mdash; your own space, your own quiet, your own terrible
              playlists. Lena points out, again, that nobody would know if you got ill.
            </p>
            <p>
              So she puts Lampsill on <em>her</em> phone. She adds the person closest to you:
              Nina, next door, who has your spare key.
            </p>
            <p className="aside">
              You tap twice to say yes. It&rsquo;s your choice. You can turn it off any time.
            </p>
          </>
        ),
      },
      {
        scene: 'quiet',
        when: 'THE NEXT FOUR MONTHS',
        title: 'Lena sees one word.',
        body: (
          <>
            <p>
              <N>normal</N>. Not where you went or what you did. Just: things are as usual.
            </p>
            <p>
              You forget it&rsquo;s there. Every message, every podcast, every late-night
              scroll resets the clock. Lena stops asking if you&rsquo;re eating properly.
              Mostly.
            </p>
          </>
        ),
      },
      {
        scene: 'ill',
        when: 'TUESDAY · 08:40',
        title: 'You come down with something.',
        body: (
          <>
            <p>
              You check the weather, leave your phone on the kitchen counter, and go back to
              bed with a fever. Just for an hour, you think.
            </p>
            <p>
              You sleep all day. Lampsill can&rsquo;t tell flu from a lie-in. It only knows
              your phone hasn&rsquo;t been picked up.
            </p>
          </>
        ),
      },
      {
        scene: 'ring',
        when: 'TUESDAY · 20:50',
        title: 'Your phone asks first.',
        body: (
          <>
            <p>
              Twelve quiet hours, most of them in the day. So before anyone else is told,
              your own phone asks: <em>Still there?</em>
            </p>
            <p>
              Usually, that&rsquo;s the end of it. You&rsquo;re in the shower, hear it, tap
              once. Lena never knows.
            </p>
            <p className="aside">Tonight, it rings in an empty kitchen.</p>
          </>
        ),
      },
      {
        scene: 'text',
        when: 'TUESDAY · 21:00',
        title: 'Lena’s phone goes off.',
        body: (
          <>
            <p>Her phone makes a sound. She calls you. No answer.</p>
            <p>
              She taps <N>Text Nina</N>. Her messages app opens with a note already written.
              She sends it from her own number, so Nina knows it&rsquo;s her.
            </p>
          </>
        ),
      },
      {
        scene: 'door',
        when: 'TUESDAY · 21:05',
        title: 'Nina lets herself in.',
        body: (
          <>
            <p>
              You&rsquo;re in bed with a fever, embarrassed by the fuss. Nina puts the kettle
              on, brings you water, and calls Lena from the hall: &ldquo;All good. Grumpy,
              but all good.&rdquo;
            </p>
            <p>Two hours away, Lena finally sits down.</p>
            <p className="aside">
              Nothing dramatic happened. You&rsquo;d have been fine by morning. You just
              didn&rsquo;t have to be ill alone.
            </p>
          </>
        ),
      },
      {
        scene: 'after',
        when: 'THE NEXT SUNDAY',
        title: 'Back to one word.',
        body: (
          <>
            <p>
              You pick up your phone and the clock resets. No report. No history. No record
              of that night.
            </p>
            <p>
              Lena&rsquo;s screen says <N>normal</N> again. Next time she brings it up, you
              don&rsquo;t roll your eyes. Much.
            </p>
          </>
        ),
      },
    ],
    captions: {
      setup: ['SUNDAY · SETTING IT UP', 'Lena on her phone. Nina first. You tap twice.'],
      quiet: ['DAYS OF NOTHING HAPPENING', 'Every time you pick up your phone, the clock starts again.'],
      ill: ['TUESDAY, 08:40 — LAST TOUCH', 'For the first time in months, nothing resets it.'],
      ring: ['TUESDAY, 20:50', 'Your own phone asks first. Nobody else knows yet.'],
      text: ['LENA’S PHONE · 21:00', 'Two buttons. She calls, then taps Text Nina.'],
      door: ['TUESDAY, 21:05', 'Nina lets herself in. Two lights on instead of one.'],
      after: ['SUNDAY · BACK TO NORMAL', 'One word again.'],
    },
    overlay: { title: 'No answer since this morning', msg: 'Quiet since 08:40. No answer for 10 minutes.', call: 'Call', text: 'Text Nina' },
  },
};

/**
 * Remounts the whole story when the tab changes. The engine queries its
 * elements and builds its ScrollTriggers once, on mount; swapping the words and
 * the architecture underneath a running engine would leave it animating
 * elements that no longer exist. A key change gives it a clean unmount — which
 * reverts every tween and kills every trigger via gsap.context — and a fresh
 * mount against the new scene.
 */
const ORDER: PersonaKey[] = ['parent', 'child', 'self'];

export default function Story() {
  const { persona, setPersona } = usePersona();
  const pick = (k: PersonaKey) => setPersona(k);
  /* From the end of a story: switch, THEN scroll up to the new one's top. The
     scroll has to wait for the new story to render — the question and the
     phones above change height with the family, so a position measured before
     the switch landed ~150px short. Two frames, then through the same in-page
     anchor handling everything else uses (Lenis, masthead clearance). */
  const pickAndGo = (k: PersonaKey) => {
    setPersona(k);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const a = document.createElement('a');
        a.href = '#story';
        a.hidden = true;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }),
    );
  };
  // THE PICKER LIVES OUT HERE, outside the part that remounts. Inside it, every
  // click rebuilt the picker along with the story, and its scroll-reveal
  // started again from invisible — the row the reader had just pressed blinked
  // out under their finger.
  return (
    <section className="section story" id="story">
      <div className="wrap">
        <div className="reveal story-pick">
          <p className="eyebrow">Three stories &middot; pick a window</p>
          <StoryWindows current={persona.key} onPick={pick} />
        </div>
      </div>
      <StoryInner key={persona.key} current={persona.key} story={STORIES[persona.key]} onPick={pickAndGo} />
    </section>
  );
}

/**
 * THREE STORIES, SHOWN AS THREE LIT WINDOWS.
 *
 * The story used to follow the tab chosen two sections up, and a reader who
 * never touched the tabs never learned there were other stories at all — the
 * son at university and the person living alone simply didn't exist for them.
 * So the story section now offers its own choice, in the page's own picture: a
 * row of windows at night, the one being read lit gold, the others dim and
 * waiting. Choosing a window is the same choice as the tab (one shared state),
 * so the phones and the question above follow it too.
 *
 * Buttons with aria-pressed rather than tabs: this sits above a very long
 * region, and tab semantics would promise a panel right beside the control.
 */
function StoryWindows({
  current,
  onPick,
  only,
}: {
  current: PersonaKey;
  onPick: (k: PersonaKey) => void;
  /** show only these (the "another story" row at the end) */
  only?: PersonaKey[];
}) {
  const keys = only ?? ORDER;
  return (
    <div className={`story-windows${only ? ' is-next' : ''}`} role="group" aria-label={only ? 'Read another story' : 'Choose a story'}>
      {keys.map((k) => {
        const on = k === current;
        const inner = (
          <>
            <svg className="sw-window" viewBox="0 0 40 50" aria-hidden="true">
              <path className="sw-frame" d="M5 47 V20 A15 15 0 0 1 35 20 V47 Z" />
              <rect className="sw-glass" x="8.5" y="21" width="23" height="23" rx="1" />
              <path className="sw-bars" d="M20 8 V47 M6 30 H34" />
            </svg>
            <span className="sw-text">
              <strong>{STORIES[k].pick.name}</strong>
              <span>{STORIES[k].pick.sub}</span>
            </span>
            {!on && <span className="sw-go" aria-hidden="true">→</span>}
          </>
        );
        return (
          <button key={k} type="button" className="sw" aria-pressed={on} data-on={on ? '' : undefined} onClick={() => onPick(k)}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

function StoryInner({
  story,
  current,
  onPick,
}: {
  story: StoryData;
  current: PersonaKey;
  onPick: (k: PersonaKey) => void;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ overwrite: 'auto' });

    const ctx = gsap.context(() => {
      const Q = (s: string) => el.querySelector(s) as SVGElement & HTMLElement;
      const stage = Q('#stage');
      const stamp = Q('#stamp');
      const caption = Q('#caption');
      const scene = Q('#scene');
      const rings = Q('#rings');
      const arc = Q('#arc');
      const arcbg = Q('#arcbg');
      const ovCount = Q('#ov-count');
      const ovBubble = Q('#ov-bubble');
      const counterEl = Q('#day-counter');
      const dawnRect = Q('#dawnRect');
      const stars = Q('#stars');
      const sillWash = Q('#sillWash');
      const doorLight = Q('#doorLight');
      const inNbr = Q('#in-nbr');
      const outNbr = Q('#out-nbr');
      const lampLip = Q('#lampLip');

      const HUE: Record<string, Element[]> = {
        gold: [Q('#in-gold'), Q('#out-gold')],
        ember: [Q('#in-ember'), Q('#out-ember')],
        alarm: [Q('#in-alarm'), Q('#out-alarm')],
      };

      function light(name: string, level = 1, dur = 0.7, delay = 0) {
        Object.keys(HUE).forEach((k) => {
          const on = k === name;
          if (on && delay) gsap.set(HUE[k], { opacity: 0 });
          gsap.to(HUE[k], {
            opacity: on ? level : 0,
            duration: dur,
            delay: on ? delay : 0,
            ease: 'power2.out',
          });
        });
      }

      const frame = Q('#frameMain') as unknown as SVGPathElement;
      const frameLen = frame.getTotalLength();
      gsap.set(frame, { strokeDasharray: frameLen, strokeDashoffset: frameLen });

      const arcLen = 160;
      gsap.set(arc, { strokeDasharray: arcLen, strokeDashoffset: arcLen });

      const CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!CALM) {
        gsap.to('#in-gold, #in-ember, #in-alarm', {
          scale: 1.045,
          transformOrigin: '74px 89px',
          duration: 2.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      const ringPulse = CALM
        ? {
            play() {
              const rr = el.querySelectorAll('.rr');
              [30, 46, 62].forEach((r, i) =>
                gsap.set(rr[i], { attr: { r }, opacity: 0.5 - i * 0.15, strokeWidth: 1.3 - i * 0.3 }),
              );
            },
            pause() {},
          }
        : gsap.timeline({ repeat: -1, paused: true }).fromTo(
            '.rr',
            { attr: { r: 26 }, opacity: 0.55, strokeWidth: 1.4 },
            { attr: { r: 70 }, opacity: 0, strokeWidth: 0.4, duration: 1.8, stagger: 0.55, ease: 'power1.out' },
          );

      function say(text: string, line: string) {
        if (stamp.textContent !== text) {
          gsap.set(stamp, { opacity: 0, y: -4 });
          gsap.to(stamp, { opacity: 1, y: 0, duration: 0.35 });
          stamp.textContent = text;
        }
        if (caption.textContent !== line) {
          gsap.set(caption, { opacity: 0, y: 6 });
          gsap.to(caption, { opacity: 1, y: 0, duration: 0.45 });
          caption.textContent = line;
        }
      }

      const focus = (on: boolean) => scene.classList.toggle('defocus', !on);

      const DELAYED = [HUE.gold[0], HUE.gold[1], sillWash, doorLight, inNbr, outNbr];
      const clearQueued = () => gsap.killTweensOf(DELAYED, 'opacity');

      const BEATS: Record<string, () => void> = {
        setup() {
          clearQueued();
          stage.dataset.scene = 'setup';
          say(...story.captions.setup);
          focus(true);
          gsap.to(frame, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' });
          light('gold', 1, 1.4, 0.7);
          gsap.to(sillWash, { opacity: 1, duration: 1.2, delay: 0.9 });
          gsap.to(lampLip, { opacity: 0.6, duration: 0.5 });
          gsap.to([rings, arc, arcbg], { opacity: 0, duration: 0.3 });
          gsap.to([inNbr, outNbr, doorLight], { opacity: 0, duration: 0.3 });
          gsap.to([ovCount, ovBubble], { opacity: 0, duration: 0.3 });
          gsap.to(dawnRect, { opacity: 0, duration: 0.5 });
          gsap.to(stars, { opacity: 1, duration: 0.5 });
          ringPulse.pause();
        },
        quiet() {
          clearQueued();
          stage.dataset.scene = 'quiet';
          say(...story.captions.quiet);
          focus(false);
          light('gold', 1);
          gsap.to(sillWash, { opacity: 1, duration: 0.5 });
          gsap.to(lampLip, { opacity: 0.6, duration: 0.5 });
          gsap.to(ovCount, { opacity: 1, duration: 0.4 });
          gsap.to([ovBubble, rings, arc, arcbg, inNbr, outNbr, doorLight], { opacity: 0, duration: 0.3 });
          ringPulse.pause();
        },
        ill() {
          clearQueued();
          stage.dataset.scene = 'ill';
          say(...story.captions.ill);
          focus(true);
          light('ember', 1, 1.6);
          gsap.to(sillWash, { opacity: 0.35, duration: 1.2 });
          gsap.to(lampLip, { opacity: 0.5, duration: 1.2 });
          gsap.to(ovCount, { opacity: 0, duration: 0.3 });
          gsap.to([arc, arcbg], { opacity: 1, duration: 0.4 });
          gsap.to(dawnRect, { opacity: 0, duration: 0.6 });
          gsap.to(stars, { opacity: 1, duration: 0.6 });
          gsap.to([rings, inNbr, outNbr, ovBubble, doorLight], { opacity: 0, duration: 0.3 });
          ringPulse.pause();
        },
        ring() {
          clearQueued();
          stage.dataset.scene = 'ring';
          say(...story.captions.ring);
          focus(true);
          light('alarm', 1, 0.35);
          gsap.to(lampLip, { opacity: 0.18, duration: 0.4 });
          // 20:50 in the worked example: it is dark. An earlier version of this
          // story rang at 8:42am and brought the sky up; this one does not.
          gsap.to(dawnRect, { opacity: 0, duration: 0.8 });
          gsap.to(stars, { opacity: 1, duration: 0.8 });
          gsap.to(sillWash, { opacity: 0, duration: 0.4 });
          gsap.to(rings, { opacity: 1, duration: 0.3 });
          gsap.to([inNbr, outNbr, ovCount, ovBubble, doorLight], { opacity: 0, duration: 0.3 });
          gsap.to([arc, arcbg], { opacity: 1, duration: 0.3 });
          ringPulse.play();
        },
        text() {
          clearQueued();
          stage.dataset.scene = 'text';
          say(...story.captions.text);
          focus(false);
          ringPulse.pause();
          gsap.to(rings, { opacity: 0, duration: 0.4 });
          gsap.to(HUE.alarm, { opacity: 0.45, duration: 0.6 });
          gsap.to(lampLip, { opacity: 0.18, duration: 0.4 });
          gsap.set(ovBubble, { opacity: 0, x: 46, y: 18, rotation: 4 });
          gsap.to(ovBubble, { opacity: 1, x: 0, y: 0, rotation: 0, duration: 0.75, ease: 'power3.out' });
          gsap.to([ovCount, doorLight, inNbr, outNbr], { opacity: 0, duration: 0.3 });
          gsap.to(sillWash, { opacity: 0, duration: 0.4 });
        },
        door() {
          clearQueued();
          stage.dataset.scene = 'door';
          say(...story.captions.door);
          focus(true);
          gsap.to(ovBubble, { opacity: 0, duration: 0.3 });
          light('gold', 1, 0.9);
          gsap.to(sillWash, { opacity: 1, duration: 0.9 });
          gsap.to(lampLip, { opacity: 0.6, duration: 0.7 });
          gsap.to([arc, arcbg, rings, ovCount], { opacity: 0, duration: 0.4 });
          gsap.to(dawnRect, { opacity: 0, duration: 0.8 });
          gsap.to(stars, { opacity: 1, duration: 0.8 });
          gsap.to(doorLight, { opacity: 1, duration: 0.7, delay: 0.25 });
          gsap.set([inNbr, outNbr], { opacity: 0 });
          gsap.to([inNbr, outNbr], { opacity: 1, duration: 1, delay: 0.55, ease: 'power2.out' });
          ringPulse.pause();
        },
        after() {
          clearQueued();
          stage.dataset.scene = 'after';
          say(...story.captions.after);
          focus(false);
          light('gold', 1, 0.6);
          gsap.to([inNbr, outNbr, doorLight], { opacity: 0, duration: 0.6 });
          gsap.to([arc, arcbg, rings, ovBubble], { opacity: 0, duration: 0.3 });
          gsap.to(sillWash, { opacity: 1, duration: 0.5 });
          gsap.to(lampLip, { opacity: 0.6, duration: 0.5 });
          gsap.to(dawnRect, { opacity: 0, duration: 0.8 });
          gsap.to(stars, { opacity: 1, duration: 0.8 });
          counterEl.textContent = '1';
          gsap.to(ovCount, { opacity: 1, duration: 0.4 });
          ringPulse.pause();
        },
      };

      const beatEls = Array.from(el.querySelectorAll('.beat')) as HTMLElement[];
      let current: HTMLElement | null = null;

      function pickActive() {
        const mid = window.innerHeight / 2;
        let best: HTMLElement | null = null;
        let bestDist = Infinity;
        beatEls.forEach((b) => {
          const r = b.getBoundingClientRect();
          const d = Math.abs((r.top + r.bottom) / 2 - mid);
          if (r.bottom > 0 && r.top < window.innerHeight && d < bestDist) {
            bestDist = d;
            best = b;
          }
        });
        if (!best || best === current) return;
        current = best;
        beatEls.forEach((b) => b.classList.toggle('live', b === best));
        BEATS[(best as HTMLElement).dataset.scene as string]();
      }

      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: pickActive,
        onRefresh: pickActive,
      });

      // 128 days over one house: the counter climbs and the sky cycles
      // dawn-to-dark under the reader's thumb. Six visible days, not a literal
      // 128 — past about eight the sky stops reading as days passing and
      // starts reading as a strobe.
      ScrollTrigger.create({
        trigger: '.beat[data-scene="quiet"]',
        start: 'top 80%',
        end: 'bottom 40%',
        scrub: 0.4,
        onUpdate(self) {
          const p = self.progress;
          counterEl.textContent = String(Math.round(p * 128));
          const day = (Math.sin(p * Math.PI * 2 * 6 - Math.PI / 2) + 1) / 2;
          gsap.set(dawnRect, { opacity: day * 0.62 });
          gsap.set(stars, { opacity: 1 - day });
          gsap.set(HUE.gold[0], { opacity: 1 - day * 0.55 });
          gsap.set(HUE.gold[1], { opacity: 1 - day * 0.8 });
        },
      });

      ScrollTrigger.create({
        trigger: '.beat[data-scene="ill"]',
        start: 'top 75%',
        endTrigger: '.beat[data-scene="ring"]',
        end: 'top 40%',
        scrub: 0.5,
        onUpdate(self) {
          gsap.set(arc, { strokeDashoffset: arcLen * (1 - self.progress) });
        },
      });

      // Parallax on the FAR layers only. Not `#street`: the window, the
      // lamplight and the sill are separate groups drawn over the wall, so
      // moving the wall without them slides the house out from behind its own
      // window.
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onUpdate(self) {
          const p = self.progress - 0.5;
          gsap.set('#skyLayer', { y: p * 9 });
          gsap.set('#blockFar', { y: p * 3.5 });
        },
      });

      BEATS.setup();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div className="story-body" ref={root}>
      <div className="wrap">
        {/* not a .reveal: this remounts on every story change, and a reveal
            would make the new title start invisible */}
        <div className="story-title">
          <h2>
            {story.titleA}
            <br />
            {story.titleB}
          </h2>
          <p className="lede" style={{ maxWidth: '40rem' }}>
            {story.lede}
          </p>
        </div>

        <div className="story-grid">
          <div>
            {story.beats.map((b) => (
              <div className="beat" data-scene={b.scene} key={b.scene}>
                <span className="when">{b.when}</span>
                <h3 dangerouslySetInnerHTML={{ __html: b.title }} />
                {b.body}
              </div>
            ))}
          </div>

          <div className="stage-col">
            <div className="stage" id="stage" data-scene="setup">
              <span className="stamp" id="stamp">
                SETTING IT UP
              </span>

              <div className="scene-wrap">
                <div className="scene-box">
            {story.scene === 'student' ? <StudentScene /> : <StreetScene />}

                  <div className="overlay" id="ov-count">
                    <div className="counter" id="day-counter">
                      0
                    </div>
                    <span className="counter-unit">days · all normal</span>
                  </div>

                  <div className="overlay" id="ov-bubble">
                    <div className="handset">
                      <div className="notch" />
                      <div className="glass">
                        <div className="notif-card">
                          <div className="from">LAMPSILL · now</div>
                          <div className="notif-title">{story.overlay.title}</div>
                          <div className="msg">{story.overlay.msg}</div>
                          <div className="notif-actions">
                            <span>{story.overlay.call}</span>
                            <span className="hot">{story.overlay.text}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="caption" id="caption" />
            </div>
          </div>
        </div>

        {/* THE WAY ON, for whoever read to the end. Choosing one scrolls the
            reader back up to the top of the story they picked. */}
        <div className="story-next">
          <p className="eyebrow">Another window, another story</p>
          <StoryWindows current={current} onPick={onPick} only={ORDER.filter((k) => k !== current)} />
        </div>
      </div>
    </div>
  );
}
