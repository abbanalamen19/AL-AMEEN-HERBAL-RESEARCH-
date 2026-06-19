import { z } from 'zod';
import { getAdminAuth } from '@apri/core';
import { cookies } from 'next/headers';
import { ok, errors } from '@/lib/api';

export const dynamic = 'force-dynamic';

const body = z.object({ idToken: z.string().min(10) });
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

/** Exchange a Firebase ID token for an httpOnly session cookie. */
export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return errors.validation(parsed.error.flatten());

  const auth = getAdminAuth();
  if (!auth) return errors.internal();

  try {
    const sessionCookie = await auth.createSessionCookie(parsed.data.idToken, {
      expiresIn: FIVE_DAYS_MS,
    });
    const store = await cookies();
    store.set('__session', sessionCookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: FIVE_DAYS_MS / 1000,
      path: '/',
    });
    return ok({ ok: true });
  } catch {
    return errors.unauthenticated();
  }
}

/** Sign out: clear the session cookie. */
export async function DELETE() {
  const store = await cookies();
  store.delete('__session');
  return ok({ ok: true });
}
