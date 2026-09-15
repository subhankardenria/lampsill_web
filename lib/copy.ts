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

/** From the API: SilenceConfig::GRACE_SECONDS and SilenceConfig::MAX_PAUSE_DAYS. */
export const GRACE_MINUTES = 30;
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
export const FAMILY = {
  /** generic detector threshold — learning refines it and never suppresses it */
  quietHours: 12,
  /** of those, at least this many must fall inside expected waking hours */
  wakingHours: 6,
  /** their phone rings; unanswered for this long, and you are notified */
  ringMinutes: 10,
  /** your notification keeps sounding until you open it, for at most this long */
  soundMinutes: 15,
  /** the only thing the payer ever sees day to day */
  states: ['normal', 'learning', 'permission lost', 'escalating'],
} as const;

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
