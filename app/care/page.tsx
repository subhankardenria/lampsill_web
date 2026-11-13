import type { Metadata } from 'next';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { care, careIsOpen, EMAIL_COOKIE, SESSION_COOKIE, type CarePage } from '@/lib/care';
import { Frame } from './Frame';
import { SignIn } from './SignIn';
import { CareApp } from './CareApp';
import './care.css';

/**
 * lampsill.com/care — for care teams (13 Nov 2026).
 *
 * NOTHING MORE THAN THE DUTY PHONE. A team's clients chose its duty account
 * with a code, as family would, and this page shows what that phone shows:
 * Normal, phone not used, paused, switched off, removed, or that something
 * needs fixing. Never when or how anyone used their phone — the server never
 * sends it (lampsill_api CareController). Words are the app's own.
 *
 * Not in the sitemap, and not indexed.
 */
/** One call per page view, shared by the title and the page. */
const load = cache(async () => {
  const jar = await cookies();
  return careIsOpen() && jar.has(SESSION_COOKIE) ? care<CarePage>('GET', '') : null;
});

export async function generateMetadata(): Promise<Metadata> {
  const page = await load();
  const alerts = page?.ok ? page.data.people.filter((p) => p.status === 'alert').length : 0;
  return {
    // The tab says so when a phone hasn't been used, even in the background.
    title: alerts > 0 ? `(${alerts}) Phone not used · Lampsill` : 'Lampsill for care teams',
    description: 'Your clients at a glance: the same list your duty phone shows.',
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

export default async function CarePageRoute() {
  if (!careIsOpen()) {
    return (
      <Frame>
        <h1 className="care-title">Lampsill for care teams</h1>
        <p className="care-quiet">This page isn&rsquo;t open yet. Write to <a href="mailto:hello@lampsill.com">hello@lampsill.com</a>.</p>
      </Frame>
    );
  }

  const jar = await cookies();
  const page = await load();

  if (!page?.ok) {
    return (
      <Frame>
        {page && page.status !== 401 && <p className="care-said" role="alert">{page.message}</p>}
        <SignIn email={jar.get(EMAIL_COOKIE)?.value ?? null} />
      </Frame>
    );
  }

  return (
    <main className="care care-app">
      <CareApp initial={page.data} />
    </main>
  );
}
