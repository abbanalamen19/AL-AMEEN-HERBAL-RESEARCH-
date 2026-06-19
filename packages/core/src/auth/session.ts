import type { Role } from '@apri/schemas';
import { getAdminAuth } from '../firebase/admin';

export interface SessionUser {
  uid: string;
  email: string | null;
  role: Role;
}

/**
 * Verify a Firebase session cookie and extract the user + role claim.
 * Returns null when unauthenticated or when admin is unconfigured.
 */
export async function verifySession(sessionCookie: string | undefined): Promise<SessionUser | null> {
  if (!sessionCookie) return null;
  const auth = getAdminAuth();
  if (!auth) return null;
  try {
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? null,
      role: (decoded.role as Role) ?? 'public',
    };
  } catch {
    return null;
  }
}

/** Assign a role custom claim (super_admin action). */
export async function setUserRole(uid: string, role: Role): Promise<void> {
  const auth = getAdminAuth();
  if (!auth) throw new Error('Auth not configured');
  await auth.setCustomUserClaims(uid, { role });
}
