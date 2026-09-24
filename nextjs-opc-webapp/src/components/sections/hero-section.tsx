'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, ShieldCheck, Globe2, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/language-context';
import type { LandingHeroConfig } from '@/types/content';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  config?: LandingHeroConfig;
  customBg?: string;
}

export function HeroSection({ config: initialConfig, customBg }: HeroSectionProps) {
  const { t, language } = useLanguage();
  const [activeConfig, setActiveConfig] = useState<LandingHeroConfig | undefined>(initialConfig);

  useEffect(() => {
    // Sincronizar desde la API para asegurar persistencia entre navegadores e incógnito
    fetch('/api/content/hero')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.id) {
          setActiveConfig((prev) => ({ ...(prev || {}), ...data }));
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LandingHeroConfig>;
      if (customEvent.detail) {
        setActiveConfig((prev) => ({ ...(prev || {}), ...customEvent.detail }));
      }
    };

    window.addEventListener('investoil_hero_updated', handleUpdate);
    return () => window.removeEventListener('investoil_hero_updated', handleUpdate);
  }, []);

  const config = activeConfig || initialConfig;

  // Valores dinámicos con fallback inteligente al diccionario de idioma
  const isEn = language === 'en';

  const eyebrow = isEn
    ? config?.eyebrow_text_en || t.hero.eyebrow
    : config?.eyebrow_text || t.hero.eyebrow;

  const title1 = isEn
    ? config?.heading_line_1_en || t.hero.title1
    : config?.heading_line_1 || t.hero.title1;

  const title2 = isEn
    ? config?.heading_line_2_en || t.hero.title2
    : config?.heading_line_2 || t.hero.title2;

  const accent = isEn
    ? config?.heading_accent_en || t.hero.accent
    : config?.heading_accent || t.hero.accent;

  const subtitle = isEn
    ? config?.subtitle_en || t.hero.subtitle
    : config?.subtitle || t.hero.subtitle;

  const ctaPrimaryText = isEn
    ? config?.cta_primary_text_en || t.hero.ctaPrimary
    : config?.cta_primary_text || t.hero.ctaPrimary;

  const ctaPrimaryUrl = config?.cta_primary_url || '#services';

  const ctaSecondaryText = isEn
    ? config?.cta_secondary_text_en || t.hero.ctaSecondary
    : config?.cta_secondary_text || t.hero.ctaSecondary;

  const ctaSecondaryUrl = config?.cta_secondary_url || '#products';

  const marketTicker = config?.market_ticker || t.hero.marketTicker;

  // Fondo dinámico
  const bgType = config?.hero_bg_type || 'gradient';
  const bgUrl = config?.hero_bg_url || '';
  const bgOpacity = (config?.hero_bg_opacity ?? 20) / 100;
  const bgFit = config?.hero_bg_fit || 'cover';

  // Personalización dinámica de la Tarjeta Hero Señalada
  const heroCard = config?.hero_card;
  const cardBgColor = heroCard?.card_bg_color || 'rgba(14, 30, 61, 0.9)';
  const cardBorderColor = heroCard?.card_border_color || '#1a3264';
  const cardGlowOpacity = (heroCard?.card_glow_opacity ?? 50) / 100;

  const logoHue = heroCard?.logo_hue ?? 0;
  const logoBrightness = heroCard?.logo_brightness ?? 100;
  const logoSaturation = heroCard?.logo_saturation ?? 100;
  const logoShadowColor = heroCard?.logo_shadow_color || '#f59e0b';
  const logoShadowBlur = heroCard?.logo_shadow_blur ?? 20;

  const logoFilterStyle = `hue-rotate(${logoHue}deg) brightness(${logoBrightness}%) saturate(${logoSaturation}%) drop-shadow(0 0 ${logoShadowBlur}px ${logoShadowColor})`;

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: customBg || 'transparent' }}
    >
      {/* 1. Fondo Multimedia Dinámico (Video / Imagen / Gradiente) */}
      {bgType === 'video' ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ opacity: bgOpacity }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            src={bgUrl || '/videos/hero-background.mp4'}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('hero-background.mp4')) {
                target.src = '/videos/hero-background.mp4';
                target.load();
                target.play().catch(() => {});
              }
            }}
            className={cn(
              'w-full h-full object-center',
              bgFit === 'contain' ? 'object-contain' : 'object-cover'
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
        </div>
      ) : bgType === 'image' && bgUrl ? (
        <div
          className="absolute inset-0 z-0 bg-no-repeat bg-center pointer-events-none"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: bgFit,
            opacity: bgOpacity,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
        </div>
      ) : null}

      {/* Grid Pattern Obsidian */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(245, 158, 11, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245, 158, 11, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, rgba(0,0,0,0.9) 25%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, rgba(0,0,0,0.9) 25%, transparent 100%)',
        }}
      />

      {/* Ambient Gradient Glows Ámbar y Petróleo */}
      <div className="absolute top-1/4 -right-10 w-[550px] h-[550px] bg-accent/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute -bottom-10 -left-10 w-[450px] h-[450px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Columna Izquierda: Titulares y CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/40 bg-accent/10 text-accent font-mono text-[11px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>{eyebrow}</span>
            </div>

            {/* H1 Principal con acento ámbar */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.08] tracking-tight">
              {title1}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-amber-400 to-yellow-300">
                {accent}
              </span>{' '}
              {title2}
            </h1>

            {/* Subtítulo */}
            <p className="text-base sm:text-lg text-text-muted max-w-2xl leading-relaxed">
              {subtitle}
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={ctaPrimaryUrl}
                className={buttonVariants({
                  variant: 'accent',
                  size: 'lg',
                  className: 'gap-2.5 shadow-glow-accent font-bold',
                })}
              >
                <span>{ctaPrimaryText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={ctaSecondaryUrl}
                className={buttonVariants({
                  variant: 'secondary',
                  size: 'lg',
                  className: 'gap-2 border border-border/80',
                })}
              >
                <span>{ctaSecondaryText}</span>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </Link>
            </div>

            {/* Ticker de Commodities en Vivo */}
            <div className="pt-4 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-card/60 backdrop-blur-sm text-xs font-mono text-text-muted">
                <TrendingUp className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>{marketTicker}</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-border/60 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <div className="text-lg font-bold font-mono text-accent">150M+</div>
                <div className="text-[11px] text-text-subtle font-mono">{t.hero.activeContracts}</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-text">99.8%</div>
                <div className="text-[11px] text-text-subtle font-mono">{t.hero.complianceRate}</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-text">38+</div>
                <div className="text-[11px] text-text-subtle font-mono">{t.hero.globalPresence}</div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Señalada Personalizable (media_1790194402061.png) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Resplandor decorativo con opacidad configurable */}
              <div
                className="absolute -inset-1 rounded-3xl blur-xl transition-all duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, ${cardBorderColor}, #f59e0b, #d97706)`,
                  opacity: cardGlowOpacity,
                }}
              />

              {/* Tarjeta Principal Glassmorphic con Sello Oficial */}
              <div
                className="relative rounded-2xl backdrop-blur-xl p-6 shadow-2xl space-y-6 transition-all duration-300"
                style={{
                  backgroundColor: cardBgColor,
                  border: `1px solid ${cardBorderColor}`,
                }}
              >
                <div
                  className="flex items-center justify-between pb-4"
                  style={{ borderBottom: `1px solid ${cardBorderColor}40` }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                    <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                      {isEn
                        ? heroCard?.badge_text_en || t.hero.sgsVerification
                        : heroCard?.badge_text || t.hero.sgsVerification}
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-accent" />
                </div>

                {/* Sello / Imagen Corporativa Oficial con Filtros Dinámicos */}
                <div className="flex justify-center py-2">
                  <div className="relative w-44 h-44 group">
                    <Image
                      src={heroCard?.logo_url || '/images/branding/seal-transparent.png'}
                      alt="Invest Oil LLC Official Seal"
                      width={176}
                      height={176}
                      unoptimized={Boolean(heroCard?.logo_url && heroCard.logo_url.startsWith('/uploads'))}
                      className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
                      style={{
                        filter: logoFilterStyle,
                        WebkitFilter: logoFilterStyle,
                      }}
                      priority
                    />
                  </div>
                </div>

                {/* Resumen Operativo */}
                <div
                  className="space-y-2.5 pt-2"
                  style={{ borderTop: `1px solid ${cardBorderColor}40` }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {isEn ? (heroCard?.metric1_label_en || 'Monthly Shipments:') : (heroCard?.metric1_label || 'Despachos Mensuales:')}
                    </span>
                    <span className="font-mono font-semibold text-white">{heroCard?.metric1_value || '12.5M BBLS'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {isEn ? (heroCard?.metric2_label_en || 'Marine Terminals:') : (heroCard?.metric2_label || 'Terminales Marítimas:')}
                    </span>
                    <span className="font-mono font-semibold text-white">{heroCard?.metric2_value || 'Houston / Rotterdam'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {isEn ? (heroCard?.metric3_label_en || 'Operational Status:') : (heroCard?.metric3_label || 'Estatus Operativo:')}
                    </span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {heroCard?.metric3_value || (isEn ? 'ACTIVE 100%' : 'ACTIVO 100%')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
