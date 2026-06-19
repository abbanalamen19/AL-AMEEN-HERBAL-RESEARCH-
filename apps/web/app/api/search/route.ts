import { plantService } from '@apri/core';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

/** Unified search entrypoint (MVP: plant keyword search; expands to semantic later). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') ?? '';
  const plants = await plantService.list({ query, limit: 20 });
  return ok({ plants }, { query });
}
