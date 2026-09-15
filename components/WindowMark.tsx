'use client';

/**
 * The hero cut of the mark, as a lit object rather than an icon.
 *
 * Same paths, stroke widths and opacities as the masthead and the demo — the
 * mark is not redesigned per placement. What is added here is only light: an
 * aura in the air behind it, a hot pool under the lit pane, and a glass sheen
 * across the whole opening.
 *
 * The viewBox is widened to -19 -10 92 92 because the aura reaches x −19…73;
 * in the asset's own 0 0 64 64 box the glow clips to a hard-edged rectangle.
 *
 * The parallax variables come from Hero's pointer loop. Depth is assigned by
 * how far each layer moves: the aura furthest, the frame least, so the glow
 * sits behind the window instead of on it.
 */
export default function WindowMark() {
  return (
    <svg viewBox="-19 -10 92 92" role="img" aria-label="An arched window with one pane lit" className="mark-hero">
      <defs>
        <radialGradient id="heroAura">
          <stop offset="0%" stopColor="#F5C97B" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#F5C97B" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#F5C97B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heroHot">
          <stop offset="0%" stopColor="#FFE7BC" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#F5C97B" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#F5C97B" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="heroSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#BDD9F1" stopOpacity="0.1" />
          <stop offset="48%" stopColor="#BDD9F1" stopOpacity="0" />
        </linearGradient>
        <clipPath id="heroGlass">
          <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" />
        </clipPath>
      </defs>

      <g className="layer-far">
        <circle cx="30" cy="34" r="48" fill="url(#heroAura)" />
      </g>

      <g className="layer-mid">
        <g clipPath="url(#heroGlass)">
          <ellipse className="mark-glow" cx="26" cy="46" rx="22" ry="15" fill="url(#heroHot)" />
          <rect x="4" y="4" width="9" height="62" fill="url(#heroSheen)" transform="rotate(-20 16 34)" />
        </g>
      </g>

      <g className="layer-near">
        <g fill="none" stroke="var(--vesper)" strokeWidth="4.8" strokeLinejoin="round">
          <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" />
        </g>
        <g fill="none" stroke="var(--vesper)" strokeWidth="3.2" strokeLinecap="round" opacity="0.5">
          <path d="M32 13 L32 52" />
          <path d="M17 34 L47 34" />
        </g>
        <rect x="20" y="37.5" width="9" height="10.5" rx="1" fill="var(--lamp)" />
      </g>
    </svg>
  );
}
