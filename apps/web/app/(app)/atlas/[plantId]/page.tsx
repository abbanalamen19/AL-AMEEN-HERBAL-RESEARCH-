import { notFound } from 'next/navigation';
import Link from 'next/link';
import { plantService } from '@apri/core';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ plantId: string }>;
}) {
  const { plantId } = await params;
  const plant = await plantService.get(plantId);
  if (!plant) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{plant.name.ha}</h1>
          <Badge variant="accent">{plant.family}</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{plant.name.en}</p>
        <p className="italic text-muted-foreground">{plant.scientificName}</p>
      </header>

      {plant.description && (
        <Card>
          <CardHeader>
            <CardTitle>Bayani</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{plant.description.ha}</p>
            <p className="text-sm text-muted-foreground">{plant.description.en}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t.uses}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1">
            {plant.localUses.map((u, i) => (
              <li key={i}>
                {u.use.ha}
                {u.partUsed ? ` (${u.partUsed})` : ''}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Link href="/research" className="text-sm font-medium text-primary underline">
        {t.askAi} →
      </Link>
    </div>
  );
}
