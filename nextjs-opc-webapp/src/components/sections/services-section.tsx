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
import { useLanguage } from '@/lib/i18n/language-context';

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
  const { t } = useLanguage();
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
          <Badge variant="accent">{t.services.tag}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {t.services.title}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            {t.services.subtitle}
          </p>

          {/* Tag Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                selectedTag === null
                  ? 'bg-accent text-bg font-bold shadow-glow-accent'
                  : 'bg-card text-text-muted hover:text-text hover:bg-surf border border-border/60'
              }`}
            >
              {t.services.viewAll}
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider transition-all ${
                  selectedTag === tag
                    ? 'bg-accent text-bg font-bold shadow-glow-accent'
                    : 'bg-card text-text-muted hover:text-text hover:bg-surf border border-border/60'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid (10 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => {
            const Icon = iconMap[service.iconName] || Network;

            return (
              <Card
                key={service.code}
                className="group hover:border-accent/40 hover:shadow-glow-accent/20 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-bg transition-colors duration-200">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs text-text-subtle">
                        {service.code}
                      </span>
                    </div>

                    <CardTitle className="text-xl group-hover:text-accent transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-text-muted leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      {service.tags.map((tag) => (
                        <div key={tag} className="flex items-center gap-2 text-xs text-text">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span>{tag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </div>

                <div className="p-6 pt-0">
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {service.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surf text-text-subtle border border-border/50"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
