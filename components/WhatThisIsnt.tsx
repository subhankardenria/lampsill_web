import { WINDOW_CHOICE } from '@/lib/copy';

/* The family version's limits, from the worked example. The fourth item is
   Branch C, and it is the one to keep most visible: with no server fallback,
   a notification nobody sees means nobody else is told. Someone paying for
   cover deserves to know exactly where the cover ends. */
const ITEMS = [
  ['Not an emergency alarm', 'It can’t tell a fall from a lie-in. It only knows their phone hasn’t been picked up.'],
  ['Not instant', `Nothing starts until the time you chose has passed: ${WINDOW_CHOICE} hours. It works in hours, not minutes.`],
  ['Not a medical device', 'No health tracking. No vital signs. It notices a quiet phone and tells you.'],
  ['Not automatic after you', 'If you miss the notification, nobody else is contacted. You send every message yourself — so keep notifications on.'],
];

/**
 * Kept in full, and kept HERE — near the end.
 *
 * This section is not a disclaimer block to be shrunk. With a reader who is
 * already interested and starting to get sceptical, being straight about the
 * limits is what earns the install, and it is the only honest way to sell an
 * hours-scale timer. Charging money makes it more necessary, not less.
 *
 * What it must not be is the first thing anyone reads. It used to be linked
 * from a hero button captioned "What it can't do", which is an exit ramp
 * beside the entrance.
 */
export default function WhatThisIsnt() {
  return (
    <section className="section isnt" id="what-this-isnt">
      <div className="wrap">
        <div className="reveal" style={{ marginBottom: '2.5rem' }}>
          <p className="eyebrow">Before you rely on it</p>
          <h2>What it doesn&rsquo;t do.</h2>
          <p className="lede">
            Here&rsquo;s the honest part. If you need any of these, Lampsill isn&rsquo;t
            for you &mdash; and we&rsquo;d rather say so now.
          </p>
        </div>
        <ul className="isnt-list reveal">
          {ITEMS.map(([h, p]) => (
            <li className="isnt-item lit" key={h}>
              <span className="x" aria-hidden="true">
                ×
              </span>
              <h3>{h}</h3>
              <p>{p}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
