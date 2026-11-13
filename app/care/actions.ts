'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { care, EMAIL_COOKIE, SESSION_COOKIE, type Code } from '@/lib/care';

/**
 * Everything the care page can do. Each one is checked by Lampsill's server
 * against the signed-in member of staff's own team; nothing is trusted from
 * the form beyond what was typed.
 */

const cookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/care',
};

export type FormState = { message?: string; said?: string; codes?: Code[]; names?: string; tries?: number };

async function signedOut(): Promise<never> {
  (await cookies()).delete({ name: SESSION_COOKIE, path: '/care' });
  redirect('/care');
}

export async function sendCode(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get('email') ?? '').trim();
  const res = await care<{ email: string; said: string }>('POST', '/code', { email });
  if (!res.ok) return { message: res.message };

  (await cookies()).set(EMAIL_COOKIE, res.data.email, { ...cookie, maxAge: 15 * 60 });
  revalidatePath('/care');
  return { said: res.data.said };
}

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const jar = await cookies();
  const email = jar.get(EMAIL_COOKIE)?.value ?? '';
  const res = await care<{ session: string }>('POST', '/sign-in', { email, code: String(form.get('code') ?? '') });
  if (!res.ok) return { message: res.message };

  jar.delete({ name: EMAIL_COOKIE, path: '/care' });
  jar.set(SESSION_COOKIE, res.data.session, { ...cookie, maxAge: 12 * 60 * 60 });
  redirect('/care');
}

export async function differentEmail(): Promise<void> {
  (await cookies()).delete({ name: EMAIL_COOKIE, path: '/care' });
  redirect('/care');
}

export async function signOut(): Promise<void> {
  await care('POST', '/sign-out');
  await signedOut();
}

export async function addClients(before: FormState, form: FormData): Promise<FormState> {
  const names = String(form.get('names') ?? '');
  const tries = (before.tries ?? 0) + 1;
  const res = await care<{ codes: Code[] }>('POST', '/clients', {
    names,
    window_hours: Number(form.get('window_hours')),
  });
  if (!res.ok && res.status === 401) return signedOut();
  // Refused: the names come back, so nothing typed is lost.
  if (!res.ok) return { message: res.message, names, tries };

  revalidatePath('/care');
  return { codes: res.data.codes, tries };
}

export async function newCode(inviteId: string): Promise<FormState> {
  const res = await care<{ codes: Code[] }>('POST', `/invites/${encodeURIComponent(inviteId)}/code`);
  if (!res.ok && res.status === 401) return signedOut();
  if (!res.ok) return { message: res.message };

  revalidatePath('/care');
  return { codes: res.data.codes };
}

/** "I'm checking", "They're OK", "Stop looking out", "Remove" (an invite). */
export async function act(path: string): Promise<void> {
  const allowed = /^\/(clients\/[0-9a-f-]{36}\/(checking|ok|stop)|invites\/[0-9a-f-]{36}\/remove)$/;
  if (!allowed.test(path)) return;

  const res = await care('POST', path);
  if (!res.ok && res.status === 401) await signedOut();
  revalidatePath('/care');
}
