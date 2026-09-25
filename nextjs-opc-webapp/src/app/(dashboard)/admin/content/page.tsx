import React from 'react';
import Link from 'next/link';
import { getLandingSections } from '@/lib/services/content-service';
import { SectionToggle } from '@/components/admin/content/section-toggle';
import {
  ExternalLink,
  ArrowRight,
  Menu as MenuIcon,
  Sparkles,
  Sliders,
  Flame,
  Zap,
  DollarSign,
  Building2,
  Users,
  Star,
  HelpCircle,
  Mail,
  Award,
  FileText,
  Palette,
  Search,
} from 'lucide-react';

export const metadata = {
  title: 'Gestión de Contenido & Landing | Admin Invest Oil LLC',
};

interface ContentCardItem {
  href: string;
  label: string;
  badge?: string;
  icon: any;
  desc: string;
}

const HEADER_MODULES: ContentCardItem[] = [
  {
    href: '/admin/content/header',
    label: 'Cabecera, Logotipo & Menú Principal',
    badge: 'Identidad',
    icon: MenuIcon,
    desc: 'Logotipo de cabecera, eslogan, enlaces de navegación (ES/EN) y botones de acción (Login y CTA).',
  },
];

const SECTIONS_MODULES: ContentCardItem[] = [
  {
    href: '/admin/content/hero',
    label: '01. Hero Principal & Tarjeta Trading',
    badge: 'Sección 01',
    icon: Sparkles,
    desc: 'Titular de alto impacto, video/imagen de fondo, CTAs comerciales y tarjeta de operaciones verificada.',
  },
  {
    href: '/admin/content/marquee',
    label: '02. Marquesina Doble (Precios & Ticker)',
    badge: 'Sección 02',
    icon: Sliders,
    desc: 'Banda animada con cotizaciones en vivo Brent/WTI, certificaciones SGS y reportes de mercado.',
  },
  {
    href: '/admin/content/problema',
    label: '03. Retos del Sector (El Problema)',
    badge: 'Sección 03',
    icon: Flame,
    desc: '3 tarjetas de desafíos de la intermediación no regulada, volatilidad de fletes y disrupciones globales.',
  },
  {
    href: '/admin/content/services',
    label: '04. Servicios Petroleros',
    badge: 'Sección 04',
    icon: Zap,
    desc: '10 soluciones integrales: comercialización, fletamento marítimo, blending, almacenamiento y derivados.',
  },
  {
    href: '/admin/content/products',
    label: '05. Portafolio de Hidrocarburos',
    badge: 'Sección 05',
    icon: DollarSign,
    desc: 'Catálogo de crudos pesados/ligeros, Jet Fuel A1, Diesel EN590, Pet Coke, D2 y Gas Natural Licuado.',
  },
  {
    href: '/admin/content/plataforma',
    label: '06. Operaciones & Infraestructura',
    badge: 'Sección 06',
    icon: Building2,
    desc: 'Terminales marítimas estratégicas, capacidad de almacenamiento y corredores logísticos globales.',
  },
  {
    href: '/admin/content/team',
    label: '07. Consejo Directivo & Gobernanza',
    badge: 'Sección 07',
    icon: Users,
    desc: 'Perfiles ejecutivos del consejo directivo, directores de trading, cumplimiento y gobernanza corporativa.',
  },
  {
    href: '/admin/content/testimonials',
    label: '08. Testimonios & Clientes',
    badge: 'Sección 08',
    icon: Star,
    desc: 'Prueba social y cartas de satisfacción de refinerías, distribuidores independientes y socios comerciales.',
  },
  {
    href: '/admin/content/faq-editor',
    label: '09. Preguntas Frecuentes (FAQ)',
    badge: 'Sección 09',
    icon: HelpCircle,
    desc: 'Preguntas y respuestas operativas sobre contratos ICC, inspecciones SGS e Incoterms 2020.',
  },
  {
    href: '/admin/content/contact',
    label: '10. Formulario de Contacto & Leads',
    badge: 'Sección 10',
    icon: Mail,
    desc: 'Módulo de captación de consultas comerciales, ofertas de compra/venta y soporte al cliente.',
  },
  {
    href: '/admin/content/cta-final',
    label: '11. CTA Final de Cierre Comercial',
    badge: 'Sección 11',
    icon: Award,
    desc: 'Sección de cierre comercial para apertura de cuentas y negociación de contratos a largo plazo.',
  },
];

const PAGES_MODULES: ContentCardItem[] = [
  {
    href: '/admin/content/nosotros',
    label: 'Página Nosotros (/about)',
    badge: 'Página',
    icon: Users,
    desc: 'Logotipo de la página, título institucional, eslogan, misión y los 3 pilares estratégicos de valor.',
  },
  {
    href: '/admin/content/legales',
    label: 'Páginas Legales & Marco Normativo',
    badge: 'Cumplimiento',
    icon: FileText,
    desc: 'Aviso legal, política de privacidad, política de cookies, términos de trading y prevención de fraudes.',
  },
];

const FOOTER_MODULES: ContentCardItem[] = [
  {
    href: '/admin/content/settings',
    label: 'Pie de Página, Sedes & Copyright (Footer)',
    badge: 'Pie de Página',
    icon: Building2,
    desc: 'Logotipo inferior, eslogan corporativo, sedes internacionales en 2 filas (Houston, Madrid, Bogotá), LinkedIn, certificaciones y copyright.',
  },
];

const DESIGN_MODULES: ContentCardItem[] = [
  {
    href: '/admin/content/apariencia',
    label: 'Apariencia, Tipografía & Paleta',
    badge: 'Diseño',
    icon: Palette,
    desc: 'Fuentes tipográficas de titulares y cuerpo, colores de fondo por sección y personalización visual.',
  },
  {
    href: '/admin/content/seo',
    label: 'Identidad Legal, SEO & Delaware USA',
    badge: 'Delaware / SEO',
    icon: Search,
    desc: 'Sede oficial Delaware, centros operativos (Houston, Madrid, Bogotá), desambiguación Google/IA y tarjetas Open Graph.',
  },
];

export default async function ContentOverviewPage() {
  const sections = await getLandingSections();

  const renderModuleGrid = (items: ContentCardItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-surf/60 p-4 hover:border-accent/40 hover:bg-card/90 transition-all duration-200 group shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-lg bg-card border border-border/80 text-accent group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </span>
                {item.badge && (
                  <span className="text-[10px] font-mono text-accent/80 bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {item.badge}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text group-hover:text-accent transition-colors flex items-center justify-between">
                  <span>{item.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-9 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-subtle font-mono">
            ADMIN / CONTENIDO
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Gestión de Contenido & Landing Page
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Todas las secciones y elementos ordenados exactamente como aparecen en el sitio web en vivo.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-lg bg-card border border-border px-4 py-2.5 text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors shadow-sm"
        >
          <span>Ver sitio en vivo</span>
          <ExternalLink className="w-3.5 h-3.5 text-accent" />
        </Link>
      </div>

      {/* 1. Cabecera & Navegación */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <MenuIcon className="w-4 h-4" />
            <span>01. Cabecera, Logotipo & Menú Principal</span>
          </h2>
          <span className="text-[11px] text-text-subtle font-mono">Barra superior fija</span>
        </div>
        {renderModuleGrid(HEADER_MODULES)}
      </section>

      {/* 2. Secciones de la Landing en Orden */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>02. Secciones de la Landing Page (Orden 1:1 en Línea)</span>
          </h2>
          <span className="text-[11px] text-text-subtle font-mono">11 secciones secuenciales</span>
        </div>
        {renderModuleGrid(SECTIONS_MODULES)}
      </section>

      {/* 3. Páginas del Sitio */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>03. Páginas del Sitio Web</span>
          </h2>
          <span className="text-[11px] text-text-subtle font-mono">Rutas independientes</span>
        </div>
        {renderModuleGrid(PAGES_MODULES)}
      </section>

      {/* 4. Pie de Página */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>04. Pie de Página, Sedes & Ajustes Generales (Footer)</span>
          </h2>
          <span className="text-[11px] text-text-subtle font-mono">Direcciones en 2 filas & marco legal</span>
        </div>
        {renderModuleGrid(FOOTER_MODULES)}
      </section>

      {/* 5. Diseño, Apariencia & SEO */}
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>05. Diseño Global, Apariencia & SEO</span>
          </h2>
          <span className="text-[11px] text-text-subtle font-mono">Tipografía & Redes</span>
        </div>
        {renderModuleGrid(DESIGN_MODULES)}
      </section>

      {/* Tabla de Visibilidad y Control de Secciones */}
      <div className="pt-4 border-t border-border/60">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-text-subtle">
            Visibilidad y Control Activo de Secciones
          </h2>
          <span className="text-xs text-text-muted">
            Los interruptores activan o desactivan las secciones de inmediato
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surf/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/80 bg-card/60">
                <tr>
                  <th className="py-3 px-4 text-xs font-mono uppercase tracking-wider text-text-subtle">
                    #
                  </th>
                  <th className="py-3 px-4 text-xs font-mono uppercase tracking-wider text-text-subtle">
                    Sección
                  </th>
                  <th className="py-3 px-4 text-xs font-mono uppercase tracking-wider text-text-subtle hidden sm:table-cell">
                    Descripción
                  </th>
                  <th className="py-3 px-4 text-xs font-mono uppercase tracking-wider text-text-subtle text-right">
                    Estado en Vivo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sections.map((section, idx) => (
                  <tr
                    key={section.id}
                    className="hover:bg-card/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-text-subtle">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{section.icon}</span>
                        <div>
                          <p className="font-semibold text-text text-xs group-hover:text-accent transition-colors">
                            {section.title}
                          </p>
                          <p className="text-[11px] text-text-subtle font-mono">
                            id: {section.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-text-muted hidden sm:table-cell max-w-xs truncate">
                      {section.description}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <SectionToggle
                        id={section.id}
                        isActive={section.is_active}
                        title={section.title}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
