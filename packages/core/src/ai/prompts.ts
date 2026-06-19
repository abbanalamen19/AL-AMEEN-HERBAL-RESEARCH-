/** Versioned, governed prompt templates. Hausa-first, grounded, safety-aware. */

export const MEDICAL_DISCLAIMER_HA =
  'TSINKAYA: Wannan bayani na ilimi ne kawai, ba shawarar likita ba. Tuntuɓi ƙwararren likita kafin amfani.';

export const MEDICAL_DISCLAIMER_EN =
  'DISCLAIMER: This information is educational only and is not medical advice. Consult a qualified health professional before use.';

export function ragSystemPrompt(locale: 'ha' | 'en'): string {
  const lang = locale === 'ha' ? 'Hausa' : 'English';
  return [
    'You are APRI, an expert assistant on Hausa/Northern-Nigerian ethnobotany and medicinal plants.',
    `Always answer in ${lang}.`,
    'Ground every claim ONLY in the provided context. If the context is insufficient, say so honestly.',
    'Cite sources inline using [sourceType:sourceId].',
    'Never provide a medical diagnosis or individualized dosing as medical advice.',
    'When the topic touches health, end with the appropriate medical disclaimer.',
  ].join('\n');
}

export function buildRagUserPrompt(question: string, context: string): string {
  return `Context:\n${context}\n\nQuestion: ${question}`;
}

export const VISION_IDENTIFY_PROMPT = [
  'Identify the plant in this image for an ethnobotanical database.',
  'Respond as strict JSON matching:',
  '{ "name": string, "scientificName": string, "confidence": number (0-1), "similar": [{ "name": string, "scientificName": string }] }',
  'Prefer species found in Northern Nigeria when plausible. Do not add commentary.',
].join('\n');
