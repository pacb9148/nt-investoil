'use client';

import React, { useState } from 'react';
import {
  Network,
  FileText,
  Ship,
  ShieldCheck,
  Eye,
  Users,
  Anchor,
  TrendingUp,
  Scale,
  LifeBuoy,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SERVICES_LIST } from '@/lib/constants/investoil';

const iconMap: Record<string, React.ElementType> = {
  Network,
  FileText,
  Ship,
  ShieldCheck,
  Eye,
  Users,
  Anchor,
  TrendingUp,
  Scale,
  LifeBuoy,
};

export function ServicesSection() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Collect all unique tags
  const allTags = Array.from(new Set(SERVICES_LIST.flatMap((s) => s.tags)));

  const filteredServices = selectedTag
    ? SERVICES_LIST.filter((s) => s.tags.includes(selectedTag))
    : SERVICES_LIST;

  return (
    <section id="services" className="py-24 border-t border-border bg-bg relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <Badge variant="accent">CAPACIDADES OPERATIVAS</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Nuestro Servicio
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Conectamos compradores y vendedores de crudo, garantizando transacciones justas y eficientes en cada eslabón de la cadena de suministro.
          </p>

          {/* Tag Filter Pills */}
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
              Todos (10)
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
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const IconComponent = iconMap[service.iconName] || CheckCircle2;

            return (
              <Card
                key={service.code}
                className="group relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:border-accent/60 hover:shadow-glow-accent"
              >
                {/* Accent glow corner */}
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

                  <CardTitle className="text-lg group-hover:text-accent transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-text-muted leading-relaxed">
                    {service.description}
                  </p>

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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
