/**
 * Copy that is bound to something outside this repo, kept in one file so it
 * cannot drift.
 *
 * ⚠️ THE PRICE IS A REVERSAL OF A PUBLISHED PROMISE.
 * The store listing and the previous site both said "Free, permanently". This
 * build charges. That decision is the owner's to make and it has been made,
 * but it is not finished until `Lampsill — Store Listing and Claims` agrees,
 * and §5.1 (the free tier claims strictly less) no longer describes a product
 * that exists. See lampsill_web/README.md.
 *
 * The prices themselves are per country, in lib/pricing.ts.
 *
 * ⚠️ WHAT CHARGING DOES NOT CHANGE.
 * §2.3 — never guarantee detection. No "always", "24/7", "never miss",
 *        "guaranteed", anywhere, at any price.
 * §2.5 — no medical claims. No fall detection, no health monitoring, no
 *        "medical alert".
 * Taking money makes both of these MORE binding, not less: an overclaim a
 * customer paid for is a refund at best and a misrepresentation at worst.
 */

/**
 * FREE UNTIL JANUARY 2027 — the owner's decision, 5 Oct 2026 ("we will
 * continue free till January").
 *
 * Nobody is charged before then. The prices in lib/pricing.ts are what it
 * costs FROM then, and every place the page shows one says so. Written once
 * here so the month cannot be right in the headline and wrong in the FAQ.
 *
 * ⚠️ IT DOES NOT SHRINK THE EARLY-ACCESS PROMISE. People on the list were told
 * "your first 2 months are free when Lampsill opens". If those two months ran
 * alongside a period that is free for everybody, the promise would be worth
 * nothing. So they are the first two PAID months: the first 100 are free for
 * two months longer than everyone else. If that is not what is meant, change
 * it here and in EarlyAccess.tsx before this goes live — it is a promise to
 * named people.
 *
 * ⚠️ "January 2027" is as exact as the owner's words were. If the date that
 * matters is the 1st or the 31st, say so here; the page repeats this label.
 */
export const FREE_UNTIL = 'January 2027';

/**
 * FREE AND STANDARD — what is always free, and what is paid (decided 6 Oct
 * 2026; the whole rule is section 12 of `Lampsill - Pricing and Payments
 * Plan.md`). In one line:
 *
 *   BEING TOLD ABOUT SOMEONE ELSE IS STANDARD. One month free, then paid.
 *   Lampsill for yourself is free, and so is being looked out for.
 *
 * THIS REPLACED A RULE WRITTEN THE SAME MORNING, under which one link — one
 * person and the one told about them — was free for good. The owner saw at
 * once what was wrong with it: the commonest customer is one son looking out
 * for one mother, and that customer would never have paid. A free alert with
 * paid comforts gives the product away. So there is no free link, which also
 * means there is nothing to work around: it makes no difference who set it up
 * or on whose phone the code was typed.
 *
 * ⚠️ WHAT KEEPS IT FAIR, and none of these may be dropped:
 *   - a month free with no card, so nobody is charged without choosing to pay;
 *   - notice, then 14 days' grace, before being told stops;
 *   - when it stops, BOTH people are told. Nobody is left believing they are
 *     covered. A safety product that goes quiet about a failure is the silent
 *     failure this whole product exists to prevent;
 *   - the person who is looked out for never pays.
 *
 * `TRIAL_MONTHS`: every account gets this long on Standard, free, the first
 * time it looks out for someone — before January 2027 and after it ("who ever
 * use the app will get 1 month standard free service"). The early-access 2
 * months are on top of it, not instead.
 */
export const TRIAL_MONTHS = 1;
export const GRACE_DAYS = 14;

export const ALWAYS_FREE = [
  'Lampsill for yourself: it rings you if your phone goes quiet',
  'Reminders, notes and steps',
  'Being looked out for. The person you look out for never pays',
] as const;

export const STANDARD = [
  'You are told if their phone goes quiet',
  'Everyone you look out for, on one account',
  'How each of them is, at a glance: a lit window means normal',
  'Call them, or call or text someone nearby, in one tap',
  // 15 is FAMILY.soundMinutes, declared further down this file
  'An alert that keeps sounding for up to 15 minutes, until you open it',
] as const;

/** The literal message a contact receives. Not marketing copy — the hedges in
 *  it exist to stop somebody panicking at nine in the morning, and they are
 *  not to be tightened for conversion. */
export const ALERT_SMS = (name: string, when: string) =>
  `Lampsill: ${name} hasn't used their phone since ${when} — about 48 hours.\n\n` +
  `They asked us to let you know if that happened. This is not an emergency ` +
  `alert and nothing is known about their situation.\n\n` +
  `Could you check in on them?`;

/**
 * The windows the app actually offers, and its own words for them — copied
 * from `SilenceConfig.windowOptions` and `SilenceConfig.hintFor` in
 * lampsill_app/lib/data/models.dart. Change one, change both.
 *
 * ⚠️ An earlier version of this file claimed to be "lifted verbatim" from the
 * app and was not: it invented a 72-hour option and four hints the product has
 * never shown, and the pricing panel went on to promise "12 hours to a week".
 * The app's maximum is 48. The 1-hour option is a try-it-out mode and is not
 * advertised.
 */
export const WINDOW_OPTIONS = [48, 24, 12] as const;

export const WINDOW_HINTS: Record<(typeof WINDOW_OPTIONS)[number], string> = {
  48: 'Most people. Safe with weekends away and flat batteries.',
  24: 'Tighter. Occasional false alarms if you sleep in.',
  12: 'Only if you have a health reason. Expect false alarms.',
};

/** From the API: SilenceConfig::GRACE_SECONDS and SilenceConfig::MAX_PAUSE_DAYS.
 *  Ten minutes since 5 Oct 2026 (it was thirty). */
export const GRACE_MINUTES = 10;
export const MAX_PAUSE_DAYS = 7;

/**
 * THE FAMILY VERSION — the product this site now leads with.
 *
 * Three people, and every number below is from `Lampsill — Worked Example.md`
 * (§2–§5), not written for the page:
 *
 *   the person who lives alone   their phone rings first
 *   you — you set it up, you pay a notification, if they don't answer
 *   their nearest person         a message FROM YOU, sent from your own phone
 *
 * ⚠️ NOBODY IS TEXTED BY A SERVER. The notification opens onto Call / Text /
 * WhatsApp, and "Text" opens the payer's own messaging app with the message
 * already written (Branch B); the per-persona wording lives in Persona.tsx. There is no SMS service. The honest consequence,
 * which the page must say and never soften: if the payer never sees the
 * notification, nobody else is contacted (Branch C).
 *
 * ⚠️ NOT SHIPPABLE AS BUILT. Per §7 of the worked example, v1 is the solo
 * version only; the family tier needs push notifications (plan 1.9) and
 * `Escalation::LADDERS` rewritten with a payer rung before it can launch. This
 * site describes the product as designed, and must not go live before it.
 */
/*
 * ⚠️ AS THE APP IS, NOT AS IT WAS DESIGNED (5 Oct 2026). This file used to
 * describe a detector that does not exist in the app people install: "12 quiet
 * hours, at least 6 of them in waking hours", a rhythm "learned in the first
 * week", sleep hours, and four words that included "learning" and
 * "escalating". The app does something simpler, and the page now says that:
 *
 *   - whoever sets it up CHOOSES how long is too long — 12, 24 or 48 hours
 *     (WINDOW_OPTIONS), 48 unless they say otherwise — and the person it is
 *     about can change it on their own phone. Nothing is learned;
 *   - the count is plain hours of an untouched phone, day or night;
 *   - the words are the app's own: Normal, Paused, Permission lost, and
 *     "Phone gone quiet" (`statusInBrief` in the app's watching_screens.dart).
 *
 * `quietHours` is the window THIS PAGE'S STORIES use — the shortest one, so a
 * story fits in a day. It is one of three choices and the page says so
 * wherever the number appears. It is not what the app picks by default.
 */
export const FAMILY = {
  /** the window the page's stories are told with: one of WINDOW_OPTIONS */
  quietHours: 12,
  /** their phone rings; unanswered for this long, and you are notified */
  ringMinutes: 10,
  /** your notification keeps sounding until you open it, for at most this long */
  soundMinutes: 15,
  /** the only thing the person looking out ever sees, in the app's words */
  states: ['normal', 'paused', 'permission lost', 'phone gone quiet'],
} as const;

/** "12, 24 or 48" — the choice, said the same way everywhere. */
export const WINDOW_CHOICE = [...WINDOW_OPTIONS]
  .sort((a, b) => a - b)
  .map(String)
  .join(', ')
  .replace(/, ([^,]*)$/, ' or $1');

/**
 * THE EARLY-ACCESS OFFER — a promise to real people, so it is written once.
 *
 * `consentVersion` is stored with every sign-up. If the wording below changes
 * in substance, bump the date, so each row says which words its person agreed
 * to. `freeMonths` is stored per row too: changing the offer later never
 * shrinks what someone who already signed up was promised.
 *
 * ⚠️ `freeSpots` IS A LIMIT, NOT A MOOD. The page says the first 100 get their
 * months free, so the count is decided in the database at the moment of
 * signing up (app/api/join/route.ts) and written to that person's row —
 * never estimated in the browser, and never "gone" to hurry somebody along.
 * A scarcity that isn't real is a lie told to the exact people who are
 * trusting this product with someone they love. Raise the number if more
 * places are wanted; do not fake the counter.
 *
 * AND IT IS NOT A PRIZE DRAW. Places go in order of arrival, so there is no
 * winner to pick, nothing to claim afterwards, and none of the sweepstakes
 * duties (published rules, closing date, how winners are chosen) that a
 * random draw would bring with it. Everyone who signs up can be told where
 * they stand, at once, on the page. If this ever does become a draw, that
 * wording and those rules have to be written properly first.
 */
export const EARLY_ACCESS = {
  freeMonths: 2,
  freeSpots: 100,
  consentVersion: '2026-09-15',
  consent:
    'Email me when Lampsill is ready. Nothing else — and I can ask to be removed any time.',
} as const;
