'use client';

import { createContext, useContext, useRef, useState } from 'react';

/**
 * WHO THE VISITOR IS LOOKING OUT FOR.
 *
 * The product is the same in both cases — the person living alone consents on
 * their own phone, their phone rings first, the payer is notified, the payer
 * messages the nearest person — but the PEOPLE are different, and a parent
 * whose son has just gone to university does not see themselves in a story
 * about somebody's elderly mother. So the sections that show people (the cast, the demo, the
 * dial) swap their cast; the sections that state facts are written neutrally
 * ("they", "their") and don't need to.
 *
 * Grown-up children only. The lawful basis for monitoring is the monitored
 * person's OWN consent (Data Protection §3), and there is no documented policy
 * for under-18s, so nothing here is pitched at parents of minors.
 */

export type PersonaKey = 'parent' | 'child' | 'self';

/**
 * Every sentence that mentions a person is written out IN FULL per persona.
 *
 * The first version templated pronouns — `${cap(their)} phone rings first`,
 * `${name} hasn't answered` — which was fine for "Mum" and "Arjun" and falls
 * apart the moment the person living alone is the reader: "You hasn't
 * answered", "call you, or message your nearest person" on somebody else's
 * phone. Three personas is few enough to write out, and explicit strings are
 * the only version a copy editor can read without running the code.
 */
export type Persona = {
  key: PersonaKey;
  tab: string;
  /** the label on a small phone, where three full titles don't fit one row */
  tabShort: string;
  tabSub: string;
  /** the one line of feeling for this tab — second person, never a quote */
  heart: string;

  // the cast
  theirPhone: string;
  first: { name: string; initial: string; role: string; h3: string; body: string; phoneLabel: string };
  middle: { name: string; initial: string; role: string; isVisitor: boolean; h3: string; body: string; phoneLabel: string };
  notif: { title: string; call: string };
  nearest: { name: string; initial: string; role: string; h3: string; body: string; phoneLabel: string };
  tapLabel: string;
  fromLabel: string;
  message: string;
  reply: string;
  /** optional line under the cast, for anything this persona must be told */
  panelNote?: string;

  // the demo
  demo: {
    answerBtn: string;
    stateOf: string;
    stateCaption: string;
    status: {
      idle: string; quiet: string; ringing: string; notified: string;
      calling: string; talking: string; talked: string; declined: string; hungup: string; called: string;
      messaged: string; answered: string;
    };
    /** under "normal" on the middle phone, once a call shows their phone in use */
    inUse: string;
    note: string;
  };

  // the dial
  dial: { q: string; lede: string; srLabel: string; close: string; unwell: string };
};

/*
 * NAMES THAT TRAVEL. The cast used to be Mum, Raj, Arjun and Priya, which put
 * the page in one or two countries before anyone read a sentence — "Mum" is
 * British where most English readers say "Mom", and the other three are
 * specifically South Asian. Anna, Adam, Leo, Sam, Lena and Nina are all in wide
 * use across Europe, the Americas, the Middle East and Asia, and none of them
 * tells a reader "this was written for somebody else". Relationships are
 * spelled out ("your mother") rather than using a regional word for them.
 *
 * `heart` is the one emotional line per tab. It is spoken TO the reader in the
 * second person, never as a quotation: an invented quote with no speaker reads
 * as a testimonial, and this page must never contain one of those.
 */
export const PERSONAS: Record<PersonaKey, Persona> = {
  parent: {
    key: 'parent',
    tab: 'A parent',
    tabShort: 'Parent',
    tabSub: 'A mother, father or grandparent',
    heart: 'You call every Sunday. It’s the other six days you wonder about.',
    theirPhone: 'her phone',
    first: {
      name: 'Anna', initial: 'A', role: 'Your mother · lives alone',
      h3: 'Her phone rings first',
      body: 'She taps “I’m fine” and it’s over. Nobody else is told. She has nothing to set up, and her life stays her own.',
      phoneLabel: 'Anna’s phone',
    },
    middle: {
      name: 'You', initial: 'You', role: 'Set it up · pay for it', isVisitor: true,
      h3: 'No answer? You’re told',
      body: 'Your phone makes a sound. Two buttons: call her, or text her neighbour.',
      phoneLabel: 'Your phone',
    },
    notif: { title: 'Anna hasn’t answered', call: 'Call Anna' },
    nearest: {
      name: 'Leo', initial: 'L', role: 'Her neighbour · has a key',
      h3: 'One tap, and Leo knocks',
      body: 'The text comes from your own phone, so he knows it’s you. He’s minutes away. You’re hours away.',
      phoneLabel: 'Leo’s phone',
    },
    tapLabel: 'You tap “Text”',
    fromLabel: 'From you',
    // Says who it's ABOUT, not who it's from: the reader could be a son or a
    // daughter, and the phone already shows the sender's name and number.
    message: "Hi Leo, it's about Anna. She's not answering her phone and it's been quiet all day. Could you knock on her door? You've got the key.",
    reply: 'On my way now. I’ll call you from inside 👍',
    demo: {
      answerBtn: 'Anna answers',
      stateOf: 'Anna',
      stateCaption: 'all you see, most days',
      status: {
        idle: 'Press play. You’re the phone in the middle.',
        quiet: 'Anna’s phone has sat on the windowsill all day…',
        ringing: 'Her phone is ringing. Nobody else knows yet.',
        notified: 'Your phone just went off. Nobody else is told unless you act.',
        calling: 'Calling Anna… Pick up or decline on her phone, or hang up on yours.',
        talking: 'Anna picks up. She’s okay — she’d slept through it.',
        talked: 'Call over. Her phone’s in use again, so it’s back to normal. Nobody else is told.',
        declined: 'Anna declined. That’s her phone in use, so it’s back to normal. Nobody else is told.',
        hungup: 'You hung up. Call again, or tap “Text Leo”.',
        called: 'No answer. Now tap “Text Leo”.',
        messaged: 'Leo’s on his way. Breathe.',
        answered: 'Done. She tapped “I’m fine” — you were never even told.',
      },
      inUse: 'her phone’s in use again',
      note: 'she was in the garden, heard it, and tapped once',
    },
    dial: {
      q: 'If her phone went quiet this morning, when would you find out?',
      lede: 'Not when you’d next speak. When you’d actually notice.',
      srLabel: 'Days until you would find out her phone had gone quiet',
      close: 'You’re close already. Lampsill just covers the days in between.',
      unwell: 'That’s normal for most families. But it’s a long time to be ill with nobody knowing.',
    },
  },

  child: {
    key: 'child',
    tab: 'A son or daughter',
    tabShort: 'Son or daughter',
    tabSub: 'Away for study or work',
    heart: 'You carried the boxes in, hugged him goodbye and went home proud. You’d just like to know he’s okay.',
    theirPhone: 'his phone',
    first: {
      name: 'Adam', initial: 'A', role: 'Your son · away at university',
      h3: 'His phone rings first',
      // Verified: no location permission is requested on either platform
      // (Data Protection §8.2), and the payer only ever sees one of four states.
      body: 'He taps “I’m fine” and it’s over. Nobody else is told. You never see where he is — Lampsill doesn’t even ask for location.',
      phoneLabel: 'Adam’s phone',
    },
    middle: {
      name: 'You', initial: 'You', role: 'Set it up · pay for it', isVisitor: true,
      h3: 'No answer? You’re told',
      body: 'Your phone makes a sound. Two buttons: call him, or text his friend down the hall.',
      phoneLabel: 'Your phone',
    },
    notif: { title: 'Adam hasn’t answered', call: 'Call Adam' },
    nearest: {
      name: 'Sam', initial: 'S', role: 'His friend · lives down the hall',
      h3: 'One tap, and Sam knocks',
      body: 'The text comes from your own phone, so Sam knows it’s you. He’s one knock away. You’re a long journey away.',
      phoneLabel: 'Sam’s phone',
    },
    tapLabel: 'You tap “Text”',
    fromLabel: 'From you',
    message: "Hi Sam, it's about Adam. He's not answering his phone and it's been quiet all day. Could you knock on his door for me?",
    reply: 'Of course. Knocking now 👍',
    demo: {
      answerBtn: 'Adam answers',
      stateOf: 'Adam',
      stateCaption: 'all you see, most days',
      status: {
        idle: 'Press play. You’re the phone in the middle.',
        quiet: 'Adam’s phone has been face down on his desk all day…',
        ringing: 'His phone is ringing. Nobody else knows yet.',
        notified: 'Your phone just went off. Nobody else is told unless you act.',
        calling: 'Calling Adam… Pick up or decline on his phone, or hang up on yours.',
        talking: 'Adam picks up, half asleep. He’s okay.',
        talked: 'Call over. His phone’s in use again, so it’s back to normal. Nobody else is told.',
        declined: 'Adam declined. That’s his phone in use, so it’s back to normal. Nobody else is told.',
        hungup: 'You hung up. Call again, or tap “Text Sam”.',
        called: 'No answer. Now tap “Text Sam”.',
        messaged: 'Sam’s knocking on his door. Breathe.',
        answered: 'Done. He tapped “I’m fine” — you were never even told.',
      },
      inUse: 'his phone’s in use again',
      note: 'he’d slept in after a late night, heard it, and tapped once',
    },
    dial: {
      q: 'If his phone went quiet this morning, when would you find out?',
      lede: 'Not when he’d next text you. When you’d actually notice.',
      srLabel: 'Days until you would find out his phone had gone quiet',
      close: 'You’re close already. Lampsill just covers the days in between.',
      unwell: 'That’s normal when they’re away. But it’s a long time to be ill with nobody knowing.',
    },
  },

  // THE READER IS THE ONE WHO LIVES ALONE. The honest full chain for them is the
  // family flow with someone else in the middle: that person installs Lampsill
  // and is notified; the reader taps twice to say yes. With no SMS service the
  // solo-only version tells nobody, which is what `panelNote` says.
  self: {
    key: 'self',
    tab: 'Myself',
    tabShort: 'Myself',
    tabSub: 'I live alone',
    heart: 'You love your own space. It’s still nice to know someone would notice.',
    theirPhone: 'your phone',
    first: {
      name: 'You', initial: 'You', role: 'Live alone',
      h3: 'Your phone rings first',
      body: 'You tap “I’m fine” and it’s over. Nobody else is told, and nobody sees where you are. You never have to open the app.',
      phoneLabel: 'Your phone',
    },
    middle: {
      name: 'Lena', initial: 'L', role: 'Your sister · looks out for you', isVisitor: false,
      h3: 'No answer? Lena is told',
      body: 'She set it up, and you tapped twice to say yes. Her phone makes a sound. Two buttons: call you, or text your neighbour.',
      phoneLabel: 'Lena’s phone',
    },
    // Neutral on purpose: this is Lena's view of the READER, and nothing on the
    // page may assume the reader's gender.
    notif: { title: 'No answer since this morning', call: 'Call' },
    nearest: {
      name: 'Nina', initial: 'N', role: 'Your neighbour · has your key',
      h3: 'One tap, and Nina knocks',
      body: 'The text comes from Lena’s own phone, so Nina knows it’s real. And Nina is right next door.',
      phoneLabel: 'Nina’s phone',
    },
    tapLabel: 'Lena taps “Text”',
    fromLabel: 'From Lena',
    message: "Hi Nina, it's Lena. I can't get an answer next door and the phone's been quiet all day. Could you knock? You've got the key.",
    reply: 'Going over now 👍',
    panelNote:
      'Rather keep it to yourself? Set it up just for you. Pick 12, 24 or 48 hours. If your phone sits untouched that long, it rings to check on you. That version doesn’t tell anyone else.',
    demo: {
      answerBtn: 'I answer',
      stateOf: 'You',
      stateCaption: 'all Lena sees, most days',
      status: {
        idle: 'Press play. The first phone is yours.',
        quiet: 'Your phone has sat on the kitchen counter all day…',
        ringing: 'Your phone is ringing. Nobody else knows yet.',
        notified: 'Lena’s phone just went off. Nobody else is told unless she acts.',
        calling: 'Lena calls you… Pick up or decline on your phone, or hang up on hers.',
        talking: 'You pick up. You’re okay — you’d slept through it.',
        talked: 'Call over. Your phone’s in use again, so Lena sees normal. Nobody else is told.',
        declined: 'You declined. That’s your phone in use, so Lena sees normal. Nobody else is told.',
        hungup: 'Lena hung up. She can call again, or tap “Text Nina”.',
        called: 'No answer. Now tap “Text Nina”.',
        messaged: 'Nina’s on her way. Someone noticed.',
        answered: 'Done. You tapped “I’m fine” — Lena was never even told.',
      },
      inUse: 'your phone’s in use again',
      note: 'you were in the garden, heard it, and tapped once',
    },
    dial: {
      q: 'If your phone went quiet this morning, when would anyone find out?',
      lede: 'Not when you’d next talk to someone. When someone would actually notice.',
      srLabel: 'Days until anyone would find out your phone had gone quiet',
      close: 'Someone’s close already. Lampsill just covers the days in between.',
      unwell: 'That’s normal for lots of people who live alone. But it’s a long time to be ill with nobody knowing.',
    },
  },
};

type Ctx = { persona: Persona; setPersona: (k: PersonaKey) => void };
const PersonaContext = createContext<Ctx>({ persona: PERSONAS.parent, setPersona: () => {} });

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState<PersonaKey>('parent');
  return (
    <PersonaContext.Provider value={{ persona: PERSONAS[key], setPersona: setKey }}>
      {children}
    </PersonaContext.Provider>
  );
}

export const usePersona = () => useContext(PersonaContext);


/* Small drawn icons for each tab's lamp-coin. Hand-drawn SVG rather than an
   icon font: two icons do not justify a dependency, and these share the brand
   mark's stroke weight so they read as part of the same family. */
const ICONS: Record<PersonaKey, React.ReactNode> = {
  parent: (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M6 15 L16 7 L26 15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13.5 V25 H23 V13.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <rect className="ic-lit" x="13" y="16" width="6" height="6" rx="1" />
    </svg>
  ),
  // the brand mark's own arched window: "my window, with my light on"
  self: (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M9 27 V14 A7 7 0 0 1 23 14 V27 Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M16 8 V27 M9.8 17 H22.2" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".5" />
      <rect className="ic-lit" x="11.2" y="19" width="3.6" height="5.6" rx=".6" />
    </svg>
  ),
  // a block of flats, one window lit: the same "lit window" language as the
  // parent's house, so the two tabs read as home and a flat away from home
  child: (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="9" y="5.5" width="14" height="21" rx="1.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <rect x="12" y="9" width="3" height="3" rx=".5" fill="currentColor" opacity=".55" />
      <rect className="ic-lit" x="17" y="9" width="3" height="3" rx=".5" />
      <rect x="12" y="14.5" width="3" height="3" rx=".5" fill="currentColor" opacity=".55" />
      <rect x="17" y="14.5" width="3" height="3" rx=".5" fill="currentColor" opacity=".55" />
      <path d="M14.5 26.5 V21.5 H17.5 V26.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

/**
 * FOLDER TABS, attached to the panel they control.
 *
 * Replaced a pill switch, which worked and felt like a settings toggle. A tab
 * is only legible as a tab when the chosen one and its panel are ONE surface:
 * same material, no line between them, the chosen tab standing forward while
 * the others sit a few pixels lower and behind. Each tab carries a small lamp
 * that is only lit on the chosen one — picking a person turns their light on,
 * which is the product's own picture.
 *
 * The full WAI-ARIA tabs pattern, because this choice rewrites half the page:
 * role=tablist/tab/tabpanel, aria-selected, a roving tabindex so the tab
 * strip is one stop in the tab order, and Left/Right/Home/End to move between
 * tabs. Selection follows focus, which is right when switching is instant and
 * cheap, as it is here.
 *
 * The ids are namespaced by `id`, so the strip can appear more than once.
 */
export function PersonaTabs({
  id,
  size = 'lg',
  children,
}: {
  id: string;
  size?: 'lg' | 'sm';
  children: React.ReactNode;
}) {
  const { persona, setPersona } = usePersona();
  const keys: PersonaKey[] = ['parent', 'child', 'self'];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = keys.length - 1;
    const next =
      e.key === 'ArrowRight' ? (i === last ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i === 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setPersona(keys[next]);
    refs.current[next]?.focus();
  };

  return (
    <div className={`ptabs ptabs-${size}`}>
      {size === 'lg' && (
        <p className="ptabs-label" id={`${id}-label`}>
          Who are you looking out for?
        </p>
      )}
      <div
        className="ptabs-list"
        role="tablist"
        aria-label={size === 'lg' ? undefined : 'Who are you looking out for?'}
        aria-labelledby={size === 'lg' ? `${id}-label` : undefined}
      >
        {keys.map((k, i) => {
          const selected = persona.key === k;
          return (
            <button
              key={k}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${k}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              className="ptab"
              // one accessible name whichever label is on screen
              aria-label={`${PERSONAS[k].tab}: ${PERSONAS[k].tabSub}`}
              onClick={() => setPersona(k)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <span className="ptab-coin">{ICONS[k]}</span>
              <span className="ptab-text">
                <span className="ptab-title">
                  <span className="t-full">{PERSONAS[k].tab}</span>
                  <span className="t-short">{PERSONAS[k].tabShort}</span>
                </span>
                {size === 'lg' && <span className="ptab-sub">{PERSONAS[k].tabSub}</span>}
              </span>
            </button>
          );
        })}
      </div>
      <div
        className="ptabs-panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${persona.key}`}
      >
        {children}
      </div>
    </div>
  );
}
