import { z } from 'zod';
import { auditMeta, bilingual, contentStatus } from './common';

export const compoundClass = z.enum([
  'alkaloid',
  'flavonoid',
  'tannin',
  'saponin',
  'glycoside',
  'terpenoid',
  'other',
]);
export type CompoundClass = z.infer<typeof compoundClass>;

export const bioactivity = z.object({
  effect: bilingual,
  evidenceLevel: z.enum(['anecdotal', 'preclinical', 'clinical']).default('anecdotal'),
  referenceIds: z.array(z.string()).default([]),
});

export const compound = z.object({
  id: z.string(),
  name: bilingual,
  class: compoundClass,
  formula: z.string().optional(),
  molecularWeight: z.number().positive().optional(),
  smiles: z.string().optional(),
  casNumber: z.string().optional(),
  bioactivity: z.array(bioactivity).default([]),
  plantIds: z.array(z.string()).default([]),
  diseaseIds: z.array(z.string()).default([]),
  status: contentStatus.default('draft'),
  audit: auditMeta,
});
export type Compound = z.infer<typeof compound>;

export const createCompoundInput = compound.omit({ id: true, audit: true, status: true });
export type CreateCompoundInput = z.infer<typeof createCompoundInput>;
