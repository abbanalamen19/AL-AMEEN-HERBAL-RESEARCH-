import { z } from 'zod';
import { locale } from './common';

export const askInput = z.object({
  question: z.string().min(2).max(2000),
  locale: locale.default('ha'),
  topK: z.number().int().min(1).max(20).default(8),
  filterSourceType: z.enum(['plant', 'disease', 'compound', 'monograph', 'reference']).optional(),
});
export type AskInput = z.infer<typeof askInput>;

export const citation = z.object({
  sourceType: z.string(),
  sourceId: z.string(),
  title: z.string(),
  score: z.number(),
});
export type Citation = z.infer<typeof citation>;

export const askResponse = z.object({
  answer: z.string(),
  citations: z.array(citation),
  locale,
});
export type AskResponse = z.infer<typeof askResponse>;

export const identifyResult = z.object({
  name: z.string(),
  scientificName: z.string(),
  confidence: z.number().min(0).max(1),
  similar: z.array(z.object({ name: z.string(), scientificName: z.string() })).default([]),
  matchedPlantId: z.string().optional(),
});
export type IdentifyResult = z.infer<typeof identifyResult>;
