'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { LandingCtaFinalConfig } from '@/types/content';

/** Cierre comercial de la landing: lo guardado en el backoffice manda; lo vacío usa el texto original del idioma. */
export function CtaFinalSection({ config, customBg }: { config?: Partial<LandingCtaFinalConfig>; customBg?: string }) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const pick = (es?: string, en?: string, fallback = '') => (isEn ? en : es) || fallback;

  const kicker = pick(config?.kicker, config?.kicker_en, t.cta.tag);
  const heading = pick(config?.heading, config?.heading_en, t.cta.title);
  const subheading = pick(config?.subheading, config?.subheading_en, t.cta.subtitle);
  const buttonText = pick(config?.button_text, config?.button_text_en, t.cta.button);
  const guarantee = pick(config?.guarantee_line, config?.guarantee_line_en, t.cta.guarantee);
  const buttonUrl = config?.button_url || '#contact';

  return (
    <section
      id="cta-final"
      className="py-20 border-t border-border/80 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(245,158,11,0.10),transparent_70%)]" />
      <div className="relative max-w-4xl mx-auto px-4 md:px-8 text-center space-y-6">
        <Badge variant="accent">{kicker}</Badge>
        <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text leading-tight">{heading}</h2>
        <p className="text-base text-text-muted leading-relaxed max-w-2xl mx-auto">{subheading}</p>
        <div className="pt-2">
          <Link
            href={buttonUrl}
            className={buttonVariants({ variant: 'accent', size: 'lg', className: 'gap-2.5 shadow-glow-accent font-bold' })}
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="inline-flex items-center justify-center gap-2 text-xs font-mono text-text-subtle">
          <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
          <span>{guarantee}</span>
        </p>
      </div>
    </section>
  );
}
