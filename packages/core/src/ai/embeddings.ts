import { isAiConfigured, serverEnv } from '../env';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const EMBED_MODEL = 'text-embedding-004';
export const EMBEDDING_DIM = 768;

/**
 * Produce an embedding vector for `text`. Falls back to a deterministic
 * hash-based pseudo-embedding when AI is unconfigured, so semantic search
 * code paths remain testable offline.
 */
export async function embedText(text: string): Promise<number[]> {
  if (!isAiConfigured() || !serverEnv.geminiApiKey) {
    return pseudoEmbedding(text);
  }

  const res = await fetch(
    `${GEMINI_BASE}/models/${EMBED_MODEL}:embedContent?key=${serverEnv.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text }] },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Embedding error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { embedding?: { values?: number[] } };
  return json.embedding?.values ?? pseudoEmbedding(text);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Deterministic fallback embedding (token-hash bag). Not for production ranking. */
function pseudoEmbedding(text: string): number[] {
  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);
  for (const tok of tokens) {
    let h = 0;
    for (let i = 0; i < tok.length; i += 1) {
      h = (h * 31 + tok.charCodeAt(i)) >>> 0;
    }
    const idx = h % EMBEDDING_DIM;
    vec[idx] = (vec[idx] ?? 0) + 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}
