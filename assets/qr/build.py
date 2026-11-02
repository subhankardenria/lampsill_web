"""The QR code on the install card (components/InstallPrompt.tsx).

    pip install segno
    python3 assets/qr/build.py      # writes public/google-play-qr.svg

It opens Lampsill on Google Play. The app icon sits in the middle (owner,
2 Nov 2026: "in qr code can you add the logo creatively"): the dark tile
with the lit window, the same drawing as brand/logo/icon-app.svg, so the
code reads as Lampsill's before anyone scans it.

WHY IT STILL SCANS. The code is made at error level H, which survives about
30% of it missing; the icon and its margin cover about 7%. The modules are
round dots. The three corner squares stay SQUARE: with rounded corners
OpenCV's reader (as strict as a cheap phone camera) stopped finding them,
2 Nov 2026. What must NOT change: dark on light (never lamp on cream, too
little contrast), the corner squares solid and square, and the quiet margin
round the outside. After any change, decode it (cv2.QRCodeDetector) and scan
it with a phone.
"""

import os
import segno

URL = "https://play.google.com/store/apps/details?id=app.lampsill"
INK = "#0A1014"
PAPER = "#FFF4E0"
TILE = "#0C1317"  # the app icon's ground
FRAME = "#8FBCE0"
LAMP = "#F5C97B"
QUIET = 2  # modules of margin; the card's own cream padding adds to it

OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "google-play-qr.svg")


def main():
    q = segno.make(URL, error="h", boost_error=False)
    m = [list(row) for row in q.matrix]
    n = len(m)
    size = n + 2 * QUIET

    # The middle left for the icon: an odd number of modules, centred, with
    # one module of paper round the tile.
    hole = 11 if n < 45 else 13
    lo = (n - hole) // 2
    hi = lo + hole

    def finder(r, c):
        return (r < 7 and c < 7) or (r < 7 and c >= n - 7) or (r >= n - 7 and c < 7)

    dots = []
    for r in range(n):
        for c in range(n):
            if not m[r][c] or finder(r, c) or (lo <= r < hi and lo <= c < hi):
                continue
            dots.append(f'<circle cx="{c + QUIET + 0.5}" cy="{r + QUIET + 0.5}" r="0.46"/>')

    eyes = []
    for r, c in ((0, 0), (0, n - 7), (n - 7, 0)):
        x, y = c + QUIET, r + QUIET
        eyes.append(
            f'<path fill-rule="evenodd" d="M{x} {y}h7v7h-7z M{x + 1} {y + 1}v5h5v-5z" fill="{INK}"/>'
            f'<rect x="{x + 2}" y="{y + 2}" width="3" height="3" fill="{INK}"/>'
        )

    # The app icon: tile, then the window at the icon's own proportions
    # (icon-app.svg scales the 64 drawing by 11 on a 1024 tile).
    t = hole - 2
    tx = lo + 1 + QUIET
    k = t / 1024 * 11
    ox = tx + t / 2 - 32 * k
    icon = (
        f'<rect x="{tx}" y="{tx}" width="{t}" height="{t}" rx="{t * 228 / 1024:.3f}" fill="{TILE}"/>'
        f'<g transform="translate({ox:.4f},{ox:.4f}) scale({k:.5f})">'
        f'<path d="M16 52 L16 28 A16 16 0 0 1 48 28 L48 52 Z" fill="none" stroke="{FRAME}" stroke-width="4.8" stroke-linejoin="round"/>'
        f'<path d="M32 13 L32 52 M17 34 L47 34" fill="none" stroke="{FRAME}" stroke-width="3.2" stroke-linecap="round" opacity="0.5"/>'
        f'<rect x="20" y="37.5" width="9" height="10.5" rx="1" fill="{LAMP}"/></g>'
    )

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" '
        f'aria-label="QR code for Lampsill on Google Play">'
        f"<!-- Made by assets/qr/build.py. Edit that, not this. -->"
        f'<rect width="{size}" height="{size}" fill="{PAPER}"/>'
        f'<g fill="{INK}">{"".join(dots)}</g>{"".join(eyes)}{icon}</svg>\n'
    )
    with open(OUT, "w") as f:
        f.write(svg)
    print(f"{OUT}: version {q.version}-{q.error}, {n}x{n} modules, icon {hole}x{hole}")


if __name__ == "__main__":
    main()
