import { diseaseService } from '@apri/core';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const diseases = await diseaseService.list(Number(searchParams.get('limit') ?? 20));
  return ok(diseases, { count: diseases.length });
}
