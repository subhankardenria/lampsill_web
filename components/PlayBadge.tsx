import { PLAY_URL } from '@/lib/copy';

/**
 * Google's own "Get it on Google Play" badge (owner, 2 Nov 2026: "use also
 * standard play store button"), the English PNG from
 * play.google.com/intl/en_us/badges, unaltered, in public/. The transparent
 * margin round it is part of the badge, so the size is set by height and the
 * margin is never cropped. Google asks for it no smaller than 40px of badge.
 */
export function PlayBadge({ height = 64, className = '' }: { height?: number; className?: string }) {
  return (
    <a className={`play-badge ${className}`.trim()} href={PLAY_URL} target="_blank" rel="noopener">
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed badge,
          nothing for the image optimiser to do */}
      <img src="/google-play-badge.png" alt="Get it on Google Play" width={(height * 646) / 250} height={height} />
    </a>
  );
}
