import { Card, CardContent, CardHeader, CardTitle } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default function MuseumPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.museum}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Gidan tarihi (Phase 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Module 19 — Digital Museum: historical knowledge, herbal heritage and cultural
            archives with media-rich narrative timelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
