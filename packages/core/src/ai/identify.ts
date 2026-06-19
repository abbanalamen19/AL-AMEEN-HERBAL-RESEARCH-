import { type IdentifyResult, identifyResult } from '@apri/schemas';
import { SEED_PLANTS } from '../data/seed';
import { generateFromImage } from './gemini';
import { VISION_IDENTIFY_PROMPT } from './prompts';

/** Identify a plant from an image and cross-link to the catalogue. */
export async function identifyPlant(
  imageBase64: string,
  mimeType: string,
): Promise<IdentifyResult> {
  const raw = await generateFromImage(VISION_IDENTIFY_PROMPT, imageBase64, mimeType);
  const parsed = safeParse(raw);
  const result = identifyResult.parse(parsed);

  const match = SEED_PLANTS.find(
    (p) => p.scientificName.toLowerCase() === result.scientificName.toLowerCase(),
  );
  return { ...result, matchedPlantId: match?.id };
}

function safeParse(raw: string): unknown {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return { name: 'Unknown', scientificName: '', confidence: 0, similar: [] };
  }
}
