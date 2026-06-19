import { isAiConfigured, isFirebaseConfigured } from '@apri/core';
import { ok } from '@/lib/api';

export const dynamic = 'force-dynamic';

export function GET() {
  return ok({
    status: 'ok',
    firebaseConfigured: isFirebaseConfigured(),
    aiConfigured: isAiConfigured(),
    time: new Date().toISOString(),
  });
}
