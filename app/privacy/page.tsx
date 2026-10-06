import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Masthead, Footer, Reveals } from '@/components/Chrome';
import { PriceProvider } from '@/components/Price';
import { EARLY_ACCESS, FREE_UNTIL } from '@/lib/copy';
import { countryFromHeaders, marketForCountry } from '@/lib/pricing';

/**
 * THE PRIVACY NOTICE for the website and the early-access list.
 *
 * UK GDPR Article 13 wants this said at the moment details are collected, not
 * later — which is why it exists now, while the form is live, and why the form
 * links to it.
 *
 * ⚠️ EVERY SENTENCE HERE IS A CLAIM ABOUT THE CODE, and each one is true because
 * of something specific. Change that thing and this page becomes false:
 *
 *   what the form stores             app/api/join/route.ts, the table
 *   the IP hash goes after a day     forgetOldIps() in the same file
 *   no cookies, no analytics         nothing sets any; README "No analytics"
 *   nothing from anyone else's server  the CSP in next.config.mjs is 'self'
 *   the price region stays on device localStorage in components/Price.tsx
 *   stored in the US                 the Neon project's region (us-east-2)
 *   email kept in India              the Zoho account's data centre (zoho.in),
 *                                    which Zoho cannot move after sign-up
 *   no payments                      NEXT_PUBLIC_CHECKOUT_OPEN is unset
 *
 * The last two are the likeliest to change. Moving the database to Frankfurt
 * changes "Where it's kept"; opening a checkout adds a payment processor to
 * "Who else handles it" and must happen HERE FIRST, then email the list —
 * see README, "The privacy page".
 *
 * `UPDATED` is shown on the page. Bump it with any change of substance.
 */
const UPDATED = '26 September 2026';

export const metadata: Metadata = {
  title: 'Privacy — Lampsill',
  description: 'What Lampsill keeps when you join the early-access list, why, and how to have it removed.',
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const country = countryFromHeaders(await headers());
  const market = marketForCountry(country);
  const spots = EARLY_ACCESS.freeSpots;

  return (
    <PriceProvider initialMarket={market.key} country={country}>
      <Masthead base="/" />
      <Reveals />
      <main id="main" className="section legal">
        <div className="wrap narrow">
          <p className="eyebrow">Privacy</p>
          <h1>Your details, and what we do with them.</h1>
          <p className="lede">
            This covers the Lampsill website and the early-access list. It&rsquo;s written to be
            read, not skimmed past.
          </p>
          <p className="legal-updated">Last updated {UPDATED}</p>

          <div className="legal-short">
            <h2>In short</h2>
            <ul>
              <li>
                <strong>Just visiting? We keep nothing about you.</strong> No cookies, no analytics,
                no ads, no tracking.
              </li>
              <li>
                <strong>Join the list and we keep your email</strong>, plus anything else you chose
                to tell us, to email you when Lampsill is ready. Nothing else.
              </li>
              <li>
                <strong>We never sell it or share it</strong> for anyone else&rsquo;s marketing.
              </li>
              <li>
                <strong>Want it gone?</strong> Email{' '}
                <a href="mailto:hello@lampsill.com?subject=Remove%20me">hello@lampsill.com</a> and
                we&rsquo;ll delete it.
              </li>
            </ul>
          </div>

          <h2>Who we are</h2>
          <p>
            Lampsill is responsible for your details (in data protection law, the
            &ldquo;controller&rdquo;). You can reach us at{' '}
            <a href="mailto:hello@lampsill.com">hello@lampsill.com</a> about anything on this page.
          </p>

          <h2>If you just visit</h2>
          <p>
            We don&rsquo;t set cookies, and there are no analytics, advertising or tracking scripts on
            this site. Every file it loads, including its fonts, comes from our own domain, so no
            other company learns that you visited from us.
          </p>
          <p>
            Our hosting provider works out your rough country from your connection so we can show
            prices in your currency. We don&rsquo;t store that unless you join the list. Like any web
            host, it keeps short-lived technical logs, which include IP addresses, to keep the site
            running and secure.
          </p>
          <p>
            If you change the price region, your browser remembers your choice on your own device.
            It isn&rsquo;t sent to us.
          </p>

          <h2>If you join the early-access list</h2>
          <p>This is everything we keep:</p>
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
                  <td>Your email address</td>
                  <td>To tell you when Lampsill is ready.</td>
                </tr>
                <tr>
                  <td>
                    Your first name <em>(if you gave it)</em>
                  </td>
                  <td>So the email can say hello properly.</td>
                </tr>
                <tr>
                  <td>
                    Who you look out for, and what phone they use <em>(if you told us)</em>
                  </td>
                  <td>
                    To decide what to build first. Lampsill works differently on iPhone and Android,
                    so this one matters.
                  </td>
                </tr>
                <tr>
                  <td>
                    Whether you&rsquo;d help test Lampsill <em>(if you ticked it)</em>
                  </td>
                  <td>So we can invite you to try it before it launches.</td>
                </tr>
                <tr>
                  <td>Your country</td>
                  <td>To know where to open first, and which prices apply to you.</td>
                </tr>
                <tr>
                  <td>Your place in the queue, and whether it came with free months</td>
                  <td>
                    The first {spots} people get {EARLY_ACCESS.freeMonths} more months free once
                    paid plans start.
                    This is our record of who was promised what.
                  </td>
                </tr>
                <tr>
                  <td>When you signed up, and which wording you agreed to</td>
                  <td>So we can show what you said yes to, if you ever ask.</td>
                </tr>
                <tr>
                  <td>A scrambled form of your IP address</td>
                  <td>
                    To stop one connection flooding the list. It&rsquo;s scrambled before it&rsquo;s
                    stored, so it can&rsquo;t be turned back into your address, and{' '}
                    <strong>we delete it after a day</strong>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            We&rsquo;ll email you when Lampsill is ready and, if you ticked the testing box, about
            trying it early. Nothing else: no newsletters, no offers. Each email tells you how to
            get off the list.
          </p>

          <h2>Our legal reasons</h2>
          <p>
            Data protection law asks us to say which legal basis we rely on for each use:
          </p>
          <ul>
            <li>
              <strong>Your consent</strong>, given by the tick box, for keeping you on the list and
              emailing you, and for the optional answers you chose to give. You can withdraw it at
              any time, and doing so doesn&rsquo;t affect anything we did before.
            </li>
            <li>
              <strong>Our legitimate interest</strong> in keeping the list free of spam (the
              scrambled IP address) and in running a website that works and stays secure (hosting
              logs).
            </li>
          </ul>

          <h2>No payments yet</h2>
          <p>
            Lampsill is free until {FREE_UNTIL} and doesn&rsquo;t take payments yet. Nobody is
            charged before then, and we never ask for card details. Before paid plans start, we&rsquo;ll update this page to say who
            handles payments, and email everyone on the list.
          </p>

          <h2>Who else handles it</h2>
          <p>
            We don&rsquo;t sell or share your details. A few companies handle them on our behalf, and
            only to do this job:
          </p>
          <ul>
            <li>
              <strong>Vercel</strong>, which hosts this website.
            </li>
            <li>
              <strong>Neon</strong>, which runs the database the list is kept in.
            </li>
            <li>
              <strong>Zoho</strong>, which runs our email: messages you send us, and the emails we
              send you.
            </li>
          </ul>
          <p>
            Each is bound by a contract that stops it using your details for anything else. We
            might also have to share information if the law requires it.
          </p>

          <h2>Where it&rsquo;s kept</h2>
          <p>
            The list is stored in the United States, and emails you send us are kept by Zoho in
            India. Moving personal details outside the UK and the
            EU is allowed when the right safeguards are in place, and the contracts with the
            companies above include the standard contractual clauses that UK and EU law require for
            it.
          </p>

          <h2>How long we keep it</h2>
          <ul>
            <li>
              <strong>Until Lampsill launches</strong> and we&rsquo;ve sent you the launch email. If
              you don&rsquo;t start using Lampsill within six months of that, we delete your details.
            </li>
            <li>
              <strong>If you ask to be removed</strong>, we delete them, usually the same day and
              always within a month.
            </li>
            <li>
              <strong>If Lampsill doesn&rsquo;t launch</strong>, we delete the whole list.
            </li>
            <li>
              <strong>The scrambled IP address</strong> goes after a day, whatever else happens.
            </li>
          </ul>

          <h2>Your rights</h2>
          <p>You can ask us to:</p>
          <ul>
            <li>show you what we hold about you, and send you a copy;</li>
            <li>correct anything that&rsquo;s wrong;</li>
            <li>delete it;</li>
            <li>stop using it, or stop emailing you.</li>
          </ul>
          <p>
            Email <a href="mailto:hello@lampsill.com">hello@lampsill.com</a> from the address
            you signed up with. It&rsquo;s free, and we&rsquo;ll reply within a month.
          </p>
          <p>
            If you&rsquo;re unhappy with how we&rsquo;ve handled your details, please tell us first.
            You can also complain to the{' '}
            <a href="https://ico.org.uk/make-a-complaint/" rel="noopener">
              Information Commissioner&rsquo;s Office
            </a>{' '}
            in the UK, or to the data protection authority where you live.
          </p>

          <h2>The Lampsill app</h2>
          <p>
            This notice is about the website and the list. The app works differently, because it
            looks at when a phone is used, so it will have its own privacy notice. You&rsquo;ll see
            it before you set anything up.
          </p>

          <h2>Children</h2>
          <p>This site and the list are for adults. Please don&rsquo;t sign up if you&rsquo;re under 18.</p>

          <h2>Changes to this notice</h2>
          <p>
            If we change it, the date at the top changes too. If a change affects what we do with
            details you&rsquo;ve already given us, we&rsquo;ll email you before it takes effect.
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
