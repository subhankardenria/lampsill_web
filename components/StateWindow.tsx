/**
 * How one person stands, as their own small window — the same picture the
 * app draws beside each person someone looks out for (5 Oct 2026).
 *
 *   normal   the lamp on: blue frame, gold pane
 *   paused   dark and grey: they have paused it
 *   quiet    dark, in the warning colour: their phone has gone quiet
 *   lost     the same, with the crown open: you would not be told
 *
 * IT IS THE MARK, NOT A SKETCH OF IT. The paths, stroke widths and the pane
 * are the mark's own — `WindowMark.tsx`, and `PersonWindow` in the app's
 * lib/widgets/flow_pictures.dart, which is drawn from the same 64-unit
 * numbers. What it leaves out is the light: no aura, no glow, no sheen. At
 * this size a glow is haze, and a status has to read at a glance.
 *
 * The viewBox is the mark cropped to what is drawn (16..48 across, 12..52
 * down, plus half the 4.8 stroke), so the window fills its box.
 */
export type WindowState = 'normal' | 'paused' | 'quiet' | 'lost';

const SAYS: Record<WindowState, string> = {
  normal: 'A window with the lamp on: normal',
  paused: 'A dark window: paused',
  quiet: 'A dark window in the warning colour: their phone has gone quiet',
  lost: 'A dark window with its crown open: permission lost',
};

export default function StateWindow({ state, size = 22 }: { state: WindowState; size?: number }) {
  const frame = state === 'normal' ? 'var(--vesper)' : state === 'paused' ? 'var(--ink2)' : 'var(--ember)';
  const open = state === 'lost';

  return (
    <svg
      className="state-window"
      viewBox="13.6 9.6 36.8 44.8"
      width={(size * 36.8) / 44.8}
      height={size}
      role="img"
      aria-label={SAYS[state]}
    >
      {state === 'normal' && <rect x="20" y="37.5" width="9" height="10.5" rx="1" fill="var(--lamp)" />}
      <g fill="none" stroke={frame} strokeWidth="3.2" opacity="0.5">
        {/* below the break when the crown is open, so it hangs from nothing */}
        <path d={`M32 ${open ? 20 : 14} L32 52`} />
        <path d="M17 34 L47 34" />
      </g>
      <g fill="none" stroke={frame} strokeWidth="4.8" strokeLinejoin="round" strokeLinecap="round">
        {open ? (
          <>
            <path d="M16 52 L16 28 A16 16 0 0 1 26 13.2" />
            <path d="M38 13.2 A16 16 0 0 1 48 28 L48 52" />
            <path d="M16 52 L48 52" />
          </>
        ) : (
          <path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" />
        )}
      </g>
    </svg>
  );
}
