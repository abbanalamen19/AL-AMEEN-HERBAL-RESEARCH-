import { z } from 'zod';

/** Standard API envelope: { data } on success, { error } on failure. */
export const apiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof apiError>;

export type ApiResponse<T> = { data: T; meta?: Record<string, unknown> } | { error: ApiError };

export const APRI_ERROR = {
  UNAUTHENTICATED: 'APRI-0001',
  FORBIDDEN: 'APRI-0002',
  NOT_FOUND: 'APRI-0003',
  VALIDATION: 'APRI-0004',
  RATE_LIMITED: 'APRI-0005',
  INTERNAL: 'APRI-0500',
} as const;
