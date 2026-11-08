import { APP_STORE_URL, FREE_UNTIL } from '@/lib/copy';
import { Mark } from './Chrome';
import { StoreBadges } from './StoreBadges';

/** The week before Lampsill: the calls made only to hear that all was well. */
const CALLS = ['Mon', 'Wed', 'Fri'] as const;

/**
 * GET IT: "Stop calling just to check." Drawing B of three, chosen by the
 * owner on 2 Nov 2026; it took the place of the early-access form.
 *
 * The picture is the tagline ("So you don't have to keep calling") as a
 * week: three calls placed only to check, faded and struck through, then one
 * lit card that says what the app says on home, the person and one word. It
 * claims nothing the app doesn't: "On" is the app's word for a phone in use,
 * not a report on how anyone is.
 *
 * iPhone is still with Apple, so an iPhone visitor is given the address to
 * write to; when APP_STORE_URL is set, the App Store link takes its place.
 * `id="join"` stays on an empty marker so links to /#join from before land
 * here.
 */
export default function GetIt() {
  return (
    <section className="section get" id="get">
      <span id="join" aria-hidden="true" />
      <div className="wrap get-in">
        <div className="get-calls reveal" aria-hidden="true">
          {CALLS.map((day) => (
            <div className="get-call old" key={day}>
              <span className="get-dot">☎</span>
              <span>
                Calling <b>Mum</b>&hellip;
              </span>
              <span className="get-when">{day}</span>
            </div>
          ))}
          <div className="get-call now">
            <Mark className="get-mark" />
            <b>Mum</b>
            <span className="get-when">On</span>
          </div>
        </div>

        <div className="get-copy reveal">
          <p className="eyebrow">Get Lampsill</p>
          <h2>
            Stop calling
            <br />
            <em>just to check.</em>
          </h2>
          <p className="lede">
            If their phone goes quiet, you&rsquo;re told. If it doesn&rsquo;t, you can call for the
            right reason.
          </p>
          <StoreBadges size={44} pair />
          {/* The setup, step by step on the real screens (owner, 2 Nov 2026). */}
          <p className="get-setup">
            <a href="/setup">See how to set it up, step by step</a>
          </p>
          <p className="get-small">
            Free until {FREE_UNTIL}.{' '}
            {APP_STORE_URL ? null : (
              <>
                On an iPhone? Email{' '}
                <a href="mailto:hello@lampsill.com?subject=Tell%20me%20when%20Lampsill%20is%20on%20iPhone">
                  hello@lampsill.com
                </a>{' '}
                and we&rsquo;ll tell you the day it&rsquo;s out.
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
