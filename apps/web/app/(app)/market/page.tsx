import { Card, CardContent, CardHeader, CardTitle } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.market}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Kasuwa (Phase 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Module 20 — Market Intelligence: herb prices, trends and supply chains. Scheduled
            ingestion + charts land in roadmap Phase 5.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
