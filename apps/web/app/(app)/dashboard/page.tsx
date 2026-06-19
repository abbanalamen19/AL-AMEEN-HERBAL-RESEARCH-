import Link from 'next/link';
import { plantService, diseaseService } from '@apri/core';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default async function DashboardPage() {
  const [plants, diseases] = await Promise.all([
    plantService.list({ limit: 6 }),
    diseaseService.list(6),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Barka da zuwa APRI</h1>
        <p className="text-muted-foreground">{t.tagline}</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/identify"
          className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t.identify}
        </Link>
        <Link
          href="/explorer"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
        >
          {t.explorer}
        </Link>
        <Link
          href="/research"
          className="inline-flex h-10 items-center rounded-md border border-input px-4 text-sm font-medium hover:bg-accent"
        >
          {t.askAi}
        </Link>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t.plants}</h2>
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
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">{t.diseases}</h2>
        <div className="flex flex-wrap gap-2">
          {diseases.map((d) => (
            <Link key={d.id} href={`/diseases/${d.id}`}>
              <Badge variant="secondary">{d.name.ha}</Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
