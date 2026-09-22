'use client';

import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';
import { LegalPageData } from '@/app/api/content/legales/route';

interface LegalPageViewProps {
  slug: string;
  initialData: LegalPageData;
}

export function LegalPageView({ slug, initialData }: LegalPageViewProps) {
  const [data, setData] = useState<LegalPageData>(initialData);

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

  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant={isFraudAlert ? 'danger' : 'accent'}>
          {data.badge || 'MARCO LEGAL'}
        </Badge>
        {data.lastUpdated && (
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-text-subtle">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>Última revisión: {data.lastUpdated}</span>
          </div>
        )}
      </div>

      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
        {data.title}
      </h1>

      <Card
        className={`p-8 max-w-none text-sm text-text-muted space-y-6 ${
          isFraudAlert ? 'border-rose-500/30' : ''
        }`}
      >
        {isFraudAlert && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="block text-sm font-bold text-rose-200">
                Advertencia Importante para Compradores y Vendedores
              </strong>
              <span>
                Invest Oil LLC nunca solicita anticipos de honorarios a cuentas bancarias personales ni opera fuera de los canales oficiales corporativos (@investoil.es).
              </span>
            </div>
          </div>
        )}

        {data.intro && (
          <p className="text-base text-text font-medium leading-relaxed pb-2 border-b border-border/60">
            {data.intro}
          </p>
        )}

        <div className="space-y-6">
          {data.sections?.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="text-lg font-bold text-text flex items-center gap-2">
                <span className="text-accent text-sm">§</span>
                <span>{section.title}</span>
              </h2>
              <div className="text-sm text-text-muted leading-relaxed whitespace-pre-line pl-4 border-l border-border/80">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
