'use client';

import React from 'react';
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
} from 'lucide-react';
import { BrandLogo } from '@/components/layout/brand-logo';
import { cn } from '@/lib/utils';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard KPI', icon: LayoutDashboard, exact: true },
  { href: '/admin/posts', label: 'Gestión de Posts', icon: FileText },
  { href: '/admin/media', label: 'Biblioteca de Medios', icon: ImageIcon },
  { href: '/admin/leads', label: 'Mensajes de Contacto', icon: Inbox },
  { href: '/admin/settings', label: 'Configuración & SEO', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

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
        <nav className="space-y-1" aria-label="Navegación del panel">
          {ADMIN_NAV.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group',
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
