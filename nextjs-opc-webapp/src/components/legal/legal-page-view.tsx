'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar, ShieldCheck, Globe, Mail } from 'lucide-react';
import { LegalPageData } from '@/app/api/content/legales/route';

interface LegalPageViewProps {
  slug: string;
  initialData: LegalPageData;
}

export function LegalPageView({ slug, initialData }: LegalPageViewProps) {
  const [data, setData] = useState<LegalPageData>(initialData);
  const [lang, setLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    async function refreshData() {
      try {
        const res = await fetch(`/api/content/legales?slug=${slug}`);
        if (res.ok) {
          const fresh = await res.json();
          setData(fresh);
        }
      } catch (e) {
        // mantener initialData
      }
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail || customEvent.detail.slug === slug) {
        refreshData();
      }
    };

    window.addEventListener('investoil_legales_updated', handleUpdate);
    return () => {
      window.removeEventListener('investoil_legales_updated', handleUpdate);
    };
  }, [slug]);

  const isFraudAlert = slug === 'alerta-de-fraude-y-estafas';

  // Contenido dinámico según idioma seleccionado
  const currentBadge = lang === 'en' ? data.badge_en || data.badge : data.badge;
  const currentTitle = lang === 'en' ? data.title_en || data.title : data.title;
  const currentIntro = lang === 'en' ? data.intro_en || data.intro : data.intro;
  const currentSections =
    lang === 'en' && data.sections_en && data.sections_en.length > 0
      ? data.sections_en
      : data.sections;
  const currentHtml = lang === 'en' ? data.content_html_en || data.content_html : data.content_html;

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      {/* Barra superior de estado y selector de idioma */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Badge variant={isFraudAlert ? 'danger' : 'accent'}>
            {currentBadge || (lang === 'en' ? 'LEGAL FRAMEWORK' : 'MARCO LEGAL')}
          </Badge>
          {data.lastUpdated && (
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {lang === 'en' ? 'Last revised:' : 'Última revisión:'} {data.lastUpdated}
              </span>
            </div>
          )}
        </div>

        {/* Selector de Idioma Bilingüe ES / EN */}
        <div className="inline-flex items-center rounded-lg border border-amber-500/30 bg-zinc-900/90 p-1 text-xs font-mono shadow-sm">
          <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-2" />
          <button
            type="button"
            onClick={() => setLang('es')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold ${
              lang === 'es'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            aria-pressed={lang === 'es'}
          >
            ES (Español)
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold ${
              lang === 'en'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
            aria-pressed={lang === 'en'}
          >
            EN (English)
          </button>
        </div>
      </div>

      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-slate-100 dark:text-slate-100 tracking-tight leading-tight">
        {currentTitle}
      </h1>

      <Card
        className={`p-6 sm:p-8 max-w-none text-sm space-y-6 bg-zinc-950/80 border ${
          isFraudAlert ? 'border-rose-500/40 shadow-rose-950/20' : 'border-zinc-800 shadow-xl'
        }`}
      >
        {isFraudAlert && (
          <div className="p-4 sm:p-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1.5 leading-relaxed">
              <strong className="block text-sm font-bold text-rose-200">
                {lang === 'en'
                  ? 'Official Caution for Buyers, Refiners, and Traders'
                  : 'Advertencia Importante para Compradores, Refinerías y Traders'}
              </strong>
              <p className="text-rose-200/90 text-xs">
                {lang === 'en'
                  ? 'Invest Oil LLC never requests advance fee deposits to personal bank accounts nor operates outside official corporate domain channels (@investoil.es). Report any suspicious solicitation to info@investoil.es.'
                  : 'Invest Oil LLC nunca solicita anticipos de honorarios a cuentas bancarias personales ni opera fuera de los canales oficiales corporativos (@investoil.es). Reporte cualquier oferta sospechosa a info@investoil.es.'}
              </p>
            </div>
          </div>
        )}

        {currentIntro && (
          <p className="text-base text-slate-200 dark:text-slate-200 font-medium leading-relaxed pb-4 border-b border-zinc-800/80">
            {currentIntro}
          </p>
        )}

        {currentHtml ? (
          <div
            className="prose prose-invert prose-amber max-w-none text-slate-200 dark:text-slate-200 leading-relaxed text-sm space-y-4"
            dangerouslySetInnerHTML={{ __html: currentHtml }}
          />
        ) : (
          <div className="space-y-7">
            {currentSections?.map((section, idx) => (
              <div key={idx} className="space-y-2.5">
                <h2 className="text-lg font-bold text-slate-100 dark:text-slate-100 flex items-center gap-2">
                  <span className="text-amber-400 font-mono text-sm font-bold">§</span>
                  <span>{section.title}</span>
                </h2>
                <div className="text-sm text-slate-300 dark:text-slate-300 leading-relaxed whitespace-pre-line pl-4 border-l-2 border-amber-500/30 space-y-2">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer institucional de la página legal */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Invest Oil LLC · Delaware LLC · Compliance & Legal Department</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="mailto:info@investoil.es"
              className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>info@investoil.es</span>
            </a>
            <span>•</span>
            <a
              href="mailto:business@investoil.es"
              className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>business@investoil.es</span>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
