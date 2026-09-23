'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Clock, Linkedin, ArrowUpRight, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { LanguageSelector } from './language-selector';
import { useLanguage } from '@/lib/i18n/language-context';
import { useSiteSettings } from '@/lib/services/site-settings';
import { COMPANY_INFO, LEGAL_LINKS } from '@/lib/constants/investoil';

export function Footer() {
  const { t, language } = useLanguage();
  const { offices, email, copyright } = useSiteSettings();
  const isEn = language === 'en';

  return (
    <footer className="border-t border-border bg-surf/95 pt-16 pb-12 text-text">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-border/60 items-start">
          {/* Col 1: Marca e Identidad (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo variant="seal" size={56} />
            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              {t.footer.tagline}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={COMPANY_INFO.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-text hover:text-accent hover:border-accent/40 transition-colors"
                aria-label="Invest Oil en LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-accent" />
                <span>LinkedIn</span>
                <ArrowUpRight className="w-3 h-3 text-text-subtle" />
              </a>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card/50 text-[11px] font-mono text-text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>KYC / Compliance</span>
              </div>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card/50 text-[11px] font-mono text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
                title="Acceso Backoffice"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>{t.nav.admin}</span>
              </Link>
              <LanguageSelector />
            </div>
          </div>

          {/* Col 2: Marco Legal & Cumplimiento (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-accent font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>{isEn ? 'Legal Framework' : 'Marco Legal & Cumplimiento'}</span>
            </h3>
            <ul className="space-y-2.5 text-xs">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-accent hover:translate-x-0.5 inline-flex items-center transition-all duration-150"
                  >
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Sedes Internacionales y Direcciones en 2 filas (Sin tarjetas, tipografía limpia) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-accent font-mono flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              <span>{isEn ? 'Headquarters & Global Desks' : 'Sedes Internacionales & Direcciones'}</span>
            </h3>

            <div className="space-y-4">
              {offices.map((office, idx) => {
                const cityCountry = isEn ? (office.cityCountryEn || office.cityCountry) : office.cityCountry;
                const detail = isEn ? (office.detailEn || office.detail) : office.detail;

                return (
                  <div
                    key={office.id || idx}
                    className={`space-y-1 ${idx > 0 ? 'pt-3.5 border-t border-border/40' : ''}`}
                  >
                    {/* Fila 1: Ciudad, País */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span className="text-xs font-bold text-text tracking-wide">
                        {cityCountry}
                      </span>
                      <span className="text-[10px] font-mono text-accent/80 font-medium">
                        [{office.id === 'houston' ? 'HQ' : 'DESK'}]
                      </span>
                    </div>

                    {/* Fila 2: Dirección física y Detalle */}
                    <div className="pl-5 text-[11px] text-text-muted leading-relaxed font-mono">
                      <span>{office.address}</span>
                      <span className="text-accent/90 font-sans ml-2 font-medium">({detail})</span>
                    </div>
                  </div>
                );
              })}

              {/* Contacto Directo */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-muted border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
                  <a
                    href={`mailto:${email || COMPANY_INFO.email}`}
                    className="hover:text-accent font-mono text-xs transition-colors"
                  >
                    {email || COMPANY_INFO.email}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-warm shrink-0" />
                  <span className="font-mono text-[11px]">{COMPANY_INFO.schedule}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>{copyright || t.footer.rights}</p>
          <div className="flex items-center gap-4 text-[11px] font-mono text-text-subtle">
            <span>ASTM D1655 / GOST COMPLIANT</span>
            <span>·</span>
            <span>INCOTERMS 2020</span>
            <span>·</span>
            <span>SGS & INTERTEK VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
