'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Inbox,
  Settings,
  Globe,
  ExternalLink,
  PlusCircle,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Sliders,
  Type,
  AlignLeft,
  Palette,
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
}

const PLATFORM_NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard KPI', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Gestión de Posts', icon: FileText },
  { href: '/admin/media', label: 'Biblioteca de Medios', icon: ImageIcon },
  { href: '/admin/leads', label: 'Mensajes de Contacto', icon: Inbox },
  { href: '/admin/settings', label: 'Configuración & SEO', icon: Settings },
];

const CUSTOMIZATION_NAV: NavItem[] = [
  { href: '/admin/content/apariencia', label: 'Personalización & Apariencia', icon: Palette },
  { href: '/admin/content/hero', label: 'Tarjeta Hero & Logotipo', icon: Sparkles },
  { href: '/admin/content/textos', label: 'Textos & Traducciones', icon: AlignLeft },
];

const CONTENT_NAV: NavItem[] = [
  { href: '/admin/content', label: 'Módulos y Secciones', icon: LayoutTemplate, exact: true },
  { href: '/admin/content/marquee', label: 'Marquesina Doble', icon: Sliders },
  { href: '/admin/content/estadisticas', label: 'Estadísticas KPI', icon: Sliders },
  { href: '/admin/content/legales', label: 'Páginas Legales', icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [customizationOpen, setCustomizationOpen] = useState(true);
  const [contentOpen, setContentOpen] = useState(true);

  return (
    <aside className="w-64 border-r border-border bg-surf/95 flex flex-col justify-between shrink-0 min-h-screen">
      <div className="p-5 space-y-6">
        {/* Brand header */}
        <div className="pb-4 border-b border-border/80">
          <BrandLogo variant="logo" size={38} />
          <div className="mt-2 text-[10px] font-mono uppercase text-accent tracking-wider font-semibold">
            Panel Administrativo
          </div>
        </div>

        {/* Quick action button */}
        <Link
          href="/admin/posts/new"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-accent text-bg text-xs font-bold shadow-glow-accent hover:shadow-glow-neon transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Artículo</span>
        </Link>

        {/* Navigation list */}
        <div className="space-y-4">
          {/* Bloque: Plataforma */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold">
              Plataforma
            </p>
            <nav className="space-y-1" aria-label="Navegación de plataforma">
              {PLATFORM_NAV.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                        : 'text-text-muted hover:text-text hover:bg-card/40'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bloque: Despliegue de Personalización Visual */}
          <div>
            <button
              type="button"
              onClick={() => setCustomizationOpen(!customizationOpen)}
              className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-text-subtle hover:text-accent font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-accent" />
                <span>Personalización Visual</span>
              </span>
              {customizationOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {customizationOpen && (
              <nav className="space-y-1" aria-label="Navegación de personalización">
                {CUSTOMIZATION_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group',
                        isActive
                          ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                          : 'text-text-muted hover:text-text hover:bg-card/40'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Bloque: Contenido (Landing) */}
          <div>
            <button
              type="button"
              onClick={() => setContentOpen(!contentOpen)}
              className="w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-text-subtle hover:text-accent font-semibold transition-colors"
            >
              <span>Contenido (Landing)</span>
              {contentOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {contentOpen && (
              <nav className="space-y-1" aria-label="Navegación de contenido">
                {CONTENT_NAV.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group',
                        isActive
                          ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                          : 'text-text-muted hover:text-text hover:bg-card/40'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                        )}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Bottom link to public website */}
      <div className="p-4 border-t border-border/80 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-xs text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>Ver sitio público</span>
          </span>
          <ExternalLink className="w-3 h-3 text-text-subtle" />
        </Link>
      </div>
    </aside>
  );
}
