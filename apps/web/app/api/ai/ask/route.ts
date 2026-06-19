import { askInput } from '@apri/schemas';
import { ai } from '@apri/core';
import { ok, errors } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: Request) {
  const parsed = askInput.safeParse(await req.json());
  if (!parsed.success) return errors.validation(parsed.error.flatten());

  try {
    const response = await ai.ask(parsed.data);
    return ok(response);
  } catch {
    return errors.internal();
  }
}
