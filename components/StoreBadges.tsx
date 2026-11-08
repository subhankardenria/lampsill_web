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

/* Two windows, one lit, one framed: their phone and yours, whichever each is. */
function PairMark() {
  return (
    <svg className="store-pair-mark" viewBox="0 0 44 20" width="44" height="20" aria-hidden="true">
      <path d="M3 18V9a6 6 0 0 1 12 0v9Z" fill="none" stroke="#8FBCE0" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="5" y="12" width="3.6" height="4.4" rx=".5" fill="#F5C97B" />
      <path d="M17.5 13h9" stroke="#8FBCE0" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="0.1 3" />
      <path d="M29 18V9a6 6 0 0 1 12 0v9Z" fill="none" stroke="#8FBCE0" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="35.4" y="12" width="3.6" height="4.4" rx=".5" fill="#F5C97B" />
    </svg>
  );
}
