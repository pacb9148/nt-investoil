'use client';

import React, { useState, useEffect } from 'react';
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
  Flame,
  Fuel,
  Droplet,
  Plane,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SERVICES_LIST } from '@/lib/constants/investoil';
import { useLanguage } from '@/lib/i18n/language-context';
import type { ServiceItem } from '@/types';

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
  Flame,
  Fuel,
  Droplet,
  Plane,
  Layers,
};

export function ServicesSection() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceItem[]>(SERVICES_LIST);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_services');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
        }
      }
    } catch {}

    fetch('/api/content/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          try {
            localStorage.setItem('investoil_services', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ServiceItem[]>;
      if (Array.isArray(customEvent.detail)) {
        setServices(customEvent.detail);
      }
    };

    window.addEventListener('investoil_services_updated', handleUpdate);
    return () => window.removeEventListener('investoil_services_updated', handleUpdate);
  }, []);

  const allTags = Array.from(new Set(services.flatMap((s) => s.tags || [])));

  const filteredServices = selectedTag
    ? services.filter((s) => s.tags?.includes(selectedTag))
    : services;

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
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                selectedTag === null
                  ? 'bg-accent text-bg border-accent font-bold'
                  : 'bg-card text-text-muted border-border hover:border-accent/40'
              }`}
            >
              Todos ({services.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 text-xs font-mono rounded-full border transition-all ${
                  selectedTag === tag
                    ? 'bg-accent text-bg border-accent font-bold'
                    : 'bg-card text-text-muted border-border hover:border-accent/40'
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
            const Icon = iconMap[service.iconName] || Sparkles;
            return (
              <Card
                key={service.code}
                className="group relative overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-glow-accent/20 flex flex-col justify-between"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                      {service.code}
                    </span>
                    <div className="p-2.5 rounded-lg bg-surf border border-border group-hover:border-accent/40 group-hover:text-accent transition-colors">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <CardTitle className="font-heading font-bold text-lg text-text group-hover:text-accent transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-text-muted leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {service.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surf/80 border border-border/60 text-text-subtle"
                      >
                        {tag}
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
