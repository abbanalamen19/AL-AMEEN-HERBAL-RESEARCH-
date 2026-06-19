import { describe, expect, it } from 'vitest';
import { ask } from './rag';

describe('RAG ask()', () => {
  it('returns grounded citations and a disclaimer for a plant question', async () => {
    const res = await ask({ question: 'Menene amfanin zogale?', locale: 'ha', topK: 3 });
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.answer).toContain('TSINKAYA');
    expect(res.locale).toBe('ha');
  });

  it('ranks the most relevant source first', async () => {
    const res = await ask({ question: 'malaria neem fever', locale: 'en', topK: 5 });
    expect(res.citations[0]?.score).toBeGreaterThanOrEqual(res.citations[1]?.score ?? 0);
  });
});
