import { updateRoleInput } from '@apri/schemas';
import { setUserRole } from '@apri/core';
import { ok, errors } from '@/lib/api';
import { requireCapability } from '@/lib/guard';

export const dynamic = 'force-dynamic';

/** Super-admin only: assign a role custom claim to a user. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireCapability('users:manage');
  if (!admin) return errors.forbidden();

  const { id } = await params;
  const parsed = updateRoleInput.safeParse(await req.json());
  if (!parsed.success) return errors.validation(parsed.error.flatten());

  try {
    await setUserRole(id, parsed.data.role);
    return ok({ id, role: parsed.data.role });
  } catch {
    return errors.internal();
  }
}
