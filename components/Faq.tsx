import { EARLY_ACCESS, FAMILY, FREE_UNTIL, GRACE_DAYS, MAX_PAUSE_DAYS, WINDOW_CHOICE } from '@/lib/copy';
import { PlanPrices, TaxNote } from './Price';

/**
 * The questions people actually stall on, answered in a sentence or two.
 *
 * Native <details>/<summary>: keyboard, screen readers and find-in-page all
 * work with no JavaScript, and an accordion is the one widget where rolling
 * your own reliably makes it worse.
 *
 * EVERY ANSWER IS WHAT THE APP DOES (checked against it, 5 Oct 2026): the
 * window is chosen, not learned; there are no sleep hours; an alert can come
 * at any hour; and the words are the app's own. They were first written from
 * `Lampsill — Worked Example.md`, which described a detector the app does not
 * have. This is the section
 * people read at the moment they decide whether to trust it, so a confident
 * wrong answer costs more here than anywhere else on the page.
 *
 * "What if I miss the notification?" is in here on purpose and answered
 * straight. It is the product's one real gap (Branch C), and the person paying
 * is precisely the person who needs to know it.
 */
const QA: { q: string; a: React.ReactNode }[] = [
  {
    q: 'Do they have to do anything?',
    a: 'Once: they type in a code you give them and tap Yes. After that, nothing. They use their phone as normal and never need to open Lampsill.',
  },
  {
    q: 'Does it work for a son or daughter away for study or work?',
    a: (
      <>
        Yes, the same way. It&rsquo;s their choice: they say yes on their own phone
        and can turn it off any time. If they do, your screen says{' '}
        <strong>permission lost</strong>, so you always know. Their nearest person
        is often a friend in the same building.
      </>
    ),
  },
  {
    q: 'Can I see where they are?',
    a: 'No. Lampsill never asks for location, on either phone. You see a small window and one of four words: normal, paused, permission lost, or phone gone quiet. Never their messages, where they go, or when they get in.',
  },
  {
    q: 'Won’t late nights and lie-ins set it off?',
    a: (
      <>
        You choose how long is too long: {WINDOW_CHOICE} hours. 48 suits most
        people. A shorter one can go off after a long sleep &mdash; but their own
        phone asks first, and one tap ends it. They can change it, or pause it for
        up to {MAX_PAUSE_DAYS} days when they&rsquo;re away.
      </>
    ),
  },
  {
    q: 'What if they answer when it rings?',
    a: 'Then it’s over. You aren’t told, and nobody else is bothered. Most alerts end this way.',
  },
  {
    q: 'Who texts their nearest person?',
    a: (
      <>
        You do, in one tap. The alert opens on Call. If there&rsquo;s no answer,
        their nearest person is right under it, with Call, Text and WhatsApp. Text
        opens your messages app with the note already written, from your number.
      </>
    ),
  },
  {
    q: 'What if I miss the notification?',
    a: (
      <>
        It keeps sounding for up to {FAMILY.soundMinutes} minutes until you open it.
        If you still miss it, nobody else is contacted &mdash; every message comes from
        you. So keep notifications on, and let Lampsill through Do Not Disturb at
        night.
      </>
    ),
  },
  {
    q: 'What if we live in different time zones?',
    a: 'It counts hours on their phone, whatever the time is for you. So an alert can arrive at night. Let Lampsill through Do Not Disturb: if you sleep through it, nobody else is told.',
  },
  {
    q: 'Is this an emergency service?',
    a: 'No. It can’t detect a fall or a medical problem, and it works in hours, not minutes. In an emergency, call your local emergency number.',
  },
  {
    q: 'What is free, and what is Standard?',
    a: (
      <>
        Free, for good: Lampsill for yourself, which rings you if your phone goes
        quiet, with reminders, notes and steps. Being looked out for is free too.
        Standard is for the one looking out: you are told if their phone goes quiet,
        for everyone on your account, with how each of them is at a glance, one-tap
        Call and the people nearby, and an alert that keeps sounding until you open
        it.
      </>
    ),
  },
  {
    q: 'What happens if I stop paying?',
    a: (
      <>
        You&rsquo;re told well before, then you have {GRACE_DAYS} days&rsquo; grace.
        After that you are no longer told &mdash; and both of you are told that, so
        nobody thinks they&rsquo;re covered when they aren&rsquo;t. Their own phone
        still rings them. Nothing is deleted: pay again and it carries on.
      </>
    ),
  },
  {
    q: 'How much is it?',
    a: (
      <>
        Everything is free until {FREE_UNTIL}. After that, looking out for someone is
        Standard: <PlanPrices /> for one account, however many people you look out for.{' '}
        <TaxNote /> Every new account gets a month of Standard free first, with no card
        needed. The person you look out for never pays. The first{' '}
        {EARLY_ACCESS.freeSpots} people on the early-access list get{' '}
        {EARLY_ACCESS.freeMonths} more months on top.
      </>
    ),
  },
];

export default function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="wrap narrow">
        <div className="reveal" style={{ marginBottom: '2rem' }}>
          <p className="eyebrow">Questions</p>
          <h2>The short answers.</h2>
        </div>
        <div className="faq-list reveal">
          {QA.map(({ q, a }) => (
            // All closed: the questions ARE the scannable part. One open answer
            // pushed the other nine a screen further down on a phone.
            <details className="faq-item lit" key={q}>
              <summary>
                <span>{q}</span>
                <span className="faq-plus" aria-hidden="true" />
              </summary>
              <div className="faq-a">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
