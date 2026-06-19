export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    name: 'APRI — Arewa Plant Research Intelligence',
    short_name: 'APRI',
    description: 'Hausa-first medicinal plant & ethnobotany platform',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1B5E20',
    lang: 'ha',
    icons: [],
  });
}
