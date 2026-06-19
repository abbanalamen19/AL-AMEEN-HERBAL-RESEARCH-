export type Locale = 'ha' | 'en';

export const DEFAULT_LOCALE: Locale = 'ha';

/** Minimal UI dictionary. Hausa-first; English fallback. */
export const dict = {
  ha: {
    appName: 'APRI',
    tagline: 'Bincike kan tsirrai masu magani na Arewa',
    dashboard: 'Allon baiwa',
    explorer: 'Binciken tsirrai',
    identify: 'Gano tsiro',
    diseases: 'Cututtuka',
    pharmacopoeia: 'Magunguna',
    research: 'Cibiyar bincike',
    market: 'Kasuwa',
    museum: 'Gidan tarihi',
    settings: 'Saituna',
    askAi: 'Tambayi AI',
    search: 'Bincika',
    plants: 'Tsirrai',
    uses: 'Amfani',
    family: 'Iyali',
  },
  en: {
    appName: 'APRI',
    tagline: 'Arewa medicinal plant research intelligence',
    dashboard: 'Dashboard',
    explorer: 'Plant Explorer',
    identify: 'Identify Plant',
    diseases: 'Diseases',
    pharmacopoeia: 'Pharmacopoeia',
    research: 'Research Center',
    market: 'Market',
    museum: 'Museum',
    settings: 'Settings',
    askAi: 'Ask AI',
    search: 'Search',
    plants: 'Plants',
    uses: 'Uses',
    family: 'Family',
  },
} as const;

export function t(locale: Locale, key: keyof typeof dict['ha']): string {
  return dict[locale][key] ?? dict.en[key];
}
