import { APRI_ERROR, type ApiError } from '@apri/schemas';
import { NextResponse } from 'next/server';

export function ok<T>(data: T, meta?: Record<string, unknown>, init?: ResponseInit) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, init);
}

export function fail(code: string, message: string, status: number, details?: unknown) {
  const error: ApiError = { code, message, ...(details ? { details } : {}) };
  return NextResponse.json({ error }, { status });
}

export const errors = {
  unauthenticated: () => fail(APRI_ERROR.UNAUTHENTICATED, 'Authentication required', 401),
  forbidden: () => fail(APRI_ERROR.FORBIDDEN, 'Insufficient permissions', 403),
  notFound: (what = 'Resource') => fail(APRI_ERROR.NOT_FOUND, `${what} not found`, 404),
  validation: (details: unknown) => fail(APRI_ERROR.VALIDATION, 'Invalid request', 422, details),
  internal: () => fail(APRI_ERROR.INTERNAL, 'Internal server error', 500),
};
