import { z } from 'zod';

/** Bilingual text: Hausa-first, English secondary. */
export const bilingual = z.object({
  ha: z.string().min(1, 'Hausa text is required'),
  en: z.string().default(''),
});
export type Bilingual = z.infer<typeof bilingual>;

export const contentStatus = z.enum(['draft', 'review', 'published', 'archived']);
export type ContentStatus = z.infer<typeof contentStatus>;

export const locale = z.enum(['ha', 'en']);
export type Locale = z.infer<typeof locale>;

/** Audit metadata attached to every persisted document. */
export const auditMeta = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string(),
  updatedBy: z.string(),
  version: z.number().int().nonnegative().default(0),
});
export type AuditMeta = z.infer<typeof auditMeta>;

/** Cursor pagination params shared across list endpoints. */
export const paginationQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuery>;

export const geoPoint = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type GeoPoint = z.infer<typeof geoPoint>;
