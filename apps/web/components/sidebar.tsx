'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@apri/ui';
import { dict, DEFAULT_LOCALE } from '@/lib/i18n';

const t = dict[DEFAULT_LOCALE];

const NAV = [
  { href: '/dashboard', label: t.dashboard },
  { href: '/explorer', label: t.explorer },
  { href: '/identify', label: t.identify },
  { href: '/diseases', label: t.diseases },
  { href: '/research', label: t.research },
  { href: '/market', label: t.market },
  { href: '/museum', label: t.museum },
  { href: '/settings', label: t.settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 border-r bg-muted/30 p-4 md:block">
      <div className="mb-6 px-2">
        <div className="text-2xl font-bold text-primary">APRI</div>
        <div className="text-xs text-muted-foreground">{t.tagline}</div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
