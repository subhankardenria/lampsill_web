import { EARLY_ACCESS, FAMILY, MAX_PAUSE_DAYS } from '@/lib/copy';
import { Price, TaxNote } from './Price';

/**
 * The questions people actually stall on, answered in a sentence or two.
 *
 * Native <details>/<summary>: keyboard, screen readers and find-in-page all
 * work with no JavaScript, and an accordion is the one widget where rolling
 * your own reliably makes it worse.
 *
 * EVERY ANSWER IS FROM `Lampsill — Worked Example.md`. This is the section
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
    a: 'Two taps, once, to say yes. After that, nothing. They use their phone as normal and never need to open Lampsill.',
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
    a: 'No. Lampsill never asks for location, on either phone. You only see one of four words: normal, learning, permission lost, or escalating (an alert is under way). Never their messages, where they go, or when they get in.',
  },
  {
    q: 'Won’t late nights and lie-ins set it off?',
    a: (
      <>
        It needs {FAMILY.quietHours} hours of their phone sitting untouched, with at
        least {FAMILY.wakingHours} of them in their usual waking hours &mdash; so a
        night&rsquo;s sleep doesn&rsquo;t count. It learns their rhythm in the first
        week. You can set sleep hours, and either of you can add away time for up to{' '}
        {MAX_PAUSE_DAYS} days.
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
        You do, in one tap. Your notification has Call, Text and WhatsApp buttons.
        Tap Text and your messages app opens with the note already written. It comes
        from your number, so they know it&rsquo;s you.
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
    a: 'Lampsill uses their clock, not yours — “daytime” means their daytime. So if they live abroad, it might wake you at night. Let Lampsill through Do Not Disturb: if you sleep through it, nobody else is told.',
  },
  {
    q: 'Is this an emergency service?',
    a: 'No. It can’t detect a fall or a medical problem, and it works in hours, not minutes. In an emergency, call your local emergency number.',
  },
  {
    q: 'How much is it?',
    a: (
      <>
        <Price plan="month" /> a month, or <Price plan="year" /> a year, for one person — with
        everything included. <TaxNote /> Cancel any time. The first {EARLY_ACCESS.freeSpots} people
        on the early-access list start with {EARLY_ACCESS.freeMonths} months free.
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
