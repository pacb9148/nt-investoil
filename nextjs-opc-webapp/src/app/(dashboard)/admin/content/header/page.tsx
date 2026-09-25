import React from 'react';
import Link from 'next/link';
import { HeaderForm, type HeaderData } from '@/components/admin/content/header-form';
import { getLandingHeader } from '@/lib/services/content-service';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cabecera & Menú Principal | Admin Invest Oil LLC',
};

const DEFAULT_HEADER_DATA: HeaderData = {
  logo_url: '/images/branding/corporate-card-logo.jpeg',
  logo_text: 'INVEST OIL',
  logo_tagline: 'Trading Company',
  menu_items: [
    { id: 'm-1', href: '/', label: 'Inicio', label_en: 'Home', is_active: true },
    { id: 'm-2', href: '/#services', label: 'Servicios', label_en: 'Services', is_active: true },
    { id: 'm-3', href: '/#products', label: 'Productos', label_en: 'Products', is_active: true },
    { id: 'm-4', href: '/about', label: 'Nosotros', label_en: 'About Us', is_active: true },
    { id: 'm-5', href: '/blog', label: 'Blog & Mercado', label_en: 'Market News', is_active: true },
    { id: 'm-6', href: '/#contact', label: 'Contacto', label_en: 'Contact', is_active: true },
  ],
  action_button: {
    text: 'Contactar',
    text_en: 'Contact Us',
    url: '/#contact',
    is_visible: true,
  },
  backoffice_button: {
    text: 'Acceso Backoffice',
    text_en: 'Login',
    is_visible: true,
  },
};

export default async function HeaderAdminPage() {
  const rawData = await getLandingHeader();
  const headerData: HeaderData = {
    ...DEFAULT_HEADER_DATA,
    ...rawData,
    menu_items: Array.isArray(rawData?.menu_items) && rawData.menu_items.length > 0
      ? rawData.menu_items
      : DEFAULT_HEADER_DATA.menu_items,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Contenido</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Cabecera, Logotipo & Menú Principal
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Personaliza el logotipo principal de la barra de navegación, enlaces del menú (español e inglés) y botones de acción.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <span>Ver sitio en vivo</span>
          <ExternalLink className="w-3.5 h-3.5 text-accent" />
        </Link>
      </div>

      <HeaderForm initialData={headerData} />
    </div>
  );
}
