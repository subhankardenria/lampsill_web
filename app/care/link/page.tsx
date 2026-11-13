import type { Metadata } from 'next';
import { Frame } from '../Frame';
import { OpenLink } from './OpenLink';
import '../care.css';

/**
 * www.lampsill.com/care/link?t=… — the link in a team's email (14 Nov 2026).
 *
 * Opening the page does nothing by itself: some mail services open every link
 * to check it, and a one-use link would be gone before the person clicked.
 * The button does it.
 */
export const metadata: Metadata = {
  title: 'Your care page · Lampsill',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export const dynamic = 'force-dynamic';

export default async function LinkPage({ searchParams }: { searchParams: Promise<{ t?: string | string[] }> }) {
  const t = (await searchParams).t;
  const token = typeof t === 'string' ? t.slice(0, 200) : '';

  return (
    <Frame>
      <OpenLink token={token} />
    </Frame>
  );
}
