#!/usr/bin/env bash
# Render assets/og/card.html to public/og.jpg, and write lib/og.ts to match.
#
# Run it after editing card.html or alt.txt. Nothing in the Next build calls
# this — the PNG is committed, so a deploy never depends on Google Fonts being
# reachable or on Chrome being installed. card.html explains the renderer.
#
#   ./assets/og/build.sh
#
# WHAT IT DOES, AND WHY EACH STEP IS THERE
#
#   1. Fetches the three site typefaces from Google Fonts and INLINES them as
#      data URIs. Not a convenience: a <link> to fonts.googleapis.com is a
#      network round trip racing a screenshot, and when it loses, the card
#      renders in Times New Roman and looks like a deliberate choice. Inlined,
#      the fonts are present before first layout and cannot lose.
#   2. Screenshots the 1200x630 layout at device scale 2 and SHIPS THAT —
#      2400x1260. See below.
#   3. Writes lib/og.ts — see below.
#
# THE CARD IS 1200x630 OF LAYOUT DELIVERED AS 2400x1260 OF PIXELS.
#
# 1200x630 is the 1.91:1 that Facebook, LinkedIn, X's summary_large_image,
# Slack, WhatsApp and iMessage all agree on, and the CSS in card.html is
# written to that. Do not change the ratio without checking all six.
#
# But 1200 wide is the MINIMUM those platforms ask for, not a target, and every
# one of them is read on a 2x or 3x display, where a 1200px card is upscaled
# and the serif goes soft. The first version of this script rendered at 2x and
# then resized back down to 1200 — which spends the whole 2x render on
# antialiasing and throws the rest away. Shipping the 2x bitmap costs nothing
# extra to produce and is the single biggest difference in how sharp the card
# looks in a real timeline.
#
# WHY JPEG, ON A FLAT DARK GRAPHIC WHERE PNG IS THE OBVIOUS CHOICE.
# 2400x1260 as PNG is 756KB. WhatsApp will not render a rich preview much past
# ~300KB — it falls back to a bare link — so the PNG buys sharpness on five
# platforms by losing the picture entirely on the sixth. At quality 92 with NO
# chroma subsampling (4:4:4, which is what keeps the blue frame's edges and the
# gold pane clean) the same image is 185KB at 47dB PSNR, and a 1:1 crop of the
# headline against the PNG is indistinguishable. Measured, not assumed — and
# worth re-measuring if the card ever gains a photograph.
#
# Banding was the other worry and is not one: Chrome dithers its gradients, and
# a 50x contrast stretch over the glow shows dither texture rather than
# contour rings. That is why there is no grain layer in card.html.
#
# WHY public/og.png AND A GENERATED CONSTANT, rather than Next's much tidier
# app/opengraph-image.png file convention — which was tried first and reverted:
#
#   `next build` runs on TURBOPACK in Next 16, and Turbopack does not read
#   opengraph-image.alt.txt. Only the webpack loader does; see
#   node_modules/next/dist/build/webpack/loaders/next-metadata-image-loader.js
#   around line 138, and note there is no Turbopack equivalent. The .alt.txt
#   compiles to a module nothing consumes, so og:image:alt is silently never
#   emitted — and the file convention also SHADOWS metadata.openGraph.images,
#   so the alt cannot be supplied by hand either. Verified on 16.3.5: with both
#   present, the hand-written image object is dropped whole.
#
#   For a site that chose its body typeface for readers with cataracts, a share
#   card with no alt text is the wrong thing to ship. So the image is a plain
#   public/ asset, and lib/og.ts carries the URL, the real pixel dimensions and
#   the alt as one object that both og: and twitter: read.
#
#   The `?v=` on that URL is the image's content hash, and it is the reason the
#   file is generated rather than typed. Facebook, LinkedIn, WhatsApp and Slack
#   cache a share image BY URL and do not come back to check; a stable /og.jpg
#   whose bytes changed is a card that never updates anywhere. A hash cannot be
#   forgotten the way a hand-bumped ?v=2 can.
#
# If Turbopack ever reads alt.txt, all of this collapses back into
# app/opengraph-image.png + app/opengraph-image.alt.txt and lib/og.ts goes.

set -euo pipefail
cd "$(dirname "$0")"

WEB=../..                      # lampsill_web
OUT="$WEB/public/og.jpg"
CONST="$WEB/lib/og.ts"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$CHROME" ] || { echo "error: Google Chrome not found at $CHROME" >&2; exit 1; }
command -v magick >/dev/null 2>&1 || { echo "error: ImageMagick not found. brew install imagemagick" >&2; exit 1; }

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# The exact families, weights and styles app/layout.tsx asks next/font for.
# If that list changes, change this one.
FONTS='family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Atkinson+Hyperlegible:wght@400;700&family=JetBrains+Mono:wght@400;500'

echo "fonts…"
python3 - "$TMP" "$FONTS" <<'PY'
import base64, re, sys, urllib.request

tmp, fonts = sys.argv[1], sys.argv[2]
url = f"https://fonts.googleapis.com/css2?{fonts}&display=block"

# The UA decides the format Google serves. Anything it does not recognise gets
# TrueType, which is several times the bytes for the same glyphs.
req = urllib.request.Request(url, headers={"User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"})
css = urllib.request.urlopen(req, timeout=30).read().decode()

# Latin only. The card has no Cyrillic, Greek or Vietnamese on it, and carrying
# those subsets as base64 triples the stylesheet for glyphs nothing references.
# Latin covers the three punctuation marks that matter here: the em dash, the
# right single quote and the middle dot.
blocks = re.findall(r"/\* (\S+) \*/\s*(@font-face \{.*?\})", css, re.S)
kept, got, cache = [], set(), {}
for subset, block in blocks:
    if subset != "latin":
        continue
    url = re.search(r"url\((https://[^)]+)\)", block).group(1)
    # Two weights of a VARIABLE family share one file, so the faces are kept
    # per declaration and only the DOWNLOAD is deduplicated. Dropping the
    # second block instead loses a weight: Newsreader 500 is the wordmark and
    # the headline, and it would silently fall back to 400.
    if url not in cache:
        data = urllib.request.urlopen(url, timeout=30).read()
        cache[url] = "data:font/woff2;base64," + base64.b64encode(data).decode()
    # unicode-range goes with the other subsets; one face per weight now covers
    # everything on the card, and a leftover range would only exclude glyphs.
    block = re.sub(r"\s*unicode-range:[^;]+;", "", block)
    kept.append(block.replace(url, cache[url]))
    got.add((re.search(r"font-family: '([^']+)'", block).group(1),
             re.search(r"font-weight: (\d+)", block).group(1)))

want = {("Newsreader", "400"), ("Newsreader", "500"),
        ("Atkinson Hyperlegible", "400"), ("Atkinson Hyperlegible", "700"),
        ("JetBrains Mono", "400"), ("JetBrains Mono", "500")}
if got != want:
    sys.exit(f"font faces missing: {sorted(want - got)} — check the family list")

out = "\n".join(kept) + "\n"
open(f"{tmp}/fonts.css", "w").write(out)
print(f"  {len(kept)} latin faces, {len(out)//1024} KB inlined")
PY

cp card.html "$TMP/"

echo "render…"
"$CHROME" \
  --headless \
  --disable-gpu \
  --hide-scrollbars \
  --force-device-scale-factor=2 \
  --window-size=1200,630 \
  --virtual-time-budget=4000 \
  --screenshot="$TMP/2x.png" \
  "file://$TMP/card.html" >/dev/null 2>&1

[ -s "$TMP/2x.png" ] || { echo "error: Chrome produced no screenshot" >&2; exit 1; }

echo "encode…"
magick "$TMP/2x.png" -quality 92 -sampling-factor 4:4:4 -strip "$OUT"

# Both of these are invisible until the card is already in someone's timeline,
# so they are checked rather than assumed.
got=$(magick identify -format '%wx%h' "$OUT")
[ "$got" = "2400x1260" ] || { echo "error: got $got, expected 2400x1260" >&2; exit 1; }

kb=$(( $(stat -f%z "$OUT") / 1024 ))
[ "$kb" -lt 290 ] || {
  echo "error: ${kb}KB — past WhatsApp's ~300KB preview limit. Lower the" >&2
  echo "       quality, or check what was added to the card." >&2
  exit 1
}

echo "constant…"
python3 - "$OUT" alt.txt "$CONST" <<'PY'
import hashlib, json, sys

img, alt_path, out = sys.argv[1:4]
digest = hashlib.sha256(open(img, "rb").read()).hexdigest()[:10]
# One line, whatever the file's wrapping: this ends up inside a meta tag.
alt = " ".join(open(alt_path, encoding="utf-8").read().split())

ts = f"""/* GENERATED BY assets/og/build.sh — DO NOT EDIT BY HAND.
 *
 * The card Facebook, LinkedIn, X, Slack, WhatsApp and iMessage show when
 * somebody posts a link to this site. To change it, edit assets/og/card.html
 * or assets/og/alt.txt and re-run that script; its header explains why this
 * file exists instead of Next's opengraph-image file convention.
 *
 * The size is the real pixel size of the file, which is 2x the 1200x630 the
 * card is laid out at — the platforms treat 1200x630 as a floor and are all
 * read on retina displays. assets/og/build.sh explains that and the format.
 *
 * `v` is the image's own content hash. All of those platforms cache a share
 * image by URL and never come back to check, so the URL has to change when the
 * picture does.
 */
export const OG_IMAGE = {{
  url: {json.dumps('/og.jpg?v=' + digest)},
  width: 2400,
  height: 1260,
  type: "image/jpeg",
  alt: {json.dumps(alt, ensure_ascii=False)},
}} as const;
"""
open(out, "w", encoding="utf-8").write(ts)
print(f"  v={digest}")
PY

echo "done — $OUT ($got, $(du -h "$OUT" | tr -s '\t' ' ' | cut -d' ' -f1)) and $CONST"
