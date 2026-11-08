import type { CSSProperties } from 'react';
import { APP_STORE_URL } from '@/lib/copy';
import { PlayBadge } from './PlayBadge';

/**
 * BOTH STORES, AS A PAIR (owner, 9 Nov 2026: "add the app store badge but
 * creatively place"). Lampsill went live on the App Store on 9 Nov.
 *
 * The rules this follows, from each company's guidelines:
 *   Apple   the black badge whenever another store's badge is beside it
 *           (public/app-store-badge.svg, from developer.apple.com, unaltered,
 *           grey border and all); the App Store badge FIRST in the line; clear
 *           space a quarter of its height; never under 40px tall on screen.
 *   Google  its badge no smaller than any other store's badge beside it.
 * So `size` is the height you SEE, the same for both. Google's PNG carries a
 * transparent margin (41 of its 250px top and left, 42 bottom and right), so
 * its image is drawn at size / 0.668 and the margin is pulled back in CSS
 * (.store-badges in app/sections.css); the gap between them is the clear space.
 *
 * With `pair`, a line underneath answers the question families ask first:
 * the server sends to every phone on an account, Android or iPhone, so the
 * person living alone and the people looking out needn't have the same phone.
 *
 * APP_STORE_URL null puts back the Play badge alone.
 */
export function AppStoreBadge() {
  if (!APP_STORE_URL) return null;
  return (
    <a className="app-store-badge" href={APP_STORE_URL} target="_blank" rel="noopener">
      {/* eslint-disable-next-line @next/next/no-img-element -- Apple's fixed artwork */}
      <img src="/app-store-badge.svg" alt="Download on the App Store" width={120} height={40} />
    </a>
  );
}

export function StoreBadges({ size = 40, pair = false, className = '' }: { size?: number; pair?: boolean; className?: string }) {
  return (
    <div className={`store-badges ${className}`.trim()} style={{ '--vh': `${size}px` } as CSSProperties}>
      <div className="store-badges-row">
        <AppStoreBadge />
        <PlayBadge height={Math.round(size / 0.668)} />
      </div>
      {pair ? <StorePair /> : null}
    </div>
  );
}

export function StorePair({ className = '' }: { className?: string }) {
  if (!APP_STORE_URL) return null;
  return (
    <p className={`store-pair ${className}`.trim()}>
      <PairMark />
      <span>
        Android or iPhone. <em>Theirs and yours don&rsquo;t have to match.</em>
      </span>
    </p>
  );
}

/* Two Lampsill windows, theirs and yours, whichever phone each is: the
   brand's small cut (brand/logo/mark-small.svg, for under 48px: frame 6,
   bars 4, pane re-inset), drawn twice, joined by a dotted line. */
function SmallMark({ x = 0 }: { x?: number }) {
  return (
    <g transform={`translate(${x},0)`}>
      <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" fill="none" stroke="var(--vesper)" strokeWidth="6" strokeLinejoin="round" />
      <path d="M32 14 L32 52 M18 34 L46 34" fill="none" stroke="var(--vesper)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <rect x="20.25" y="37.25" width="8.5" height="10.5" rx="1" fill="var(--lamp)" />
    </g>
  );
}

function PairMark() {
  return (
    <svg className="store-pair-mark" viewBox="12 8 102 48" width="46" height="22" aria-hidden="true">
      <SmallMark />
      <path d="M58 43 H68" stroke="var(--vesper)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 5" opacity="0.7" />
      <SmallMark x={62} />
    </svg>
  );
}
