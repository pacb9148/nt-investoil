'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronRight, ShieldCheck, Globe2, BarChart3, Anchor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { COMPANY_INFO } from '@/lib/constants/investoil';

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 201, 167, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 201, 167, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, rgba(0,0,0,0.9) 25%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 50% 40%, rgba(0,0,0,0.9) 25%, transparent 100%)',
        }}
      />

      {/* Ambient Gradient Glows */}
      <div className="absolute top-1/4 -right-10 w-[550px] h-[550px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-[450px] h-[450px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-warm/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-warm/40 bg-warm/10 text-warm font-mono text-xs uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-warm animate-pulse" />
              <span>Conexiones globales en el mercado petrolero</span>
            </div>

            {/* H1 Title */}
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.08] tracking-tight">
              Connecting buyers and sellers,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-emerald-400 to-warm">
                driving the future of energy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-text-muted max-w-2xl leading-relaxed">
              {COMPANY_INFO.heroSubtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="#contact">
                <Button variant="accent" size="lg" className="gap-2.5">
                  <span>Contáctanos</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Link href="#products">
                <Button variant="secondary" size="lg" className="gap-2">
                  <span>Ver productos</span>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-8 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="font-heading font-bold text-xl sm:text-2xl text-accent">50K+ MT</p>
                <p className="text-xs text-text-muted font-medium">Volúmenes operados</p>
              </div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-xl sm:text-2xl text-warm">8 Grados</p>
                <p className="text-xs text-text-muted font-medium">Crudos y refinados</p>
              </div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-xl sm:text-2xl text-text">100%</p>
                <p className="text-xs text-text-muted font-medium">KYC & Compliance</p>
              </div>
              <div className="space-y-1">
                <p className="font-heading font-bold text-xl sm:text-2xl text-neon">0 Demoras</p>
                <p className="text-xs text-text-muted font-medium">Logística marítima</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Sello & Operations card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md rounded-2xl border border-border bg-card/90 p-8 shadow-2xl backdrop-blur-xl">
              {/* Inner glowing effect */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-accent/20 to-transparent pointer-events-none -z-10" />

              {/* Seal Representation */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                  <Image
                    src="/images/branding/seal-transparent.png"
                    alt="Sello Oficial Invest Oil LLC"
                    width={220}
                    height={220}
                    className="object-contain filter drop-shadow-[0_4px_20px_rgba(0,201,167,0.35)] animate-pulse-slow"
                    priority
                  />
                </div>

                <div className="space-y-1">
                  <Badge variant="accent">PETROLEUM TRADING</Badge>
                  <h3 className="font-heading font-bold text-lg text-text">INVEST OIL LLC</h3>
                  <p className="text-xs text-text-muted max-w-xs">
                    Intermediación estratégica, fletamento marítimo e inteligencia de mercado.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="w-full pt-4 border-t border-border/80 flex flex-col gap-2.5 text-xs">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surf/70 border border-border/40">
                    <span className="flex items-center gap-2 text-text">
                      <Globe2 className="w-3.5 h-3.5 text-accent" />
                      <span>Mercados destino</span>
                    </span>
                    <span className="font-mono text-text-muted font-medium">Asia · Europa · Latam</span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surf/70 border border-border/40">
                    <span className="flex items-center gap-2 text-text">
                      <Anchor className="w-3.5 h-3.5 text-warm" />
                      <span>Fletes navieros</span>
                    </span>
                    <span className="font-mono text-text-muted font-medium">VLCC · Aframax · Spot</span>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surf/70 border border-border/40">
                    <span className="flex items-center gap-2 text-text">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Estándar</span>
                    </span>
                    <span className="font-mono text-emerald-400 font-medium">Incoterms 2020</span>
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
