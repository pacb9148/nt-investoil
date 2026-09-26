'use client';

import React, { useState, useEffect } from 'react';
import { Award, Calendar, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FEATURED_OPERATIONS } from '@/lib/constants/investoil';
import type { FeaturedOperation } from '@/types';
import { useLanguage } from '@/lib/i18n/language-context';
import { OPERATIONS_EN, localized } from '@/lib/i18n/content-en';

export function ProjectsSection({ customBg }: { customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [ops, setOps] = useState<FeaturedOperation[]>(FEATURED_OPERATIONS);

  useEffect(() => {

    fetch('/api/content/operations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOps(data);
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FeaturedOperation[]>;
      if (Array.isArray(customEvent.detail)) {
        setOps(customEvent.detail);
      }
    };

    window.addEventListener('investoil_operations_updated', handleUpdate);
    return () => window.removeEventListener('investoil_operations_updated', handleUpdate);
  }, []);

  return (
    <section
      id="plataforma"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="accent">{isEn ? 'PROVEN TRACK RECORD' : 'HISTORIAL COMPROBADO'}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {isEn ? 'Featured Operations' : 'Operaciones Destacadas'}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            {isEn
              ? 'A sample of recent transactions that show our logistics execution capacity, financial strength and strict compliance.'
              : 'Una muestra de transacciones recientes que demuestran nuestra capacidad de ejecución logística, solidez financiera y cumplimiento estricto.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ops.map((op, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden group hover:border-accent/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent to-warm opacity-70 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>{isEn ? 'Year' : 'Año'} {op.year}</span>
                  </span>
                  <span className="font-mono text-xs text-text-muted flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-warm" />
                    <span>{localized(op, 'client', isEn, OPERATIONS_EN, (op as { id?: string }).id)}</span>
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">
                  {localized(op, 'title', isEn, OPERATIONS_EN, (op as { id?: string }).id)}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-sm text-text-muted leading-relaxed">
                  {localized(op, 'description', isEn, OPERATIONS_EN, (op as { id?: string }).id)}
                </p>

                <div className="p-3 rounded-lg bg-surf/80 border border-border/80 flex items-center gap-3 mt-4">
                  <Award className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-text-subtle font-mono">
                      {isEn ? 'Verified result' : 'Resultado verificado'}
                    </div>
                    <div className="text-sm font-semibold text-text">
                      {localized(op, 'result', isEn, OPERATIONS_EN, (op as { id?: string }).id)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
