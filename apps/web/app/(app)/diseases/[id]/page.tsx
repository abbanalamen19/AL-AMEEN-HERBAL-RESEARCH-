import { notFound } from 'next/navigation';
import { diseaseService } from '@apri/core';
import { Card, CardContent, CardHeader, CardTitle, DisclaimerBanner } from '@apri/ui';

export default async function DiseaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const disease = await diseaseService.get(id);
  if (!disease) notFound();

  const section = (title: string, items: { ha: string; en: string }[]) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-inside list-disc space-y-1">
          {items.map((it, i) => (
            <li key={i}>{it.ha}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{disease.name.ha}</h1>
        <p className="text-lg text-muted-foreground">{disease.name.en}</p>
      </header>

      <DisclaimerBanner locale="ha" />

      {disease.description && <p>{disease.description.ha}</p>}
      {section('Alamomi', disease.symptoms)}
      {section('Abubuwan haɗari', disease.riskFactors)}
      {section('Rigakafi', disease.prevention)}
    </div>
  );
}
