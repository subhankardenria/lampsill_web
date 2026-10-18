import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Masthead, Footer, Reveals } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountryWith } from '@/lib/geo';
import { Complaint } from '@/components/Complaint';

/**
 * THE PRIVACY NOTICE FOR THE APP. The website and the early-access list have
 * their own, at /privacy; Google Play's form takes this one.
 *
 * Written from the code, 7 Oct 2026, and true only while these are:
 *
 *   nothing sensed leaves the phone   the trigger/report routes carry a time and
 *                                     a flag, no payload (Data Protection §2)
 *   one timestamp is held             silence_configs.last_interaction_at, reset
 *                                     at most every 10 minutes (ServerLink.kt)
 *   no location, mic, camera, ads     AndroidManifest.xml: one sensor permission
 *   no text messages or emails        config/lampsill.php 'texting' is false;
 *                                     MAIL_MAILER=log. If texting is switched
 *                                     on, "How people are told" is wrong.
 *   push says only "news"             PushPayloads; Firebase Cloud Messaging,
 *                                     no Analytics
 *   an iPhone checks in, hourly       silence_configs.phone_checked_at
 *                                     (SilenceService::checkedIn, 16 Oct 2026)
 *   battery: a yes or no              silence_configs.battery_low_at, said in
 *                                     an alert (SilenceNotices::battery)
 *   her note for her people           silence_configs.note, shown to them only
 *                                     while her phone has gone quiet
 *   hosting                           Google Cloud us-central1; encrypted
 *                                     nightly backup kept 30 days on Cloudflare
 *   deletion                          /delete-account, DELETE /v1/account
 *
 * Not decided here: the legal name and postal address of whoever runs Lampsill,
 * which UK and EU law want in a notice like this. Add them under "Who we are".
 */
const UPDATED = '17 October 2026';

export const metadata: Metadata = {
  title: 'App privacy — Lampsill',
  description:
    'What the Lampsill app reads on your phone, what it sends us, who sees it, and how to delete it all.',
  alternates: { canonical: '/privacy/app' },
};

export default async function AppPrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const seen = await visitorCountryWith((await searchParams).country, await headers());
  const market = marketForCountry(seen.country);

  return (
    <PriceProvider initialMarket={market.key} country={seen.country} guessed={!seen.certain}>
      <Masthead base="/" />
      <Reveals />
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <p className="eyebrow">Privacy · the app</p>
          <h1>What the Lampsill app knows about you.</h1>
          <p className="lede">
            In plain words. This covers the Lampsill app on your phone. The website has its own{' '}
            <a href="/privacy">privacy notice</a>.
          </p>
          <p className="legal-updated">Last updated {UPDATED}</p>

          <div className="legal-short">
            <h2>In short</h2>
            <ul>
              <li>
                <strong>What your phone senses stays on your phone.</strong> Steps, movement and
                when you use it are read and compared on the phone. We never receive them.
              </li>
              <li>
                <strong>We keep very little.</strong> Your account, the settings you choose, the
                names you add, a note for them if you write one, and one time: when your phone
                was last used.
              </li>
              <li>
                <strong>No location, microphone, camera, ads or tracking.</strong> Lampsill
                doesn&rsquo;t ask for any of them.
              </li>
              <li>
                <strong>You can delete everything</strong>, in the app, in a moment.
              </li>
            </ul>
          </div>

          <h2>Who we are</h2>
          <p>
            Lampsill runs the app and decides what is done with your details. You can reach us at{' '}
            <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.
          </p>

          <h2>What the app does on your phone</h2>
          <p>
            Lampsill tells someone you chose when your phone has gone quiet for longer than you
            said. To know that, it notices when you use the phone: the screen coming on, the phone
            being unlocked, and, if you allow &ldquo;physical activity&rdquo;, your steps.
          </p>
          <p>
            <strong>On an iPhone</strong>, which does not let an app hear the phone being used,
            our server wakes Lampsill quietly about once an hour. In those few seconds the phone
            looks at whether it was carried (its own step count, if you allow Motion &amp; Fitness)
            or unlocked since it last looked, and if so tells us only &ldquo;still here&rdquo;. The
            steps themselves never leave the phone. Opening Lampsill, or tapping its daily hello,
            counts too.
          </p>
          <ul>
            <li>
              <strong>That is the only permission it asks for to sense anything.</strong> No
              location, microphone or camera, and it never reads your messages, photos or contacts.
            </li>
            <li>
              <strong>It shows a notification while it runs</strong>, so you always know it is
              there, and you can turn it off from there.
            </li>
            <li>
              <strong>The record stays on the phone.</strong> Fourteen days of movement are kept
              there and then rolled into a short daily summary. Signing out or deleting your account
              wipes it.
            </li>
            <li>
              Your <strong>notes, reminders and steps</strong> are kept on your phone only. We never
              receive them.
            </li>
          </ul>

          <h2>What we hold about you</h2>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th scope="col">What</th>
                  <th scope="col">Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your name, email address and password (the password is kept scrambled)</td>
                  <td>To sign you in. A person who only agreed to be looked out for may have none of these, just a sign-in kept on their phone.</td>
                </tr>
                <tr>
                  <td>Your Lampsill settings: the time window you chose (1, 12, 24 or 48 hours), on or off, any pause</td>
                  <td>To run your clock.</td>
                </tr>
                <tr>
                  <td>
                    <strong>One time:</strong> when your phone was last used. It is replaced each
                    time, at most about once every ten minutes. It isn&rsquo;t what you did, and it
                    isn&rsquo;t where you were
                  </td>
                  <td>To know when your window has run out.</td>
                </tr>
                <tr>
                  <td>
                    Your sleeping hours, if you set them (two times), and your phone&rsquo;s time
                    zone as a number of hours from UTC, refreshed each time your phone reports
                  </td>
                  <td>So the clock doesn&rsquo;t run out while you are asleep. The time zone is just a number, never where you are.</td>
                </tr>
                <tr>
                  <td>Whether your phone is allowed to show notifications</td>
                  <td>To tell you if an alert could not reach your own screen.</td>
                </tr>
                <tr>
                  <td>Whether your phone&rsquo;s battery was nearly flat when it last reported: a yes or no, not a level</td>
                  <td>So an alert can say your phone may simply have run out, and nobody imagines the worst.</td>
                </tr>
                <tr>
                  <td>A note you write for the people you chose, if you write one (where the spare key is, who to ring)</td>
                  <td>Shown to them only while your phone has gone quiet. You can change or delete it at any time.</td>
                </tr>
                <tr>
                  <td>On an iPhone: when the phone last checked in. That is the phone being able to look, not you using it</td>
                  <td>So that, if it stops, we can ask you once to open Lampsill again.</td>
                </tr>
                <tr>
                  <td>
                    The names, and numbers if you type them, of the people you add as contacts,
                    the person you look out for, and up to three people near them. Kept encrypted
                  </td>
                  <td>
                    To tell the right people, and for the Call and Text buttons. Lampsill never
                    calls or messages them itself.
                  </td>
                </tr>
                <tr>
                  <td>
                    A window that someone who looks out for you has suggested, until you say yes or
                    no
                  </td>
                  <td>So you can answer it with one tap. It changes nothing until you do.</td>
                </tr>
                <tr>
                  <td>The codes that link two accounts, and when each side agreed</td>
                  <td>So nobody is looked out for, or told, without having said yes.</td>
                </tr>
                <tr>
                  <td>A record of alerts: when a clock ran out, who was told, and when it was seen</td>
                  <td>To show what happened, and what did not.</td>
                </tr>
                <tr>
                  <td>
                    For each phone with Lampsill on it: a device token and the app&rsquo;s Firebase
                    installation ID
                  </td>
                  <td>To nudge a contact&rsquo;s phone the moment there is news, and on an iPhone to ask &ldquo;Still there?&rdquo; and to wake it for its quiet look.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Who sees what</h2>
          <ul>
            <li>
              <strong>The people you choose</strong> see your name and a word or two:{' '}
              <em>Normal</em>, <em>Paused</em>, <em>Phone gone quiet</em>, <em>Switched off</em>{' '}
              or <em>Permission lost</em>.
              Never when you used your phone, never what you did. Only if your phone has gone
              quiet do they also see the note you left for them, and whether your battery was
              nearly flat.
            </li>
            <li>
              <strong>You are only looked out for if you say yes</strong>, on your own phone, after
              reading what the other person will and won&rsquo;t see. You can stop it from your own
              phone at any time.
            </li>
            <li>
              <strong>A contact is only linked once they type the code</strong> you give them.
            </li>
          </ul>

          <h2>How people are told</h2>
          <p>
            Contacts are told inside their own Lampsill app. Today Lampsill doesn&rsquo;t send text
            messages, make calls or send email on its own, and the Call and Text buttons open your
            phone&rsquo;s own apps. If that changes, this notice changes first.
          </p>
          <p>
            Lampsill isn&rsquo;t an emergency service and can&rsquo;t detect a fall or a medical
            problem. In an emergency, call your local emergency number.
          </p>

          <h2>Who else handles it</h2>
          <p>We don&rsquo;t sell or share your details. A few companies handle them for us:</p>
          <ul>
            <li>
              <strong>Google Cloud</strong> runs our server and database, in the United States.
            </li>
            <li>
              <strong>Cloudflare</strong> protects the connection and keeps an encrypted backup,
              which is deleted after 30 days.
            </li>
            <li>
              <strong>Google (Firebase Cloud Messaging)</strong> carries the nudge to a
              contact&rsquo;s Android phone. It says only that there is news. No name, no message,
              nothing about anyone&rsquo;s phone use. The phone then asks our own server for it.
              Analytics is not included in the app.
            </li>
          </ul>
          <p>
            That means your details are stored in the United States and looked after from India.
            Moving details between countries is allowed when the right safeguards are in place, and
            our providers&rsquo; terms include them.
          </p>

          <h2>Payments</h2>
          <p>
            The app doesn&rsquo;t take payments, show prices or ask for card details. Lampsill is
            free until January 2027, and nothing is sold, in the app or on our website.
          </p>

          <h2>How long we keep it</h2>
          <ul>
            <li>
              <strong>Until you delete it.</strong> Then it is erased straight away, apart from a
              backup that expires on its own within 30 days and isn&rsquo;t restored for you.
            </li>
            <li>
              <strong>On your phone</strong>, movement is kept 14 days, then summarised.
            </li>
          </ul>

          <h2>Your rights</h2>
          <p>
            You can see what we hold, have it corrected, delete it, or stop us using it.
            Deleting is in the app: <strong>Settings → Delete everything</strong>, or follow{' '}
            <a href="/delete-account">these steps</a>. For anything else email{' '}
            <a href="mailto:hello@lampsill.com">hello@lampsill.com</a> from your account&rsquo;s
            address. It&rsquo;s free, and we&rsquo;ll reply within a month. We don&rsquo;t have an
            automatic export yet, so a copy is sent to you by hand.
          </p>
          <Complaint
            country={seen.country}
            lead="If you’re unhappy with how we’ve handled your details, tell us first."
          />

          <h2>Children</h2>
          <p>Lampsill is for adults. Please don&rsquo;t use it if you&rsquo;re under 18.</p>

          <h2>Changes to this notice</h2>
          <p>
            If we change it, the date at the top changes too. If a change affects what we do with
            details you&rsquo;ve already given us, the app tells you before it takes effect.
          </p>

          <p className="legal-back">
            <a className="btn ghost" href="/">
              &larr; Back to Lampsill
            </a>
          </p>
        </div>
      </main>
      <Footer base="/" />
    </PriceProvider>
  );
}
