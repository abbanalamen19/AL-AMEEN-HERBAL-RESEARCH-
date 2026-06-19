import { plantService } from '@apri/core';
import { ok, errors } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plant = await plantService.get(id);
  if (!plant) return errors.notFound('Plant');
  return ok(plant);
}
