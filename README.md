# lampsill.com

Next.js 16 (App Router) + GSAP + Lenis. Deploys to Vercel with the default
settings — root directory `lampsill_web`, framework preset **Next.js**.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

Only one `next dev` can run per folder (Next 16 holds `.next/dev/lock`). If it
won't start, look for another one already running: `lsof -iTCP:3000 -sTCP:LISTEN`.

**Testing on a phone:** open the "Network" address `next dev` prints. It is
allowed by `allowedDevOrigins` in `next.config.mjs` (private-network ranges,
dev only). Auto-refresh-on-save doesn't work at that address — refresh by hand.

## ⚠️ Content must never depend on JavaScript to be visible

Opened at the Network address before `allowedDevOrigins` existed, Next blocked
its dev connection, React never started, and the page was a header and an empty
glow — every headline and section was hidden by CSS waiting for JavaScript to
reveal it. A real visitor on a flaky connection would have seen the same.

Every "hidden until animated" rule is now scoped to `:where(html[data-js])`:

- an inline script in `app/layout.tsx` sets `data-js` before first paint, so
  animations start hidden as designed with no flash;
- `<Reveals>` sets `data-ready` once React is running;
- if `data-ready` hasn't appeared within **4 seconds**, `data-js` is removed and
  everything is simply shown, unanimated.

`:where()` adds no specificity, so every existing reveal rule still wins. Add a
new "starts hidden" style? Scope it the same way. Attributes, not classes, on
`<html>`: React owns its `className`.

This replaces `../lampsill_site`, which was one static HTML file. That folder is
kept only as the reference for copy that has not been ported; **delete it once
you are happy here**, because two sites that disagree about the price is exactly
the kind of thing that gets shipped by accident.

---

## ⚠️ Read this first: the price reverses a published promise

The store listing and the previous site both said **"Free, permanently."** This
build charges — **£1.99/month in the UK, priced per country** (see "Payments" below). That was a deliberate decision, and it is *not
finished* until all of the following are true:

- [ ] `Lampsill — Store Listing and Claims` describes the paid plan (not a price — the app and store listing must never show one), and the phrase
      "free, permanently" appears nowhere in it.
- [ ] **§5.1 is rewritten or retired.** It currently reads "the free tier claims
      strictly less", which no longer describes a product that exists. Right now
      there is exactly one tier.
- [ ] Anyone who saw the original promise is told, if you have any way to reach
      them. A silent free→paid switch is the single fastest way to lose the
      goodwill this product needs.

The prices live in `lib/pricing.ts` and nowhere else — and in the Dodo dashboard, which must match. Change both together.

### What charging does NOT change

Taking money makes these **more** binding, not less — an overclaim somebody paid
for is a refund at best and a misrepresentation at worst.

| Rule | Forbids |
|---|---|
| §2.3 — never guarantee detection | "always", "24/7", "never miss", "guaranteed" |
| §2.5 — no medical claims | "fall detection", "health monitoring", "medical alert" |

`components/WhatThisIsnt.tsx` is now the section immediately before the price,
and that is deliberate: the moment somebody is about to pay is the moment they
are owed the limits, and nobody can reach the button without passing them.

---

## ⚠️ This site now sells the FAMILY version — which is not in v1

The page leads with three people, because that is the product visitors need to
understand and the one the owner is charging for:

| Person | What they get |
|---|---|
| **The person who lives alone** (Mum) | Her own phone rings first — *"Still there?"* One tap ends it. |
| **You** — set it up, pay for it | After 10 minutes with no answer, a notification with a sound, opening onto Call / Text / WhatsApp. |
| **Their nearest person** (Raj) | A message **from you**, sent from your own phone via your own messages app. |

Every number is from `Lampsill — Worked Example.md` and lives in `lib/copy.ts`
under `FAMILY`: 12 quiet hours with at least 6 in waking hours, 10 minutes of
ringing before you're told, your alert sounding for up to 15 minutes.

**Nobody is texted by a server.** That was the owner's decision (no SMS
service), and it is Branch B of the worked example. The page states the
consequence plainly in "What it doesn't do" and the FAQ: **if you miss the
notification, nobody else is contacted** (Branch C). Do not soften that line on
a page that takes money for cover.

### One story per tab, in the same space

**Readers who never touch the tabs still find the other stories.** The story
section opens with its own picker — three windows at night, the story being
read lit gold (`StoryWindows` in `components/Story.tsx`) — and ends with the
other two as "Another window, another story". It is the same shared choice as
the tabs, so the phones and the question follow it. The picker sits outside the
part that remounts, so it never blinks; choosing from the end row switches
first and then scrolls to the new story's top, because the sections above change
height with the family.

The story section follows the tab rather than stacking three stories: at four
screens each on a phone, three would have undone the length cut. Each reader
gets the story that is theirs, at no extra length.

| Tab | Story | Scene |
|---|---|---|
| A parent | Anna, Maya and Leo, one Tuesday night | `scenes/StreetScene.tsx` |
| A son or daughter | Adam, Sam and one long exam week | `scenes/StudentScene.tsx` |
| Myself | You, Lena and Nina, one Tuesday night | `scenes/StreetScene.tsx` |

**The id contract.** The engine in `Story.tsx` animates elements by id, and both
scenes supply the same set — `#winMain #frameMain #lamp #lampLip #in-* #out-*
#rings #sillWash #doorLight #winNbr #in-nbr #out-nbr #arc #arcbg #skyLayer
#dawnRect #stars #street #blockFar`. The main window sits at identical
coordinates in both, because the lighting kits, the rings and the breathing
lamp are positioned for it. That contract is why one engine, with all four
ordering fixes, drives both pictures. The student scene's "door" is the
stairwell glazing lighting up — there is no front door to open in a student
block. Add an animated element to one scene and you must add it to the other.

**The story remounts on a tab change** (`<StoryInner key={persona.key}>`). The
engine builds its elements and ScrollTriggers once on mount; a key change gives
it a clean unmount through `gsap.context().revert()` and a fresh mount against
the new scene, rather than animating elements that no longer exist.

### Names that travel, and feeling that's true

**Every name on the page works in most countries.** The cast was Mum, Raj,
Arjun, Priya and Meera, with Leicester, Manchester, "uni", "flatmate" and
"paracetamol" — which placed the page in one or two countries before anyone read
a sentence. It is now:

| | Lives alone | Told | Nearest |
|---|---|---|---|
| A parent | Anna, your mother | you | Leo, her neighbour |
| A son or daughter | Adam, at university | you | Sam, down the hall |
| Myself | you | Lena, your sister | Nina, your neighbour |
| The story | Anna | her daughter Maya | Leo (and Anna's sister Clara) |

Relationships are written out ("your mother", "your grandmother") rather than
Mum / Mom / Gran, which are each regional. Messages to the nearest person say
who they are *about* ("it's about Anna"), not who they're from, because the
sender could be a son or a daughter and the phone already shows their name.

**Still regional, deliberately left for a decision:** spelling is British
("neighbour"). The price is no longer regional — it follows the visitor's
country (see "Payments").

**Emotion.** Each tab opens on one line of what its reader is carrying
(`heart` in `Persona.tsx`), the hero opens on *"You can't be there every day"*,
and the story now has a daughter who lies awake, is halfway through the dishes when
her phone goes off, sits on the kitchen floor and cries from relief, and a longer Sunday
call afterwards. Two rules held throughout:

- **Relief, never fear.** Nobody is rescued; nothing on the page suggests
  Lampsill detects anything. The strongest moment is someone crying because
  everything was fine.
- **Second person, never in quotation marks.** An unattributed quote reads as
  a customer testimonial, and this page must not contain an invented one.

### How it works is the demo

"How it works" (a static cast of three people) and "Try it" (three playable
phones) used to be two sections that explained the same chain twice. They are
one now, `components/HowItWorks.tsx`: three live phones, each above the one
sentence that says what that person gets, joined by a line that lights up only
when the person before hasn't answered.

- **It plays itself** the first time the section is 40% up the screen, so the
  explanation happens without anyone finding a button. Once only, never under
  reduced motion. After that, Play/Replay; and a tab switch replays for the new
  family if the reader has already watched one.
- **It still stops at the notification.** Nobody is messaged until the visitor
  taps "Text". That is the real behaviour (no server fallback) and must stay so.
- **Before it plays, it reads as a plain explanation**: every phone at rest,
  every sentence fully lit. During a run, the person the story is on is lit and
  the others dim.
- Desktop lines the connectors up with the phones using CSS subgrid; phones
  under 60rem are a swipe with step chips and numbered dots, and the row
  scrolls itself to whichever phone matters.

### Three tabs: a parent, a son or daughter away, or myself

The same product covers all three, and the page shows all three. A switch at
the top of "How it works" — **"Who are you looking out for? · A parent · A son or
daughter · Myself"** — swaps the people on the three phones, the dial question
and the story, from `components/Persona.tsx`.

The switch is **folder tabs attached to the panel they control** (`PersonaTabs`),
rendered once, on the three phones, and shared by every section below. Three things
make them read as physical tabs rather than buttons above a box, and all three
are easy to break:

- **The chosen tab and its panel are one surface.** Same background, an
  *identical* fixed-attachment light gradient on both, and the chosen tab drops
  1px so its own body covers the panel's top border. The first version laid a
  strip of flat `--surface` over that border instead, and it showed as a dark
  line — the panel on screen is `--surface` *plus the light*, so a flat patch is
  darker than both sides of it. The panel also has no inset top highlight,
  which would draw a hairline through the join.
- **Unchosen tabs sit 8px lower, BEHIND the panel.** The tab row must have no
  `z-index` of its own: it had `z-index: 2`, which put every tab — chosen or not
  — in a layer above the panel (1), so unselected tabs hung 8px down over the
  panel's edge. Without a stacking context on the row, unselected tabs (0) go
  behind the panel and the chosen one (3) comes in front. Checked with
  `elementFromPoint` just inside the panel's edge under each tab.
- **Each tab's lamp lights only when chosen** — a house with a lit window for a
  parent, a block of flats with one lit window for a son or daughter.

Full WAI-ARIA tabs pattern: tablist/tab/tabpanel, `aria-selected`, roving
`tabindex` (the strip is one Tab stop), Left/Right wrap, Home/End. Each tab has
one accessible name (`aria-label`) whichever label is visible.

**Tab height is a budget.** Stacking the lamp above the title to fit three tabs
across made them 100px tall on a phone and 119px on a tablet — 17% of a phone
screen to choose between three words. Below 52rem the tabs are now one row: the
lamp becomes a glowing dot (lit only on the chosen tab), subtitles go, and below
30rem the labels shorten to Parent · Son or daughter · Myself. Measured: 36px on
a phone, 37px on a tablet, 66px on desktop (with subtitles); 320px phones fit
without overflow.

**Myself** puts the reader in the FIRST position, and someone else — Priya, a
sister who set it up for them — in the middle. That is the honest full chain for
someone who lives alone: it is the family flow with another person notified.
The solo-only version (it rings you and tells nobody, because there is no SMS
service) is stated in the panel note under that cast. This replaced the old
"Live alone yourself?" section after the price.

**Every sentence about a person is written out in full per persona** in
`components/Persona.tsx`. Pronoun templates worked for Mum and Arjun and broke
the moment the reader was the person living alone ("You hasn't answered").
Strings about the reader are gender-neutral: Priya's notification is "No answer
since this morning", not "your sister".
Fact sections are written neutrally ("they", "their") so they need no switch.

What makes the young-adult case safe to sell, all verified in code or the Data
Protection doc rather than written for the page:

- **It is their consent, on their own phone, revocable by them alone.** The
  payer cannot switch it back on, and sees `permission lost` rather than a
  false green light (Data Protection §3, §8.3).
- **No location, at all.** No location permission is requested on either
  platform (§8.2). The page says so, because "is my mum tracking me?" is the
  first objection a 20-year-old has.
- **Late nights.** The waking-hours rule, the first-week learning, and a sleep
  window with a guard that always leaves at least 6 waking hours
  (`AwayService::setSleepWindow`). Away time can be set by either side and
  shows on both phones.

Two honest gaps the FAQ states, and must keep stating:

- **Time zones are not handled.** The detector works to *their* clock, so a
  parent abroad can be notified in their own night — and if they sleep
  through it, nobody else is contacted.
- **There is no age policy.** The lawful basis is the monitored person's own
  consent, so the page is written for grown-up children (uni, work) and does
  not pitch at parents of under-18s. Decide this before marketing to them.

The store listing's keywords are all older-parent (`elderly parent`, `ageing in
place`). If the young-adult case is being sold, they need adding there too.

### Before this goes live

- [ ] **Push notifications exist.** Plan item 1.9 is not built; the payer alarm
      currently fires only while the app is open. Every "you get a notification"
      on this page depends on it.
- [ ] **`Escalation::LADDERS` is rewritten with a payer rung.** As written, the
      code skips the payer and goes straight to the contacts (§7 of the worked
      example).
- [ ] The consent link Mum taps has a way to reach her that isn't an SMS service.
- [ ] Store listing and claims updated to describe the family version (no price in the app or listing).
- [ ] **A call they pick up or decline really does put the payer back on
      "normal".** The demo shows it (both endings go back to normal by
      themselves; only a call nobody touches stays an alert). Three things must
      be true first:
  - [ ] **A ringing screen doesn't count as use.** Android counts
        `ACTION_SCREEN_ON` as phone use (`SensingForegroundService.kt`), and an
        incoming call turns the screen on by itself — so a call nobody touches,
        a spam call or a lit-up notification would reset the clock too, and the
        payer's own check-in call could make Lampsill say "normal". Count
        unlocks only, or ignore screen-on while the phone is ringing.
  - [ ] **Use during an alert already under way cancels it.** The worked example
        says so for the solo version's 30-minute grace; it says nothing for the
        family version once the payer has been notified. A product decision.
  - [ ] **iPhone.** `SensorHost.swift` has no unlock signal and no local clock,
        so a decline on an iPhone is invisible to the phone itself. Decide what
        the server path sees, or the demo overclaims for iPhone users.

### The solo version on this page

`ForYourself` offers two honest options: ask someone to be the one who's
notified (the real family flow, with you as "Mum"), or set it up just for
yourself — in which case **it rings you and tells nobody else**, matching the
app's no-texting build. It must never say "your person hears" for the solo
version: with no SMS service there is no one to send that message.

---

## Length on a phone

Measured at 375×812 with every section revealed:

| | Before | After |
|---|---|---|
| **Whole page** | **20.2 screens** | **14.2 screens** |
| Price starts on | screen 17 | screen 12 |
| Hero | 1.4 | 0.8 |
| Three people | 3.1 | 1.5 |
| "Why it won't wake you" | 1.5 | cut |
| Story | 5.2 | 4.2 |
| Privacy | 1.6 | 1.0 |
| What it doesn't do | 1.4 | 1.0 |
| FAQ | 1.6 | 1.3 |

The problem was repetition more than section count: the same chain was shown
three times (since cut to once — see "How it works is the demo" below), and "Why it won't wake you" said a third time what the cast and the
FAQ already said. It was cut on every screen size. Everything else is a
**phone-only layout change with the same words**: the three phones become a swipe with
step chips and numbered dots, story beats lose their minimum height and italic
asides, privacy's two panels sit side by side, "What it doesn't do" becomes a list,
the decorative window under the hero goes, and the FAQ starts fully closed.

The price button is sticky in the header throughout, so the price is always one
tap away whatever the length. **The story (4.2 screens) is the remaining lever,
and shortening it further means cutting beats or copy** — an editorial call,
not a layout one.

Re-measure with the snippet in the git history of this README if you add a
section; the rule of thumb that fell out of this is **one idea, one place**.

---

## ⚠️ Every product claim is checked against the app, not written to sound good

This site shipped three false claims and all three were caught by opening the
app's source, not by rereading the copy:

| Claimed | True | Source |
|---|---|---|
| "Your window, from 12 hours to a week" | **12, 24 or 48 hours** | `SilenceConfig.windowOptions` in `lampsill_app/lib/data/models.dart` |
| "Away time **and sleep time**" | Pausing up to 7 days; sleep time exists only in the care tier | `SilenceConfig::MAX_PAUSE_DAYS`, `MonitoredPerson::MIN_WAKING_HOURS` |
| "No third party in the loop" | Texts go through an SMS provider, payment through Dodo Payments | — |

`lib/copy.ts` also claimed its window hints were "lifted verbatim" from the app
and had invented them, including a 72-hour option that does not exist. They are
now the app's real strings.

**"Rings for half an hour" is phrased as "half an hour to answer" everywhere.**
The 30-minute grace period is true on both platforms; continuous ringing is not
yet, because the Android alarm currently sounds once. Change this back only
when Android repeats.

Numbers that come from the product live in `lib/copy.ts` as `WINDOW_OPTIONS`,
`GRACE_MINUTES` and `MAX_PAUSE_DAYS`, with the file they came from beside them.
Import them; don't retype them.

---

## Making it easy to get

The page used to lead with feeling — a reflective question — and made people
wait two sections to learn what the product *was*. The order is now:
**understand it, try it, feel it, trust it, buy it.**

**The dial question now sits directly under the hero** — and that is not a
return to leading with feeling. The hero already says what the product does;
the question comes second, is short (no eyebrow, no closing promise), and ends
on a link down to the three phones. It used to sit *after* the demo, asking
about the problem once the reader had already seen the fix, and it closed on
"you'd know in hours", a timing claim the demo now shows honestly instead.

- **Hero** is one sentence describing the mechanism in the order it happens,
  plus two buttons and three short points.
- **How it works** (`#how`) sits directly under the hero: three steps, each a
  small moving picture that *shows* the step, so someone who reads nothing
  still gets it. The rail joining them is desktop-only — on a phone it had
  nowhere to run but through the paragraphs.
- **The demo** says what to do as three numbered chips, and "Touch the phone"
  is disabled until there is something to cancel.
- **The dial** says "Drag me" until it is first touched.
- **FAQ** (`#faq`) at the end answers the specific question somebody is still
  stuck on. Native `<details>`. Two questions were left out deliberately —
  "what if my battery dies?" and "is Android the same?" — because the honest
  answer depends on decisions not yet made, and a vague answer is worse than
  none.

---

## ⚠️ Never let an imperative class and a React className share an element

The dial vanished the instant you pressed it. The scroll-reveal observer did
`classList.add('seen')`; pressing the dial changed its React `className` to add
`dragging`; React rewrote the whole class attribute from its own idea of it,
`seen` was wiped, `.reveal` went back to opacity 0 — and the observer had
already stopped watching that element, so nothing ever brought it back.

The fix is general: **state set from outside React goes in a `data-` attribute**
(`data-seen`, `data-set`). React only writes attributes it renders, so no
re-render anywhere can clear them. The story's `.beat.live` and `#scene.defocus`
are still classes and are safe only because those elements never re-render —
if that ever changes, move them too.

In-page anchors scroll through Lenis with an offset **measured from the sticky
masthead**. A fixed offset hid every section's eyebrow underneath it.

**`Reveals` also watches for `.reveal` elements added later** (a
`MutationObserver` on `<body>`). It used to collect them once on load, and the
story remounts on every tab switch — so after anyone touched a tab, the story's
header ("Anna, Maya, Leo, and one Tuesday night") was a brand-new element the
observer had never seen, and it stayed at opacity 0 for the rest of the visit,
even scrolled into view and even after switching back. Anything that remounts
and carries `.reveal` is now covered automatically.

---

## The one idea: a single light, and you are holding it

Every surface on this page is lit by one warm source that follows the pointer.
That is not a decoration — the product is a lamp in a window, so the site
behaves like a room with a lamp in it.

`LightField` writes exactly two custom properties on `<html>` and does nothing
else. Everything visible is CSS:

- `.lightfield` paints the bloom.
- **every `.lit` surface paints its specular with `background-attachment: fixed`**,
  which positions the gradient against the *viewport* rather than the element.
  So each plane shows precisely the slice of one big light that falls across it
  — one light, many surfaces, no per-element measurement, and nothing in the
  paint path but two variables updated once per frame.

The light **eases** toward the pointer rather than snapping. A light that snaps
reads as a cursor effect; a light that lags slightly reads as a lamp with mass.
Coarse pointers get a fixed flattering position and no listener at all, because
a light that only moves while you are dragging the page is worse than one that
sits still.

`background-attachment: fixed` is unreliable in iOS Safari. The degradation is
that the light sits centred instead of following, which is fine.

---

## What each section is doing

| Section | The craft, and why |
|---|---|
| `Hero` | Headline **masks up word by word** — each word in its own overflow box, rising out of it, so it reads as type being set rather than text fading in. Split by word, never by character: character-splitting a serif headline breaks the kerning pairs and screen readers spell it out. |
| `HowItWorks` | Three steps as three small moving pictures, directly under the hero, so the product is graspable without reading. |
| `GapQuestion` | A custom dial, because this slider *is* the argument and a default range input feels like a settings screen. It stays a real `<input type="range">` underneath — reimplementing keyboard handling and ARIA values is how sliders end up unusable. |
| `PhoneDemo` | Real strings, real sequence, compressed time labelled on screen. Tilts toward the pointer because it is the one object on the page you are invited to pick up. `cleared` is reachable from every phase because "any interaction cancels it" is the real product rule. |
| `Story` | See below. |
| `Gates` | Three tumblers that slide into their slots. The argument is mechanical — three independent conditions, all true — so the picture is a lock, not three cards. |
| `DataModel` | 320 drifting dots against one. Canvas, because drifting 320 DOM nodes on the main thread is how a scroll gets janky. No invented statistic and no named competitor — a shape meaning "a lot" beside a shape meaning "one". |
| `Faq` | Native `<details>`. Every answer checked against the app. |
| `Pricing` | Talks to `/api/checkout`, which **refuses cleanly with 503 until Dodo Payments is configured**, surfaced as "not open yet" with a working mailto. Never a spinner that never resolves, never a fake success. |

### Copy that leads with the mechanism

An earlier version opened on *"Not an emergency. Just —"*, which made the
eleventh word on the page a negation, and put a hero button captioned "What it
can't do" — an exit ramp beside the entrance. Don't overclaim ≠ apologise.
Those got conflated once; don't do it again.

The SMS body in `lib/copy.ts` is the exception. It is the literal message a
contact receives, its hedges exist to stop somebody panicking at nine in the
morning, and it does not get optimised for conversion.

---

## The story section: four ordering traps

All four are the same bug wearing different hats — **the thing you see is not
decided by the beat that fired last** — and all four only appear when scrolling
**backwards or in jumps**, which is exactly what nobody does while building it.

1. **Which beat is showing is computed from geometry** (`pickActive`), never
   from `onEnter`/`onEnterBack`. On a jump ScrollTrigger fires every trigger it
   crossed and the last to *run* wins, which put the door beat on screen still
   holding the previous beat's message bubble.

2. **`gsap.defaults({ overwrite: 'auto' })`**, because otherwise the last tween
   to *finish* wins, not the last to start. The door fades the bulb up over
   0.7s and the alarm ducks it over 0.4s — the alarm fired last and the door
   still won, so the window sat there cosy and gold while the phone was
   screaming.

3. **`clearQueued()` first thing in every beat**, because overwrite cannot kill
   a tween that has not started. Ellie's window lights on a 0.55s delay;
   scrolling backwards through that beat fired it into a scene that had moved
   on, and her light came on during the alarm — which in this story is not a
   glitch, it is a claim that she knew before anyone told her. Scoped to
   `opacity`, because killing every tween on those targets also stops the lamp
   breathing, permanently, the first time anyone scrolls.

4. **No `gsap.fromTo` anywhere a beat can run twice.** A delayed `fromTo` keeps
   its from-state in `startAt` and re-renders it at progress 0, and
   `clearQueued` strips the property without removing the tween. After eight
   visits there were eight dormant fromTos on Ellie's window each still holding
   `opacity: 0`, and the moment the live tween left the global timeline a zombie
   rendered and her light snapped straight back off — on the exact frame the
   payoff was meant to land. The tell was `gsap.getTweensOf('#in-nbr').length`
   climbing by one per visit and never coming down. **Use `set` + `to`.**

The rule that falls out of all four: **a beat states its whole world and never
inherits.** A beat that looks different depending on which direction you
scrolled into it is a beat that is wrong for half the readers.

Verified by walking 17 beat transitions in both directions and asserting the
light state at each one.

### Two layout rules that look like tidiness and are not

- **`.story-grid` must not have `align-items: start`.** With `start` the stage
  column shrinks to its own content height, so the sticky stage's containing
  block is ~430px tall and it has nowhere to travel. It unsticks immediately
  and every beat after the first scrolls past an empty gap.
- **`.scene-box` must keep its `aspect-ratio`.** The artwork is 200×132 shown
  with `slice`. On a desktop column stretching is harmless (1.38 vs 1.52); on a
  phone the band is 2.85, which keeps 70 of the drawing's 132 units and throws
  away the pavement, the doorway and the clock.

---

## The 3D street in the hero

`components/Diorama.tsx`, three.js, no React wrapper. A small street at night:
Anna's house with the arched lit window (the mark, built), Leo's next door, a
street lamp, a moon — each house with a real room behind its window. **Drag**
turns it like a model on a table. **Play the story** (or tap the street) runs a
30-second film in eight steps, each with a clock time and one sentence
(`STEPS`/`AT`/`CAMERA` at the top of the component):

1. 08:40, daylight — Anna puts her phone on the windowsill
2. the clock races to evening, the lamps come on — "she doesn't pick it up all day"
3. 20:50, close on the window — her phone rings red, "Still there?" pinned over it
4. 21:00 — your phone's alert slides in; "Text Leo" is tapped
5. the text flies across the street as a light to Leo's window
6. Leo's floor lamp switches on
7. his door opens and he walks over and lets himself in
8. her door stands open in warm light — "two lights on instead of one"

Every step is the product as designed: her phone asks first, you are alerted,
the text comes from you, and Leo is a neighbour with a key. Reduced motion cuts
between shots instead of gliding.

- **The SVG mark is the first paint and the fallback.** The canvas fades in over
  it only after its first frame, and never replaces it without WebGL.
- **three.js is dynamically imported**, so it never delays the headline. The loop
  runs only while the scene is on screen and the tab is visible; pixel ratio is
  capped at 1.75; one shadow map.
- **Reduced motion:** the scene still draws and can still be dragged, but never
  sways or breathes by itself.
- **Phones get it too**, under the hero buttons, compact (aspect 1 : 0.82). It is
  the 30-second explanation, so it earns the space the flat picture didn't.
  Phones and touch screens render it lighter: pixel ratio ≤ 1.5, no
  antialiasing, no shadow maps on the two room lamps, smaller shadow maps
  elsewhere. A swipe that starts on the street scrolls the page and does not
  start the story (pointercancel is not a tap).
- **One story button.** With the street on screen, "Play the story" under it is
  the only control; the hero's "Read the story" link appears only when the 3D
  street isn't there (WebGL unavailable), via `.hero:has(.diorama[data-ready])`.
- **The hero column is `minmax(0, 1fr)` on phones**, and the canvas redraws the
  moment it's resized. An auto-width column grew with the caption under the
  street, every step change nudged the canvas size, and a resized canvas
  blinks black for a frame.
- Every mesh, material and the renderer are disposed on unmount.

## The mark

Same paths, stroke widths and opacities everywhere it appears — masthead, hero,
and the window the demo draws:

```
frame   M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z   4.8, linejoin round
bars    M32 13 L32 52   and   M17 34 L47 34          3.2, linecap round, .5
pane    x 20  y 37.5  w 9  h 10.5  rx 1
```

Both bars, four panes, the lit one **inset in its quadrant**, not filling it.
Only `app/icon.svg` is allowed to differ — it drops the bars, and its own
comment says why.

Three files hold a copy of those paths rather than importing them: `Mark` in
`components/Chrome.tsx`, `app/icon.svg`, and `assets/og/card.html`. A favicon
and a screenshotted card cannot import a React component, so the duplication is
unavoidable — but it means a change to the geometry is a change to three
files, and a mark that matches in two of them is worse than one that matches in
none, because nobody notices.

The viewBox is cropped to the ink (`13.5 9.5 37 45`). In the asset's native
`0 0 64 64` a "30px" mark is 21px of drawing inside 9px of nothing, which makes
it look tiny, and the dead space down its left edge indents it against the `h1`.

---

## The share card

`public/og.jpg` — the hero cut of the mark on the dark ground, the headline in
Newsreader. It is what Facebook, LinkedIn, X, Slack, WhatsApp and iMessage draw
when someone posts a link here.

**1200×630 of layout, shipped as 2400×1260 of pixels, as a 185KB JPEG.** All
three of those numbers were argued rather than picked, so before changing any
of them:

- **1.91:1** is the one ratio all six platforms agree on. `card.html` is laid
  out at 1200×630 and the CSS assumes it.
- **2×** because 1200 is the platforms' *floor*, not a target, and every one of
  them is read on a retina display, where a 1200px card is upscaled and the
  serif goes soft. The first cut of this rendered at 2× and then resized back
  down to 1200 — which spends the entire 2× render on antialiasing and throws
  the rest away.
- **JPEG, at quality 92 with 4:4:4 chroma**, on a flat dark graphic where PNG
  is the obvious choice. 2400×1260 as PNG is 756KB, and WhatsApp stops
  rendering a rich preview somewhere around 300KB — so the PNG buys sharpness
  on five platforms by losing the picture entirely on the sixth. The JPEG is
  185KB at 47dB PSNR and a 1:1 crop of the headline against the PNG is
  indistinguishable. `build.sh` fails the build if the file creeps past 290KB.

Banding was the other worry and isn't one: Chrome dithers its gradients, and a
50× contrast stretch over the glow shows dither texture rather than contour
rings. That is why there is no grain layer in the card.

It is **committed, not generated at build time**. To change it:

```
edit assets/og/card.html   (or assets/og/alt.txt)
./assets/og/build.sh
```

That renders the card in headless Chrome with the site's real webfonts inlined
as data URIs — so there is no network round trip racing the screenshot, which
is how a card ends up shipping in Times New Roman — and rewrites `lib/og.ts`, a
generated constant holding the URL, the size and the alt text, which
`app/layout.tsx` feeds to both the `og:` and `twitter:` tags. The `?v=` on the
URL is the image's content hash: every one of those platforms caches a share
image **by URL and does not come back to check**, so a card whose bytes changed
under a stable URL is a card that never updates anywhere.

One thing in `card.html` is not a copy of the shipped brand asset and says so
at length in its own comment: the mark's glow. `brand/v2/mark-hero.svg` is
drawn to be correct from 128px up, where its widest wash spans about 90px. At
the 420px this card uses it spans 300px, and 13% gold spread that thin over
that much area stops reading as light and becomes a flat grey lift across a
third of the card — the same "grey haze that reads as a rendering fault" that
file warns about at the *other* end of the size ladder. The card rebuilds it as
a falloff instead: a hot core at the pane, a spill on the sill, a faint room
behind. Same colour, same offsets, same idea.

Two decisions in there are worth knowing about before anyone tidies them up,
and both are argued in full in the header of `assets/og/build.sh`:

- **Not `next/og`'s `ImageResponse`.** It would move the card's rendering into
  every production build, where a font fetch turns into a failed deploy. The
  card changes about twice a year. (`rsvg-convert`, which `brand/v2` uses, is
  out for a different reason: it sets type from fontconfig, and Newsreader and
  Atkinson Hyperlegible are `next/font` downloads rather than system fonts, so
  the card would come out in a fallback serif and look deliberate.)
- **Not `app/opengraph-image.png`**, which is the idiomatic Next convention and
  was tried first. Next 16 builds on Turbopack, and Turbopack does not read
  `opengraph-image.alt.txt` — only the webpack loader does. The file convention
  also shadows `metadata.openGraph.images`, so the alt text cannot be supplied
  by hand either, and `og:image:alt` is silently never emitted. On a site that
  picked Atkinson Hyperlegible for readers with cataracts, that is not a
  detail to shrug at. If Turbopack ever reads the file, this all collapses back
  into the convention and `lib/og.ts` goes.

---

## Security

The CSP in `next.config.mjs` is markedly tighter than the static site's, and it
is the one concrete thing the framework bought that nothing else could:

- GSAP and Lenis are npm dependencies, so `script-src` no longer allows
  cdnjs.cloudflare.com. An allowed CDN is an allowed CDN.
- `next/font` self-hosts all three typefaces at build time, so neither
  `fonts.googleapis.com` nor `fonts.gstatic.com` is in there either.

`'unsafe-eval'` is development-only. Production gets neither it nor any remote
script origin.

---

## Early-access sign-ups (the demand test)

Before hosting the real application, the site asks for one thing: **be one of
the first 100 on the list, and your first 2 months are free**. The masthead
button, the pricing section's button and the hero all point at the form
(`#join`, `components/EarlyAccess.tsx`). Nobody is charged and no card is asked
for.

### Why a limited number of places, and why not a prize draw

The limit is the hook: this might not still be here tomorrow. A **prize draw**
would give the same pull and cost far more — published rules, a closing date, a
defensible way of picking winners, and an answer that can't arrive until after
the draw. Places given **in order of arrival** need none of that, and they can
do the one thing a draw can't: tell somebody where they stand at the instant
they press the button. "You're number 37" beats "we'll be in touch if you win".

So the count is real, and decided in the database, never in the browser:

- `placesLeft()` in `app/api/join/route.ts` counts the table.
- On sign-up, the row is written with its `spot` and with `free_months` set to
  2 **only while places remain** — after that, 0.
- `GET /api/join` returns `spotsLeft` for the counter above the button. If it
  can't answer, the form shows no number at all rather than a made-up one.
- Two sign-ups in the same instant can share a number, which gives away one
  extra free place rather than one too few. That is the right way round to be
  wrong, and a lock across a serverless pool isn't worth it here.

**Never fake the counter.** The people filling this form are trusting the
product with someone they love. If more places are wanted, raise
`EARLY_ACCESS.freeSpots` in `lib/copy.ts`.

⚠️ **When the places run out, three static labels go stale** — the masthead
button ("100 free places"), the hero point ("first 100 start free") and the FAQ
answer. They are rendered on the server and can't see the count. Either raise
`freeSpots` or reword those three. The form itself is always right: it switches
to "the 100 free places have gone" and tells latecomers plainly that theirs is
at the normal price.

**Where the data goes:** straight from this site into a free **Neon** Postgres
database (`app/api/join/route.ts`). No lampsill_api, no email service. Neon was
chosen over Supabase because Supabase's free projects pause after a week with no
activity, and a waitlist gets sign-ups in bursts.

### Set up (about five minutes)

1. Create a free project at neon.com. Pick an **EU (Frankfurt) or UK-nearest
   region** — these are personal details of UK/EU people.
2. Copy the connection string (Dashboard → Connect).
3. Add it to the host's environment settings, and to `.env.local` for local dev:
   ```
   DATABASE_URL=postgres://…neon.tech/neondb?sslmode=require
   JOIN_SALT=any-long-random-string
   ```
4. That's it. The `early_access` table creates itself on the first sign-up.

Without `DATABASE_URL`, the form says sign-ups aren't open and gives the email
address, rather than pretending to save anything.

### What is stored

| Column | Why |
|---|---|
| `email` (unique, lowercased) | To send the free months at launch |
| `name` (optional) | To greet them |
| `looking_after` — parent / child / self | Which tab should lead the page |
| `their_phone` — iphone / android / unsure | **Whether the product can work for them** — iOS can't see unlocks |
| `wants_to_test` | Pilot recruits |
| `country` | Which market to open first |
| `spot` | Their place in the queue — the number the page shows them |
| `free_months`, `consent_version` | Exactly what each person was promised and agreed to |
| `ip_hash` | Salted hash, only to stop one address flooding the form. Never the raw IP |

Signing up twice updates the same row (keeps the original date, place and free
months), and the reply is identical either way, so the form never reveals who
is already on the list. Nobody loses their number by filling the form in twice,
and nobody moves up the queue by it. A hidden field catches simple bots.

### Reading the results

Neon console → **SQL Editor**:

```sql
-- how many, and how fast
SELECT count(*), min(created_at), max(created_at) FROM early_access;

-- free places used and left
SELECT count(*) FILTER (WHERE free_months > 0) AS free_taken,
       count(*) FILTER (WHERE free_months = 0) AS paying
FROM early_access;

-- the two questions that decide what to build
SELECT looking_after, their_phone, count(*) FROM early_access
GROUP BY 1, 2 ORDER BY 3 DESC;

-- pilot volunteers, by phone
SELECT email, name, their_phone, country FROM early_access
WHERE wants_to_test ORDER BY created_at;

-- by country
SELECT country, count(*) FROM early_access GROUP BY 1 ORDER BY 2 DESC;
```

**Removal requests** go to hello@lampsill.com — make that mailbox before
launching the form — and are one line:
`DELETE FROM early_access WHERE email = 'person@example.com';`

### On launch day

- Email everyone once. The 60-day trial at checkout
  (`subscription_data.trial_period_days` on the Dodo checkout) goes to the rows
  with `free_months > 0` — those are the people who were promised it. Everyone
  else was told plainly on the page that theirs starts at the normal price, so
  don't quietly give it to them either; if the offer is widened, say so in the
  email rather than letting the two groups find out from each other.
- Set `NEXT_PUBLIC_CHECKOUT_OPEN=1` so the pricing button becomes a real
  checkout again (see "Payments").
- Before the list is used for anything else, add a privacy page. The consent
  line on the form promises *only* the launch email (`consent_version`
  `2026-09-15`; the earlier `2026-09-14` wording also promised free months,
  because at that point everybody got them).

---

## Payments: Dodo Payments, priced per country

**Why Dodo.** It is the merchant of record: it collects and pays VAT, GST and
US sales tax in each country, so selling abroad doesn't mean registering for
tax everywhere. At these prices it is also cheaper than Paddle or Lemon Squeezy
(4% + 40¢ base, vs 5% + 50¢). Stripe would be cheaper for UK-only sales, but
leaves the tax registration with you.

**The fee that shapes the page.** Dodo adds +0.5% for subscriptions and +1.5%
for non-US cards, so a typical customer costs **~6% + 40¢**. The 40¢ is ~15% of
a £1.99 monthly charge and ~1.5% of a £19.99 yearly one. That is why **yearly
is preselected** and badged "2 months free" (4 in India, the Philippines and
Indonesia, where the yearly discount is deeper). Monthly is one tap away.

**How the price reaches the visitor.** `app/page.tsx` reads the country header
the host adds (`x-vercel-ip-country`, `cf-ipcountry`, `cloudfront-viewer-country`;
locally, the region in Accept-Language), picks the row from `lib/pricing.ts`, and
renders it on the first paint. The visitor can pick another country in the
pricing section (kept in localStorage). `?country=IN` forces one, for checking.
Countries not in the table get the US dollar price.

**How the price reaches checkout.** It doesn't, deliberately. `/api/checkout`
sends only the plan and a pre-filled billing country; Dodo charges whatever its
**Localized Pricing** rule says for the billing country the customer confirms.
So the page and the dashboard must agree, row for row.

### Set up in Dodo, before the button can work

- [ ] Business verified; payouts set up (check whether payouts under $1,000
      carry a fee — the pricing page and a 2026 review disagree).
- [ ] **Base currency GBP.** Non-GBP payments cost ~4% more in conversion,
      deducted from your settlement.
- [ ] Two subscription products: **monthly** and **yearly**, base price £1.99
      and £19.99. Their ids go in `DODO_PRODUCT_MONTHLY` / `DODO_PRODUCT_YEARLY`.
- [ ] On both, **Localized Pricing → By Country**, one rule per country in
      `lib/pricing.ts`, same amounts.
- [ ] ⚠️ **Tax-inclusive check.** Dodo documents localized amounts as *pre-tax*.
      Run a test checkout from a UK, an EU and an Indian address: if VAT/GST is
      added on top of £1.99 / €2.49 / ₹99, the page's "Tax included" is false.
      Fix it in Dodo (tax-inclusive pricing) or enter net amounts there. UK, EU
      and Australian law require consumer prices to include tax.
- [ ] Statement descriptor reads "LAMPSILL" — a $30 dispute costs over a year
      of that subscriber's revenue, and unrecognised charges are how disputes start.
- [ ] Webhooks pointed at **lampsill_api**, not this site (see "Not done").
- [ ] Cancellation is short and human (spec §8.1) in Dodo's customer portal.

---

## Deploying

Vercel, root directory `lampsill_web`, preset **Next.js**, no overrides.

Environment variables — in Vercel's project settings, never in the repo:

```
DODO_API_KEY           from Dodo → Developer → API keys
DODO_ENV               live   (anything else, or unset, uses test mode)
DODO_PRODUCT_MONTHLY   pdt_…  monthly subscription product
DODO_PRODUCT_YEARLY    pdt_…  yearly subscription product
NEXT_PUBLIC_SITE_URL   https://lampsill.com
```

Until those exist, `/api/checkout` returns 503 and the page says so honestly.

DNS is plan item 1.1a: the apex goes here, `api.` and `pay.` go elsewhere,
which is why this project must not be given a wildcard.

---

## Not done

- **`hello@lampsill.com` does not exist.** It is the fallback in the pricing
  section and the footer link, so every call to action currently goes nowhere.
  Make the mailbox before launch.
- **Dodo webhooks, in lampsill_api.** Creating a checkout is not a subscription
  system. The API needs `subscription.active`, `subscription.renewed`,
  `subscription.on_hold`/`failed` and `subscription.cancelled` (Standard
  Webhooks signatures) to switch an account on and off before anyone's money
  moves — plan 6.3. Deliberately not in this site.
- **No analytics**, deliberately. If any are added, the privacy section claims
  rather a lot and a third-party script would have to be squared with it.
