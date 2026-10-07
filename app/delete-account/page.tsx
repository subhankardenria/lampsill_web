import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Masthead, Footer, Reveals } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import { marketForCountry } from '@/lib/pricing';
import { visitorCountry } from '@/lib/geo';

/**
 * HOW TO DELETE A LAMPSILL ACCOUNT.
 *
 * Google Play wants two things for an app that makes accounts: a way to delete
 * the account from inside the app, and a web page that says how, whose address
 * goes in the Data safety form. This is that page. It is only true while these
 * three things are:
 *
 *   the in-app path        Settings → "Delete everything" (privacy_screens.dart)
 *   what is erased         DELETE /v1/account (AccountController, which the
 *                          app's button calls); one delete, the rest cascades
 *   the email route        hello@lampsill.com, answered within a month — the
 *                          same promise as the privacy notice
 *
 * Change one and change this.
 */
const UPDATED = '7 October 2026';

export const metadata: Metadata = {
  title: 'Delete your account — Lampsill',
  description: 'How to delete your Lampsill account and everything in it, in the app or by email.',
  alternates: { canonical: '/delete-account' },
};

export default async function DeleteAccountPage() {
  const seen = await visitorCountry(await headers());
  const market = marketForCountry(seen.country);

  return (
    <PriceProvider initialMarket={market.key} country={seen.country} guessed={!seen.certain}>
      <Masthead base="/" />
      <Reveals />
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <p className="eyebrow">Your account</p>
          <h1>Delete your Lampsill account.</h1>
          <p className="lede">
            In the app it takes a moment. If you can&rsquo;t get to the app, email us.
          </p>
          <p className="legal-updated">Last updated {UPDATED}</p>

          <h2>In the app</h2>
          <ol>
            <li>Open Lampsill and go to <strong>Settings</strong>.</li>
            <li>Tap <strong>Delete everything</strong>.</li>
            <li>Tick the box, then tap <strong>Delete everything</strong> again.</li>
          </ol>
          <p>It happens straight away, and it can&rsquo;t be undone.</p>

          <h2>By email</h2>
          <p>
            No phone, or can&rsquo;t sign in? Email{' '}
            <a href="mailto:hello@lampsill.com?subject=Delete%20my%20Lampsill%20account">hello@lampsill.com</a>{' '}
            from the address the account uses, with the subject &ldquo;Delete my Lampsill
            account&rdquo;. It&rsquo;s free. We delete it, usually the same day and always within a
            month, and tell you when it&rsquo;s done.
          </p>

          <h2>What is deleted</h2>
          <ul>
            <li>Your account and your email address.</li>
            <li>Your Silence Alert, its history, and the names and numbers you added to it.</li>
            <li>
              The people you look out for, and anyone you added as someone nearby, along with the
              codes that linked you.
            </li>
            <li>The record of who was told what, and when.</li>
            <li>The movement data on your phone, and the key that let it report.</li>
          </ul>
          <p>
            Lampsill stops looking out for you the moment this happens. Anyone who was set to be
            told if your phone went quiet won&rsquo;t hear from it again, so let them know first.
          </p>

          <h2>What stays</h2>
          <ul>
            <li>
              <strong>Other people&rsquo;s accounts.</strong> If someone looked out for you with
              their own Lampsill, their account stays. It just no longer lists you.
            </li>
            <li>
              <strong>Backups, for up to 30 days.</strong> A nightly encrypted copy of our database
              is kept for 30 days and then deleted on its own. It&rsquo;s used only to restore the
              service if something goes wrong, and your account is not restored from it.
            </li>
            <li>
              <strong>Short-lived hosting logs</strong>, which our providers keep to run the
              service securely.
            </li>
          </ul>

          <p>
            If you only joined the early-access list on this website, the same email removes you.
            The <a href="/privacy">privacy notice</a> says what that list holds.
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
