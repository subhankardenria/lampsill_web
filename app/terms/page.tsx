import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Masthead, Footer, Reveals } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import { EARLY_ACCESS, FREE_UNTIL, GRACE_MINUTES } from '@/lib/copy';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountryWith } from '@/lib/geo';

/**
 * TERMS OF USE for the Lampsill app (5 Nov 2026). Google Play asks a trader
 * for a terms link per app; this is it. Same voice as the privacy notices:
 * short, plain, and nothing it says is more than the app does.
 *
 * ⚠️ Like the privacy pages, these are claims about the product. Keep them
 * true when these change:
 *
 *   free until January, no charge without agreeing   PRICING_PAUSED, FREE_UNTIL (lib/copy.ts)
 *   early-access months                              EARLY_ACCESS.freeMonths
 *   asked first, told GRACE_MINUTES later             GRACE_MINUTES
 *   a contact is linked only by typing the code       the link flow in the app
 *   delete everything in the app                      Settings → Delete everything
 *   for adults                                        /privacy/app "Children"
 *
 * Who the agreement is with, the law that applies and where disputes go are
 * the owners' decisions; this was written to match the privacy notice ("run by
 * Subhankar Denria, published under Nitu Karan's developer accounts", both in
 * India). It is plain-language, not lawyer-reviewed.
 *
 * `UPDATED` is shown on the page. Bump it with any change of substance.
 */
const UPDATED = '5 November 2026';

export const metadata: Metadata = {
  title: 'Terms — Lampsill',
  description: 'The terms for using the Lampsill app, in plain words: what it is, what it isn’t, and what we each agree to.',
  alternates: { canonical: '/terms' },
};

export default async function TermsPage({
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
          <p className="eyebrow">Terms</p>
          <h1>The terms for using Lampsill.</h1>
          <p className="lede">
            In plain words. By using the Lampsill app you agree to these. What we do with your details
            is in the <a href="/privacy/app">app privacy notice</a>.
          </p>
          <p className="legal-updated">Last updated {UPDATED}</p>

          <div className="legal-short">
            <h2>In short</h2>
            <ul>
              <li>
                <strong>Lampsill isn&rsquo;t an emergency service.</strong> In an emergency, call your
                local emergency number.
              </li>
              <li>
                <strong>It can only tell people what your phone tells it.</strong> A phone that is
                off, flat or out of signal can make a message late, or stop it arriving.
              </li>
              <li>
                <strong>Only set it up with someone who has said yes.</strong>
              </li>
              <li>
                <strong>It&rsquo;s free until {FREE_UNTIL}.</strong> Nothing is ever charged without
                you agreeing first.
              </li>
            </ul>
          </div>

          <h2>Who we are</h2>
          <p>
            Lampsill is run by Subhankar Denria and published on Google Play and the App Store under
            Nitu Karan&rsquo;s developer accounts (&ldquo;we&rdquo;, &ldquo;us&rdquo;). You can reach
            us at <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.
          </p>

          <h2>What Lampsill does</h2>
          <p>
            Lampsill notices when a phone hasn&rsquo;t been used for the time its owner chose. It asks
            them &ldquo;Are you OK?&rdquo; on that phone first. If they don&rsquo;t answer, the people
            they chose are told, about {GRACE_MINUTES} minutes later, in their own Lampsill app.
          </p>

          <h2>What it isn&rsquo;t</h2>
          <ul>
            <li>
              It isn&rsquo;t an emergency service, and it can&rsquo;t detect a fall, an illness or a
              medical problem. It only knows whether a phone is being used.
            </li>
            <li>
              It depends on things we don&rsquo;t control: the phone being on, charged and connected;
              the permissions you gave it; the phone&rsquo;s own battery settings; and the services
              that carry notifications. Any of these can make a message late, or stop it arriving.
            </li>
            <li>
              So please don&rsquo;t make it the only way anyone keeps in touch with you, or you with
              them.
            </li>
          </ul>

          <h2>Using it</h2>
          <ul>
            <li>Lampsill is for adults. Please don&rsquo;t use it if you&rsquo;re under 18.</li>
            <li>
              <strong>Only with someone who has agreed.</strong> A person is linked to you only when
              they type in your code themselves. Don&rsquo;t install it or set it up on someone
              else&rsquo;s phone without them knowing.
            </li>
            <li>
              Don&rsquo;t use Lampsill to harass anyone, to pretend to be someone else, or to break the
              law, and don&rsquo;t try to break into it, copy it or overload it.
            </li>
            <li>
              Keep your sign-in to yourself. If you think someone else has used your account, tell us.
            </li>
          </ul>
          <p>
            If an account is used in these ways, we may close it. Unless the law or safety stops us,
            we&rsquo;ll tell you why.
          </p>

          <h2>Your account</h2>
          <p>
            You can stop using Lampsill whenever you like. <strong>Settings &rarr; Delete
            everything</strong> deletes your account and what we hold about you, as the{' '}
            <a href="/privacy/app">app privacy notice</a> explains, or follow{' '}
            <a href="/delete-account">these steps</a>.
          </p>

          <h2>What it costs</h2>
          <p>
            Lampsill is free until {FREE_UNTIL}. After that it may stay free, or there may be a small
            charge. If there is, we&rsquo;ll tell you in the app well before it starts, and nothing is
            charged unless you agree to it. People on the early-access list get{' '}
            {EARLY_ACCESS.freeMonths} extra months free if Lampsill ever charges.
          </p>

          <h2>Changes</h2>
          <p>
            We keep improving Lampsill, so it will change. If we change these terms in a way that
            matters, or ever have to stop Lampsill, we&rsquo;ll tell you in the app first, with as much
            notice as we can. The date at the top changes with every update.
          </p>

          <h2>If something goes wrong</h2>
          <p>
            We take care building and running Lampsill, but we can&rsquo;t promise it will work every
            time, for the reasons above. As far as the law allows, we aren&rsquo;t responsible for loss
            caused by a message that was late or didn&rsquo;t arrive, or by Lampsill not being
            available.
          </p>
          <p>
            Nothing here limits our responsibility where the law doesn&rsquo;t allow it to be limited,
            for example for death or injury caused by our negligence, or for fraud. Nothing here takes
            away your rights under the consumer law of the country you live in.
          </p>

          <h2>Apple and Google</h2>
          <p>
            Lampsill is ours, not Apple&rsquo;s or Google&rsquo;s. Their store terms also apply to how
            you download it, but they aren&rsquo;t responsible for the app or for these terms.
          </p>

          <h2>Questions and complaints</h2>
          <p>
            Please tell us first, at <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>, and
            we&rsquo;ll try to put it right. These terms are governed by the law of India. If you live
            somewhere else, you also keep the protections of the law where you live, and you can bring
            a claim in your own country&rsquo;s courts.
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
