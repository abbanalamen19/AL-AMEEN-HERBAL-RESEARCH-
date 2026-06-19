'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { IdentifyResult } from '@apri/schemas';
import { Card, CardContent, CardHeader, CardTitle, Badge, DisclaimerBanner } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default function IdentifyPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const dataUrl = await fileToDataUrl(file);
    setPreview(dataUrl);
    setLoading(true);
    try {
      const res = await fetch('/api/identify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ imageDataUrl: dataUrl }),
      });
      const json = await res.json();
      if (json.data) setResult(json.data as IdentifyResult);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.identify}</h1>
      </header>

      <input
        type="file"
        accept="image/*"
        onChange={onFile}
        className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground"
      />

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" className="max-h-64 rounded-md border object-contain" />
      )}

      {loading && <p className="text-sm text-muted-foreground">Ana gano tsiro...</p>}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>{result.name}</CardTitle>
            <p className="italic text-muted-foreground">{result.scientificName}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="accent">
              {Math.round(result.confidence * 100)}% confidence
            </Badge>
            {result.matchedPlantId && (
              <div>
                <Link
                  href={`/atlas/${result.matchedPlantId}`}
                  className="text-sm font-medium text-primary underline"
                >
                  Duba a Atlas →
                </Link>
              </div>
            )}
            <DisclaimerBanner locale="ha" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
