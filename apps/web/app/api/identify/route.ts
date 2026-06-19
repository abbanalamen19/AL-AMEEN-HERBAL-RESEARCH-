import { z } from 'zod';
import { ai } from '@apri/core';
import { ok, errors } from '@/lib/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const body = z.object({
  imageDataUrl: z.string().startsWith('data:'),
});

export async function POST(req: Request) {
  const parsed = body.safeParse(await req.json());
  if (!parsed.success) return errors.validation(parsed.error.flatten());

  const match = /^data:(.+?);base64,(.*)$/.exec(parsed.data.imageDataUrl);
  if (!match) return errors.validation({ image: 'Expected a base64 data URL' });
  const mimeType = match[1]!;
  const base64 = match[2]!;

  try {
    const result = await ai.identifyPlant(base64, mimeType);
    return ok(result);
  } catch {
    return errors.internal();
  }
}
