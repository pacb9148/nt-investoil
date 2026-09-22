'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Clock, Linkedin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { LanguageSelector } from './language-selector';
import { useLanguage } from '@/lib/i18n/language-context';
import { COMPANY_INFO } from '@/lib/constants/investoil';

export function Footer() {
  const { t } = useLanguage();

  const legalLinks = [
    { href: '/aviso-de-privacidad', label: t.footer.privacy },
    { href: '/terminos-y-condiciones', label: t.footer.terms },
    { href: '/politica-de-cookies', label: t.footer.cookies },
    { href: '/alerta-de-fraude-y-estafas', label: t.footer.fraudAlert },
    { href: '/accesibilidad', label: t.footer.accessibility },
  ];

  return (
    <footer className="border-t border-border bg-surf/90 pt-16 pb-12 text-text">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="seal" size={54} />
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
              <LanguageSelector />
            </div>
          </div>

          {/* Col 2: Servicios */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              {t.nav.services}
            </h3>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Trading & Commodity Matching
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Negociación Contractual Incoterms
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Fletamento y Logística Marítima
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Mitigación de Riesgo y Coberturas
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Inspección Certificada SGS / Intertek
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Productos */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              {t.nav.products}
            </h3>
            <ul className="space-y-2 text-xs text-text-muted">
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Brent Blend & Merey 16
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Jet Fuel A1 (ASTM D1655)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Diesel Ultra Bajo Azufre EN590
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Gas Natural Licuado (GNL)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Pet Coke y Asfaltos Viales
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Oficinas y Contacto */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              {t.footer.contact}
            </h3>
            <div className="space-y-2 text-xs text-text-muted">
              <p className="font-mono text-text-subtle text-[11px]">{t.footer.houstonOffice}</p>
              <p className="font-mono text-text-subtle text-[11px]">{t.footer.madridOffice}</p>
              <p className="font-mono text-text-subtle text-[11px]">{t.footer.bogotaOffice}</p>
              <div className="pt-2 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-accent shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-accent transition-colors break-all">
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>{COMPANY_INFO.schedule}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>{t.footer.rights}</p>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Enlaces legales">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
