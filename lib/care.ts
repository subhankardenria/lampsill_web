import { cookies, headers } from 'next/headers';

/**
 * THE CARE PAGE'S LINE TO THE SERVER (13 Nov 2026).
 *
 * lampsill.com/care is for care teams: their clients, the same states the
 * team's duty phone shows, and invite codes in bulk. Caregivers' browsers only
 * ever talk to this site; this file is the one place the site's server calls
 * Lampsill's server about care, at /v1/care, with a key only the two servers
 * know. Without the key, that server answers 404 to everything under /v1/care.
 *
 * Two environment variables (Vercel → Settings → Environment Variables, and
 * .env.local to try it locally):
 *
 *   LAMPSILL_CARE_KEY   the same value as LAMPSILL_CARE_KEY in the server's .env
 *   LAMPSILL_API_URL    optional; https://api.lampsill.com when unset
 *
 * The signed-in member of staff is a secret the server hands back at sign-in,
 * kept in an httpOnly cookie that only /care sees. The server keeps a hash of
 * it and ends it 12 hours after it was last used.
 *
 * Never imported by a client component: it reads the key.
 */

export const SESSION_COOKIE = 'care_session';
export const EMAIL_COOKIE = 'care_email';

export type Person = {
  id: string;
  name: string;
  status: 'ok' | 'alert' | 'paused' | 'permission_lost';
  reason: 'removed' | 'switched_off' | 'notifications_off' | null;
  window_hours: number;
  paused_until: string | null;
  checking_by: string | null;
  checking_me: boolean;
  note: string | null;
  phone: string;
};

export type Invite = { id: string; name: string; window_hours: number; expires_at: string };

export type CarePage = {
  team: { name: string; has_duty: boolean; seats: number | null; counted: number; seats_left: number | null };
  me: { email: string };
  people: Person[];
  pending: Invite[];
  windows: number[];
};

export type Code = { name: string; code: string };

export type Answer<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export function careIsOpen(): boolean {
  return (process.env.LAMPSILL_CARE_KEY ?? '').length >= 32;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || h.get('x-real-ip') || '';
}

/** One call to /v1/care. Never throws: a failure comes back as words. */
export async function care<T = unknown>(
  method: 'GET' | 'POST',
  path: string,
  body?: Record<string, unknown>,
): Promise<Answer<T>> {
  const base = (process.env.LAMPSILL_API_URL || 'https://api.lampsill.com').replace(/\/$/, '');
  const session = (await cookies()).get(SESSION_COOKIE)?.value;

  try {
    const res = await fetch(`${base}/api/v1/care${path}`, {
      method,
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        'X-Lampsill-Care-Key': process.env.LAMPSILL_CARE_KEY ?? '',
        ...(session ? { 'X-Lampsill-Care-Session': session } : {}),
        'X-Lampsill-Client-Ip': await clientIp(),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 204) return { ok: true, data: undefined as T };
    const json = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: json as T };
    return {
      ok: false,
      status: res.status,
      message: json?.error?.message ?? 'Lampsill is having trouble right now. Please try again shortly.',
    };
  } catch {
    return { ok: false, status: 0, message: "Lampsill can't be reached right now. Please try again shortly." };
  }
}
