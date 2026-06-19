import { z } from 'zod';
import { auditMeta, bilingual, contentStatus } from './common';

export const disease = z.object({
  id: z.string(),
  name: bilingual,
  category: z.string().optional(),
  icd11Code: z.string().optional(),
  description: bilingual.optional(),
  symptoms: z.array(bilingual).default([]),
  riskFactors: z.array(bilingual).default([]),
  prevention: z.array(bilingual).default([]),
  relatedPlantIds: z.array(z.string()).default([]),
  relatedCompoundIds: z.array(z.string()).default([]),
  /** Disease content must always render a non-diagnosis disclaimer. */
  disclaimerRequired: z.literal(true).default(true),
  status: contentStatus.default('draft'),
  audit: auditMeta,
});
export type Disease = z.infer<typeof disease>;

export const createDiseaseInput = disease.omit({ id: true, audit: true, status: true });
export type CreateDiseaseInput = z.infer<typeof createDiseaseInput>;
