import React from 'react';
import Link from 'next/link';
import { Mail, Clock, Linkedin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { COMPANY_INFO, LEGAL_LINKS } from '@/lib/constants/investoil';

export function Footer() {
  return (
    <footer className="border-t border-border bg-surf/90 pt-16 pb-12 text-text">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo variant="seal" size={54} />
            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
              {COMPANY_INFO.tagline}. Facilitamos transacciones justas y eficientes en el mercado global de crudos y derivados petrolíferos.
            </p>
            <div className="pt-2 flex items-center gap-3">
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
            </div>
          </div>

          {/* Col 2: Servicios */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Servicios
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Trading y Matching
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Negociación Contractual
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Logística Marítima
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Gestión de Riesgo
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-accent transition-colors">
                  Inteligencia de Mercado
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Productos */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Productos
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Pet Coke (PC-4500)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Merey 16 (16° API)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Brent Blend
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Diesel EN590
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  Bitumen & Asfaltos
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacto */}
          <div className="space-y-3">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-text">
              Contacto
            </h3>
            <div className="space-y-2.5 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-accent transition-colors text-xs break-all">
                  {COMPANY_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warm shrink-0" />
                <span className="text-xs">{COMPANY_INFO.schedule}</span>
              </div>
              <div className="pt-2">
                <Link href="/contact" className="inline-block text-xs font-semibold text-accent hover:underline">
                  Enviar consulta comercial &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>{COMPANY_INFO.copyright}</p>

          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Enlaces legales">
            {LEGAL_LINKS.map((link) => (
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
