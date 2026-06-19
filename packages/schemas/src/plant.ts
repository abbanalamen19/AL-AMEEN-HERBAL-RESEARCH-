import { z } from 'zod';
import { auditMeta, bilingual, contentStatus, geoPoint } from './common';

export const distributionEntry = z.object({
  region: z.string(),
  point: geoPoint.optional(),
  source: z.string().optional(),
});

export const localUse = z.object({
  use: bilingual,
  preparation: bilingual.optional(),
  partUsed: z.string().optional(),
  source: z.string().optional(),
});

export const conservationStatus = z.enum([
  'least_concern',
  'near_threatened',
  'vulnerable',
  'endangered',
  'critically_endangered',
  'data_deficient',
  'unknown',
]);

export const plant = z.object({
  id: z.string(),
  name: bilingual,
  scientificName: z.string().min(1),
  family: z.string().min(1),
  genus: z.string().optional(),
  synonyms: z.array(z.string()).default([]),
  habitat: bilingual.optional(),
  distribution: z.array(distributionEntry).default([]),
  description: bilingual.optional(),
  localUses: z.array(localUse).default([]),
  conservationStatus: conservationStatus.default('unknown'),
  compoundIds: z.array(z.string()).default([]),
  diseaseIds: z.array(z.string()).default([]),
  imageIds: z.array(z.string()).default([]),
  searchKeywords: z.array(z.string()).default([]),
  embeddingId: z.string().optional(),
  status: contentStatus.default('draft'),
  audit: auditMeta,
});
export type Plant = z.infer<typeof plant>;

/** Input shape accepted by POST /api/plants (audit/id/status assigned server-side). */
export const createPlantInput = plant
  .omit({ id: true, audit: true, searchKeywords: true, embeddingId: true, status: true })
  .extend({ status: contentStatus.default('draft') });
export type CreatePlantInput = z.infer<typeof createPlantInput>;

export const updatePlantInput = createPlantInput.partial();
export type UpdatePlantInput = z.infer<typeof updatePlantInput>;
