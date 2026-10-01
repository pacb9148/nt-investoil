'use client';

import React from 'react';
import { ShieldCheck, Globe, Target, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n/language-context';
import { ABOUT_EN, ABOUT_ES_SEED } from '@/lib/i18n/about-en';
import { TiptapContent } from '@/components/blog/tiptap-content';

/**
 * Parte visual de Nosotros, separada del componente de servidor que trae los datos: el resto de la
 * web reacciona al instante al selector de idioma porque cada sección lee `useLanguage()` (contexto
 * de cliente); esta página renderizaba el idioma UNA vez en el servidor a partir de la cookie, así
 * que cambiar el selector no la actualizaba hasta recargar. Aquí sí se usa `useLanguage()`, igual
 * que el resto de secciones bilingües.
 */
export function AboutContent({ data }: { data: any }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const pick = (field: 'badge_text' | 'title' | 'slogan' | 'cta_text'): string => {
    const es = String(data?.[field] ?? '');
    if (!isEn) return es;
    const own = data?.[`${field}_en`];
    if (typeof own === 'string' && own.trim()) return own;
    return es.startsWith(ABOUT_ES_SEED[field]) ? ABOUT_EN[field] : es;
  };

  // La misión se edita con el mismo editor enriquecido del blog: puede ser un documento Tiptap
  // (objeto) o, en contenido antiguo sin editar todavía, una cadena de texto plano.
  const missionRaw = isEn ? data?.mission_en : data?.mission;
  const missionContent =
    missionRaw ||
    (isEn && typeof data?.mission === 'string' && data.mission.startsWith(ABOUT_ES_SEED.mission)
      ? ABOUT_EN.mission
      : isEn
      ? data?.mission
      : undefined);
  const featuredImage = (data?.featured_image || '').trim();

  return (
    <div className="pt-32 pb-24 space-y-24">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className={featuredImage ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 max-w-3xl space-y-6'}>
            <Badge variant="accent">{pick('badge_text') || (isEn ? 'IDENTITY & VALUES' : 'IDENTIDAD & VALORES')}</Badge>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-text leading-tight">
              {pick('title') || 'Invest Oil LLC'}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {pick('slogan')}
            </p>
            <div className="text-sm">
              <TiptapContent content={missionContent} legacyClassName="text-text-muted leading-relaxed" />
            </div>
            <div className="pt-2">
              <Button href={data?.cta_url || '/#contact'} variant="accent" size="lg" className="gap-2">
                <span>{pick('cta_text') || (isEn ? 'Contact management' : 'Contactar con la dirección')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {featuredImage ? (
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 p-6 rounded-2xl border border-amber-500/30 bg-card shadow-[0_0_40px_rgba(245,158,11,0.15)] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                <img
                  src={featuredImage}
                  alt={isEn ? 'Invest Oil LLC corporate identity' : 'Identidad Corporativa Invest Oil LLC'}
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)] transition-transform duration-300 hover:scale-105"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.pillars?.map((pillar: any, idx: number) => {
            const Icon = idx === 0 ? ShieldCheck : idx === 1 ? Globe : Target;
            const iconColorClass = idx === 0 ? 'bg-accent/15 border-accent/30 text-accent' : idx === 1 ? 'bg-warm/15 border-warm/30 text-warm' : 'bg-neon/15 border-neon/30 text-neon';

            return (
              <Card key={pillar.id || idx} className="p-8 space-y-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconColorClass}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl text-text">{isEn ? pillar.title_en || pillar.title : pillar.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {isEn ? pillar.desc_en || pillar.desc : pillar.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
