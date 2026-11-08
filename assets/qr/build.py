"""The QR code on the install card (components/InstallPrompt.tsx).

    pip install segno               # and rsvg-convert: brew install librsvg
    python3 assets/qr/build.py

writes public/google-play-qr.svg for the site, and the same code as pictures
for posters, flyers and messages (owner, 2 Nov 2026: "you should save the qr
as image too"): brand/png/lampsill-google-play-qr-1024.png and -2048.png,
with the full four-module margin a printed code needs.

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
import subprocess
import segno

URL = "https://play.google.com/store/apps/details?id=app.lampsill"
# The site's install card (8 Nov 2026, iPhone out): through /get, so an iPhone
# camera lands on the App Store and an Android one on Play (app/get/route.ts).
SITE_URL = "https://www.lampsill.com/get?from=site"
SITE_OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "get-qr.svg")
INK = "#0A1014"
PAPER = "#FFF4E0"
TILE = "#0C1317"  # the app icon's ground
FRAME = "#8FBCE0"
LAMP = "#F5C97B"
QUIET_WEB = 2  # modules of margin on the site; the card's cream padding adds to it
QUIET_PRINT = 4  # the margin the QR standard asks for, on paper or in a message

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "..", "public", "google-play-qr.svg")
PNG = os.path.join(HERE, "..", "..", "..", "brand", "png", "lampsill-google-play-qr-{}.png")


def draw(q, QUIET):
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
    return svg, n, hole


def main():
    q = segno.make(URL, error="h", boost_error=False)
    svg, n, hole = draw(q, QUIET_WEB)
    with open(OUT, "w") as f:
        f.write(svg)
    print(f"{os.path.normpath(OUT)}: version {q.version}-{q.error}, {n}x{n} modules, icon {hole}x{hole}")

    site = segno.make(SITE_URL, error="h", boost_error=False)
    svg, n, hole = draw(site, QUIET_WEB)
    with open(SITE_OUT, "w") as f:
        f.write(svg.replace('aria-label="QR code for Lampsill on Google Play"', 'aria-label="QR code for Lampsill"'))
    print(f"{os.path.normpath(SITE_OUT)}: version {site.version}-{site.error}, {n}x{n} modules")

    printed, _, _ = draw(q, QUIET_PRINT)
    for width in (1024, 2048):
        dst = os.path.normpath(PNG.format(width))
        subprocess.run(["rsvg-convert", "-w", str(width), "-f", "png", "-o", dst, "/dev/stdin"],
                       input=printed.encode(), check=True)
        print(dst)


if __name__ == "__main__":
    main()
