'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Plant } from '@apri/schemas';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default function ExplorerPage() {
  const [query, setQuery] = useState('');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const url = query ? `/api/plants?query=${encodeURIComponent(query)}` : '/api/plants';
    fetch(url, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((res) => setPlants(res.data ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [query]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.explorer}</h1>
      </header>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`${t.search}: zogale, moringa, malaria...`}
        className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      {loading && <p className="text-sm text-muted-foreground">...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plants.map((p) => (
          <Link key={p.id} href={`/atlas/${p.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{p.name.ha}</CardTitle>
                  <Badge variant="accent">{p.family}</Badge>
                </div>
                <p className="text-sm italic text-muted-foreground">{p.scientificName}</p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.description?.ha}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!loading && plants.length === 0 && (
        <p className="text-sm text-muted-foreground">Babu sakamako.</p>
      )}
    </div>
  );
}
