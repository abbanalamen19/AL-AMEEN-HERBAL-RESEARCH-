import type { AskInput, AskResponse, Citation } from '@apri/schemas';
import { SEED_DISEASES, SEED_PLANTS } from '../data/seed';
import { cosineSimilarity, embedText } from './embeddings';
import { generateText } from './gemini';
import {
  MEDICAL_DISCLAIMER_EN,
  MEDICAL_DISCLAIMER_HA,
  buildRagUserPrompt,
  ragSystemPrompt,
} from './prompts';

interface KnowledgeChunk {
  sourceType: string;
  sourceId: string;
  title: string;
  text: string;
}

/** Build a retrievable corpus from seed knowledge (MVP). */
function corpus(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  for (const p of SEED_PLANTS) {
    chunks.push({
      sourceType: 'plant',
      sourceId: p.id,
      title: `${p.name.ha} (${p.scientificName})`,
      text: [
        p.name.ha,
        p.name.en,
        p.scientificName,
        p.description?.ha,
        p.description?.en,
        ...p.localUses.map((u) => `${u.use.ha} ${u.use.en}`),
      ]
        .filter(Boolean)
        .join('. '),
    });
  }
  for (const d of SEED_DISEASES) {
    chunks.push({
      sourceType: 'disease',
      sourceId: d.id,
      title: `${d.name.ha} (${d.name.en})`,
      text: [d.name.ha, d.name.en, d.description?.ha, d.description?.en]
        .filter(Boolean)
        .join('. '),
    });
  }
  return chunks;
}

/** Retrieval-augmented Q&A over the knowledge base. */
export async function ask(input: AskInput): Promise<AskResponse> {
  const chunks = corpus().filter(
    (c) => !input.filterSourceType || c.sourceType === input.filterSourceType,
  );

  const queryVec = await embedText(input.question);
  const scored = await Promise.all(
    chunks.map(async (c) => ({
      chunk: c,
      score: cosineSimilarity(queryVec, await embedText(c.text)),
    })),
  );

  const top = scored.sort((a, b) => b.score - a.score).slice(0, input.topK);
  const context = top
    .map((t) => `[${t.chunk.sourceType}:${t.chunk.sourceId}] ${t.chunk.title}: ${t.chunk.text}`)
    .join('\n');

  const answer = await generateText(
    ragSystemPrompt(input.locale),
    buildRagUserPrompt(input.question, context),
  );

  const disclaimer = input.locale === 'ha' ? MEDICAL_DISCLAIMER_HA : MEDICAL_DISCLAIMER_EN;
  const citations: Citation[] = top.map((t) => ({
    sourceType: t.chunk.sourceType,
    sourceId: t.chunk.sourceId,
    title: t.chunk.title,
    score: Number(t.score.toFixed(4)),
  }));

  return {
    answer: `${answer}\n\n${disclaimer}`,
    citations,
    locale: input.locale,
  };
}
