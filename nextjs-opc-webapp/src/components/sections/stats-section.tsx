'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { translations } from '@/lib/i18n/translations';
import type { LandingStatsConfig } from '@/types/content';

/**
 * Franja de 4 cifras de impacto. Lo guardado en el backoffice (Estadísticas) manda; lo que no se haya
 * personalizado cae al texto original del diccionario de idiomas.
 */
export function StatsSection({ config, customBg }: { config?: Partial<LandingStatsConfig>; customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const dict = translations[isEn ? 'en' : 'es'].stats;

  const items = ([1, 2, 3, 4] as const).map((n) => {
    // Un campo guardado vacío se queda vacío; solo lo que nunca se personalizó usa el texto original.
    const value = config?.[`stat${n}_value`] ?? dict[`metric${n}Value`];
    const label = (isEn ? config?.[`stat${n}_label_en`] : config?.[`stat${n}_label`]) ?? dict[`metric${n}Label`];
    return { value, label };
  }).filter((item) => item.value || item.label);

  if (items.length === 0) return null;

  return (
    <section
      id="estadisticas"
      className="py-12 border-b border-border/60 transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item, i) => (
          <div key={i} className="text-center lg:text-left space-y-1.5">
            {item.value && <div className="font-heading font-extrabold text-3xl sm:text-4xl text-accent font-mono">{item.value}</div>}
            {item.label && <div className="text-xs sm:text-sm text-text-muted leading-relaxed">{item.label}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
