import * as React from 'react';
import { cn } from './cn';

const TEXT = {
  ha: 'TSINKAYA: Wannan bayani na ilimi ne kawai, ba shawarar likita ba. Tuntuɓi ƙwararren likita kafin amfani.',
  en: 'DISCLAIMER: This information is educational only and is not medical advice. Consult a qualified health professional before use.',
};

export function DisclaimerBanner({
  locale = 'ha',
  className,
}: {
  locale?: 'ha' | 'en';
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        'rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900',
        className,
      )}
    >
      {TEXT[locale]}
    </div>
  );
}
