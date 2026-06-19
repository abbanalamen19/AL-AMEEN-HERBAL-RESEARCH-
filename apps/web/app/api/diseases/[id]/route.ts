import { diseaseService } from '@apri/core';
import { ok, errors } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const disease = await diseaseService.get(id);
  if (!disease) return errors.notFound('Disease');
  return ok(disease);
}
