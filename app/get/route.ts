import { type NextRequest, NextResponse } from 'next/server';
import { APP_STORE_URL, PLAY_URL } from '@/lib/copy';

/**
 * lampsill.com/get: WHERE EVERY PRINTED QR CODE POINTS (5 Nov 2026).
 *
 *   Android  → Lampsill on Google Play
 *   iPhone   → the App Store once APP_STORE_URL is set; until then
 *              /get/iphone, which says it's coming
 *   anything else (a laptop, someone typing the address) → the home page's
 *              "Get Lampsill" section
 *
 * Printed codes point here, not at Google Play, so the day the iPhone app is
 * out every poster already sent works for iPhones too. Nothing to reprint.
 *
 * ?from=poster (or flyer, banner, a place's short name) tells Google Play
 * where the install came from: Play Console → Acquisition shows it as the
 * utm_source. This page keeps nothing itself, so the website's "no analytics"
 * promise stays true. Only short lowercase tags are passed on; anything else
 * is dropped.
 */
const TAG = /^[a-z0-9-]{1,32}$/;

function playLink(from: string | null) {
  if (!from) return PLAY_URL;
  return `${PLAY_URL}&referrer=${encodeURIComponent(`utm_source=${from}&utm_medium=qr`)}`;
}

function appStoreLink(url: string, from: string | null) {
  // The App Store's own campaign field is ct=.
  if (!from) return url;
  return `${url}${url.includes('?') ? '&' : '?'}ct=${from}`;
}

function go(to: string | URL) {
  const res = NextResponse.redirect(to, 307);
  // The answer depends on the phone, so no shared cache may keep one.
  res.headers.set('Cache-Control', 'private, no-store');
  res.headers.set('Vary', 'User-Agent');
  return res;
}

export function GET(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? '';
  const raw = request.nextUrl.searchParams.get('from') ?? '';
  const from = TAG.test(raw) ? raw : null;

  if (/Android/i.test(ua)) return go(playLink(from));
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return go(APP_STORE_URL ? appStoreLink(APP_STORE_URL, from) : new URL('/get/iphone', request.url));
  }
  return go(new URL('/#get', request.url));
}
