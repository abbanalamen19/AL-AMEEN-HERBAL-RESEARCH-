import { can, type Capability } from '@apri/schemas';
import { verifySession, type SessionUser } from '@apri/core';
import { cookies } from 'next/headers';

/** Resolve the current session user from the session cookie (server only). */
export async function currentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySession(store.get('__session')?.value);
}

/** Returns the user when they hold `cap`, otherwise null. */
export async function requireCapability(cap: Capability): Promise<SessionUser | null> {
  const user = await currentUser();
  if (!user) return null;
  return can(user.role, cap) ? user : null;
}
