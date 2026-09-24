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
  // Todos los menús inician cerrados por defecto según directiva de UX
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <aside className="w-64 border-r border-border bg-surf/95 flex flex-col h-full max-h-screen shrink-0 relative overflow-hidden select-none">
      {/* Contenedor desplazable de navegación */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-border">
        {/* Brand header */}
        <div className="pb-3 border-b border-border/80">
          <BrandLogo variant="seal" size={38} />
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

        {/* Acordeón de menús principales */}
        <div className="space-y-3">
          {/* 1. Bloque: Plataforma */}
          <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('plataforma')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors',
                openSection === 'plataforma'
                  ? 'bg-card/70 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-card/40'
              )}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
                <span>Plataforma</span>
              </span>
              {openSection === 'plataforma' ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openSection === 'plataforma' && (
              <nav className="p-1.5 space-y-0.5 border-t border-border/40" aria-label="Navegación de plataforma">
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
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
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

          {/* 2. Bloque: Cabecera & Menú */}
          <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('cabecera')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors',
                openSection === 'cabecera'
                  ? 'bg-card/70 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-card/40'
              )}
            >
              <span className="flex items-center gap-2">
                <MenuIcon className="w-3.5 h-3.5 text-accent" />
                <span>Cabecera & Menú</span>
              </span>
              {openSection === 'cabecera' ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openSection === 'cabecera' && (
              <nav className="p-1.5 space-y-0.5 border-t border-border/40" aria-label="Navegación de cabecera">
                <Link
                  href="/admin/content/header"
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                    pathname === '/admin/content/header'
                      ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-card/40'
                  )}
                >
                  <MenuIcon className={cn('w-3.5 h-3.5 shrink-0', pathname === '/admin/content/header' ? 'text-accent' : 'text-text-subtle')} />
                  <span className="truncate">Cabecera, Logo & Menú</span>
                </Link>
              </nav>
            )}
          </div>

          {/* 3. Bloque: Secciones Landing (1:1) */}
          <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('secciones')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors',
                openSection === 'secciones'
                  ? 'bg-card/70 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-card/40'
              )}
            >
              <span className="flex items-center gap-2">
                <LayoutTemplate className="w-3.5 h-3.5 text-accent" />
                <span>Secciones Landing</span>
              </span>
              {openSection === 'secciones' ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openSection === 'secciones' && (
              <nav className="p-1.5 space-y-0.5 border-t border-border/40" aria-label="Navegación de secciones landing">
                <Link
                  href="/admin/content"
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                    pathname === '/admin/content'
                      ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-card/40'
                  )}
                >
                  <LayoutTemplate className={cn('w-3.5 h-3.5 shrink-0', pathname === '/admin/content' ? 'text-accent' : 'text-text-subtle')} />
                  <span className="truncate">Resumen de Módulos</span>
                </Link>

                {SECTIONS_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
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

          {/* 4. Bloque: Páginas del Sitio */}
          <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('paginas')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors',
                openSection === 'paginas'
                  ? 'bg-card/70 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-card/40'
              )}
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-accent" />
                <span>Páginas del Sitio</span>
              </span>
              {openSection === 'paginas' ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openSection === 'paginas' && (
              <nav className="p-1.5 space-y-0.5 border-t border-border/40" aria-label="Navegación de páginas">
                {PAGES_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
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

          {/* 5. Bloque: Pie de Página & Sedes */}
          <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('pie')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors',
                openSection === 'pie'
                  ? 'bg-card/70 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-card/40'
              )}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-accent" />
                <span>Pie de Página</span>
              </span>
              {openSection === 'pie' ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openSection === 'pie' && (
              <nav className="p-1.5 space-y-0.5 border-t border-border/40" aria-label="Navegación de pie de página">
                <Link
                  href="/admin/content/settings"
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                    pathname === '/admin/content/settings' || pathname === '/admin/content/footer'
                      ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-card/40'
                  )}
                >
                  <Building2 className={cn('w-3.5 h-3.5 shrink-0', (pathname === '/admin/content/settings' || pathname === '/admin/content/footer') ? 'text-accent' : 'text-text-subtle')} />
                  <span className="truncate">Pie de Página & Sedes</span>
                </Link>
              </nav>
            )}
          </div>

          {/* 6. Bloque: Diseño & SEO */}
          <div className="rounded-lg border border-border/40 bg-card/20 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('diseno')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-colors',
                openSection === 'diseno'
                  ? 'bg-card/70 text-accent'
                  : 'text-text-muted hover:text-text hover:bg-card/40'
              )}
            >
              <span className="flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-accent" />
                <span>Diseño & SEO</span>
              </span>
              {openSection === 'diseno' ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {openSection === 'diseno' && (
              <nav className="p-1.5 space-y-0.5 border-t border-border/40" aria-label="Navegación de diseño y seo">
                <Link
                  href="/admin/content/apariencia"
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                    pathname === '/admin/content/apariencia'
                      ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-card/40'
                  )}
                >
                  <Palette className={cn('w-3.5 h-3.5 shrink-0', pathname === '/admin/content/apariencia' ? 'text-accent' : 'text-text-subtle')} />
                  <span className="truncate">Apariencia & Paleta</span>
                </Link>
                <Link
                  href="/admin/content/seo"
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group',
                    pathname === '/admin/content/seo'
                      ? 'bg-card text-accent border border-accent/40 font-semibold shadow-sm'
                      : 'text-text-muted hover:text-text hover:bg-card/40'
                  )}
                >
                  <Search className={cn('w-3.5 h-3.5 shrink-0', pathname === '/admin/content/seo' ? 'text-accent' : 'text-text-subtle')} />
                  <span className="truncate">SEO & Redes Sociales</span>
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Pie fijo: Botón Ver sitio público siempre visible al pie */}
      <div className="p-3 border-t border-border bg-surf shrink-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.25)]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-card/80 border border-border/80 text-xs text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <Globe className="w-3.5 h-3.5 text-accent" />
            <span>Ver sitio público</span>
          </span>
          <ExternalLink className="w-3 h-3 text-text-subtle" />
        </Link>
      </div>
    </aside>
  );
}
