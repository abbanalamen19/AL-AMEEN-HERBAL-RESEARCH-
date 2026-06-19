import { Card, CardContent, CardHeader, CardTitle } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{t.settings}</h1>
      <Card>
        <CardHeader>
          <CardTitle>Harshe / Language</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Default locale: <strong>Hausa (ha)</strong>. Language switching, theme, offline cache
            controls and account/MFA settings are wired in the foundation phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
