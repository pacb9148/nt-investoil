'use client';

import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SERVICES_LIST } from '@/lib/constants/investoil';
import { useLanguage } from '@/lib/i18n/language-context';
import { localized } from '@/lib/i18n/content-en';
import type { ServiceItem } from '@/types';

function resolveIcon(name: string): React.ElementType {
  const found = (Icons as unknown as Record<string, React.ElementType>)[name];
  return found || CheckCircle2;
}

export function ServicesSection({ customBg }: { customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [services, setServices] = useState<ServiceItem[]>(SERVICES_LIST);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setServices(data);
      })
      .catch(() => {});
  }, []);

  const allTags = Array.from(new Set(services.flatMap((s) => s.tags || [])));
  const filteredServices = selectedTag ? services.filter((s) => (s.tags || []).includes(selectedTag)) : services;

  return (
    <section
      id="services"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="accent">{isEn ? 'OPERATIONAL CAPABILITIES' : 'CAPACIDADES OPERATIVAS'}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {isEn ? 'Our Services' : 'Nuestros Servicios'}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            {isEn
              ? 'We connect buyers and sellers of crude and derivatives, ensuring fair and efficient transactions at every link of the supply chain.'
              : 'Conectamos compradores y vendedores de crudo y derivados, garantizando transacciones justas y eficientes en cada eslabón de la cadena de suministro.'}
          </p>

          {allTags.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium font-mono transition-colors ${
                  selectedTag === null
                    ? 'bg-accent text-bg font-semibold shadow-glow-accent'
                    : 'bg-surf text-text-muted hover:text-text border border-border'
                }`}
              >
                {isEn ? 'All' : 'Todos'} ({services.length})
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium font-mono transition-colors ${
                    selectedTag === tag
                      ? 'bg-accent text-bg font-semibold shadow-glow-accent'
                      : 'bg-surf text-text-muted hover:text-text border border-border'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const IconComponent = resolveIcon(service.iconName);
            const title = localized(service, 'title', isEn, {}, service.code);
            const description = localized(service, 'description', isEn, {}, service.code);

            return (
              <Card
                key={service.code}
                className="group relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:border-accent/60 hover:shadow-glow-accent"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-full pointer-events-none group-hover:bg-accent/10 transition-colors" />

                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent tracking-wider bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {service.code}
                    </span>
                    <div className="p-2 rounded-lg bg-surf border border-border/60 text-accent group-hover:text-neon group-hover:border-neon/40 transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <CardTitle className="text-lg group-hover:text-accent transition-colors">{title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-text-muted leading-relaxed">{description}</p>

                  {service.tags && service.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {service.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono text-text-subtle bg-surf/80 px-2 py-0.5 rounded border border-border/50"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
