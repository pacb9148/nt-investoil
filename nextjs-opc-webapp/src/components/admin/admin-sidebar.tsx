'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Inbox,
  Globe,
  ExternalLink,
  PlusCircle,
  LayoutTemplate,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Sliders,
  Palette,
  UserCheck,
  Search,
  Building2,
  Menu as MenuIcon,
  HelpCircle,
  Mail,
  Zap,
  DollarSign,
  Flame,
  Users,
  Star,
  Award,
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
  { href: '/admin/users', label: 'Usuarios & Accesos', icon: UserCheck },
  { href: '/admin/posts', label: 'Gestión de Posts / Blog', icon: FileText },
  { href: '/admin/media', label: 'Biblioteca de Medios', icon: ImageIcon },
  { href: '/admin/leads', label: 'Mensajes de Contacto', icon: Inbox },
];

const SECTIONS_NAV: NavItem[] = [
  { href: '/admin/content/hero', label: '01. Hero Principal & Tarjeta', icon: Sparkles },
  { href: '/admin/content/marquee', label: '02. Marquesina Doble (Precios)', icon: Sliders },
  { href: '/admin/content/problema', label: '03. Retos del Sector (Problema)', icon: Flame },
  { href: '/admin/content/services', label: '04. Servicios Petroleros', icon: Zap },
  { href: '/admin/content/products', label: '05. Portafolio Hidrocarburos', icon: DollarSign },
  { href: '/admin/content/plataforma', label: '06. Operaciones & Infraestructura', icon: Building2 },
  { href: '/admin/content/team', label: '07. Consejo Directivo (Equipo)', icon: Users },
  { href: '/admin/content/testimonials', label: '08. Testimonios & Clientes', icon: Star },
  { href: '/admin/content/faq-editor', label: '09. Preguntas Frecuentes (FAQ)', icon: HelpCircle },
  { href: '/admin/content/contact', label: '10. Formulario de Contacto', icon: Mail },
  { href: '/admin/content/cta-final', label: '11. CTA Final de Cierre', icon: Award },
];

const PAGES_NAV: NavItem[] = [
  { href: '/admin/content/nosotros', label: 'Página Nosotros (/about)', icon: Users },
  { href: '/admin/content/legales', label: 'Páginas Legales & Compliance', icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(true);

  return (
    <aside className="w-64 border-r border-border bg-surf/95 flex flex-col justify-between shrink-0 h-full max-h-screen overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Brand header */}
        <div className="pb-3 border-b border-border/80">
          <BrandLogo variant="logo" size={36} />
          <div className="mt-1.5 text-[10px] font-mono uppercase text-accent tracking-wider font-semibold">
            Panel Administrativo
          </div>
        </div>

        {/* Quick action button */}
        <Link
          href="/admin/posts/new"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-accent text-bg text-xs font-bold shadow-glow-accent hover:shadow-glow-neon transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Nuevo Artículo</span>
        </Link>

        {/* Navigation list */}
        <div className="space-y-4">
          {/* Bloque: Plataforma */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold">
              Plataforma
            </p>
            <nav className="space-y-0.5" aria-label="Navegación de plataforma">
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
                      'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                      isActive
                        ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                        : 'text-text-muted hover:text-text hover:bg-card/40'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-3.5 h-3.5 transition-colors',
                        isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bloque: Cabecera & Identidad */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold">
              Cabecera & Menú
            </p>
            <nav className="space-y-0.5">
              <Link
                href="/admin/content/header"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                  pathname === '/admin/content/header'
                    ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-card/40'
                )}
              >
                <MenuIcon className={cn('w-3.5 h-3.5', pathname === '/admin/content/header' ? 'text-accent' : 'text-text-subtle')} />
                <span>Cabecera & Menú</span>
              </Link>
            </nav>
          </div>

          {/* Bloque: Secciones Landing en Orden */}
          <div>
            <button
              type="button"
              onClick={() => setSectionsOpen(!sectionsOpen)}
              className="w-full flex items-center justify-between px-3 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle hover:text-accent font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-accent" />
                <span>Secciones Landing (1:1)</span>
              </span>
              {sectionsOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {sectionsOpen && (
              <nav className="space-y-0.5" aria-label="Navegación de secciones landing">
                <Link
                  href="/admin/content"
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                    pathname === '/admin/content'
                      ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-card/40'
                  )}
                >
                  <LayoutTemplate className={cn('w-3.5 h-3.5', pathname === '/admin/content' ? 'text-accent' : 'text-text-subtle')} />
                  <span>Resumen de Módulos</span>
                </Link>

                {SECTIONS_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                        isActive
                          ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                          : 'text-text-muted hover:text-text hover:bg-card/40'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3.5 h-3.5 transition-colors shrink-0',
                          isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Bloque: Páginas */}
          <div>
            <button
              type="button"
              onClick={() => setPagesOpen(!pagesOpen)}
              className="w-full flex items-center justify-between px-3 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle hover:text-accent font-semibold transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span>Páginas del Sitio</span>
              </span>
              {pagesOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {pagesOpen && (
              <nav className="space-y-0.5" aria-label="Navegación de páginas">
                {PAGES_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                        isActive
                          ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                          : 'text-text-muted hover:text-text hover:bg-card/40'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3.5 h-3.5 transition-colors shrink-0',
                          isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Bloque: Pie de Página */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold">
              Pie de Página & Sedes
            </p>
            <nav className="space-y-0.5">
              <Link
                href="/admin/content/settings"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                  pathname === '/admin/content/settings' || pathname === '/admin/content/footer'
                    ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-card/40'
                )}
              >
                <Building2 className={cn('w-3.5 h-3.5', (pathname === '/admin/content/settings' || pathname === '/admin/content/footer') ? 'text-accent' : 'text-text-subtle')} />
                <span>Pie de Página & Sedes</span>
              </Link>
            </nav>
          </div>

          {/* Bloque: Configuración, Apariencia & SEO */}
          <div>
            <p className="px-3 mb-1 text-[10px] font-mono uppercase tracking-wider text-text-subtle font-semibold">
              Diseño & SEO
            </p>
            <nav className="space-y-0.5">
              <Link
                href="/admin/content/apariencia"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                  pathname === '/admin/content/apariencia'
                    ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-card/40'
                )}
              >
                <Palette className={cn('w-3.5 h-3.5', pathname === '/admin/content/apariencia' ? 'text-accent' : 'text-text-subtle')} />
                <span>Apariencia & Paleta</span>
              </Link>
              <Link
                href="/admin/content/seo"
                className={cn(
                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 group',
                  pathname === '/admin/content/seo'
                    ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                    : 'text-text-muted hover:text-text hover:bg-card/40'
                )}
              >
                <Search className={cn('w-3.5 h-3.5', pathname === '/admin/content/seo' ? 'text-accent' : 'text-text-subtle')} />
                <span>SEO & Redes Sociales</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom link to public website */}
      <div className="p-3 border-t border-border/80 space-y-1">
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
