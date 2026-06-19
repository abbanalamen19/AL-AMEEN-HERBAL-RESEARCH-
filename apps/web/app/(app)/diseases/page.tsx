import Link from 'next/link';
import { diseaseService } from '@apri/core';
import { Card, CardContent, CardHeader, CardTitle, DisclaimerBanner } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default async function DiseasesPage() {
  const diseases = await diseaseService.list(50);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{t.diseases}</h1>
      </header>
      <DisclaimerBanner locale="ha" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {diseases.map((d) => (
          <Link key={d.id} href={`/diseases/${d.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{d.name.ha}</CardTitle>
                <p className="text-sm text-muted-foreground">{d.name.en}</p>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{d.description?.ha}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
