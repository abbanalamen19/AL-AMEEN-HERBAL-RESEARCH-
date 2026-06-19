import { isAiConfigured, serverEnv } from '../env';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const TEXT_MODEL = 'gemini-1.5-flash';

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType: string; data: string };
}

/**
 * Minimal Gemini text generation via the public Generative Language API.
 * Returns a deterministic stub when no API key is configured so the app
 * remains runnable in placeholder mode.
 */
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (!isAiConfigured() || !serverEnv.geminiApiKey) {
    return `[AI not configured] ${userPrompt.slice(0, 280)}`;
  }

  const res = await fetch(
    `${GEMINI_BASE}/models/${TEXT_MODEL}:generateContent?key=${serverEnv.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] } }[];
  };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}

/** Vision call returning raw model text (expected JSON). */
export async function generateFromImage(
  prompt: string,
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  if (!isAiConfigured() || !serverEnv.geminiApiKey) {
    return JSON.stringify({
      name: 'Unknown (AI not configured)',
      scientificName: '',
      confidence: 0,
      similar: [],
    });
  }

  const res = await fetch(
    `${GEMINI_BASE}/models/${TEXT_MODEL}:generateContent?key=${serverEnv.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }, { inlineData: { mimeType, data: imageBase64 } }],
          },
        ],
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini vision error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: GeminiPart[] } }[];
  };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
}
