'use client';

import { useState } from 'react';
import type { AskResponse } from '@apri/schemas';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default function ResearchPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function onAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer(null);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, locale: 'ha' }),
      });
      const json = await res.json();
      if (json.data) setAnswer(json.data as AskResponse);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.research}</h1>
        <p className="text-muted-foreground">{t.askAi}</p>
      </header>

      <form onSubmit={onAsk} className="flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Menene amfanin zogale?"
          className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? '...' : t.askAi}
        </button>
      </form>

      {answer && (
        <Card>
          <CardHeader>
            <CardTitle>Amsa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap">{answer.answer}</p>
            <div className="flex flex-wrap gap-2">
              {answer.citations.map((c) => (
                <Badge key={`${c.sourceType}-${c.sourceId}`} variant="secondary">
                  {c.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
