import { createPlantInput } from '@apri/schemas';
import { plantService } from '@apri/core';
import { ok, errors } from '@/lib/api';
import { requireCapability } from '@/lib/guard';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const plants = await plantService.list({
    query: searchParams.get('query') ?? undefined,
    family: searchParams.get('family') ?? undefined,
    limit: Number(searchParams.get('limit') ?? 20),
  });
  return ok(plants, { count: plants.length });
}

export async function POST(req: Request) {
  const user = await requireCapability('content:submit');
  if (!user) return errors.forbidden();

  const parsed = createPlantInput.safeParse(await req.json());
  if (!parsed.success) return errors.validation(parsed.error.flatten());

  const plant = await plantService.create(parsed.data, user.uid);
  return ok(plant, undefined, { status: 201 });
}
