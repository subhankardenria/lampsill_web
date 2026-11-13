import { cookies } from 'next/headers';
import { care, careIsOpen, SESSION_COOKIE, type CarePage } from '@/lib/care';

/**
 * GET /care/data — the signed-in team's page as JSON, for the page's own live
 * updates (14 Nov 2026). Same cookie, same server call as the page itself;
 * nothing more.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' };
  if (!careIsOpen() || !(await cookies()).has(SESSION_COOKIE)) {
    return Response.json({ message: 'Signed out.' }, { status: 401, headers });
  }

  const res = await care<CarePage>('GET', '');
  if (res.ok) return Response.json(res.data, { headers });

  return Response.json({ message: res.message }, { status: res.status === 401 ? 401 : 502, headers });
}
