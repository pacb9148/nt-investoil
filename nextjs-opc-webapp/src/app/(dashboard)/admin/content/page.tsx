import React from 'react';
import Link from 'next/link';
import { getLandingSections } from '@/lib/services/content-service';
import { SectionToggle } from '@/components/admin/content/section-toggle';
import { ExternalLink, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Gestión de Landing Page | Admin Invest Oil LLC',
};

const MODULE_ROUTES: Record<string, string> = {
  hero: '/admin/content/hero',
  marquee: '/admin/content/marquee',
  estadisticas: '/admin/content/estadisticas',
  problema: '/admin/content/problema',
  services: '/admin/content/services',
  products: '/admin/content/products',
  plataforma: '/admin/content/plataforma',
  team: '/admin/content/team',
  testimonials: '/admin/content/testimonials',
  faq: '/admin/content/faq-editor',
  cta_final: '/admin/content/cta-final',
  contact: '/admin/content/contact',
};

const QUICK_MODULES = [
  { href: '/admin/content/apariencia', label: 'Personalización Visual', icon: '🎨', desc: 'Tipografías, paleta corporativa, colores por sección y efectos' },
  { href: '/admin/content/hero', label: 'Hero & Tarjeta Trading', icon: '🎯', desc: 'Titular, subtítulo, CTAs, video/fondo y tarjeta de operaciones' },
  { href: '/admin/content/estadisticas', label: 'Estadísticas KPI', icon: '📊', desc: '4 números de impacto (150M+, 38+, 99.8%)' },
  { href: '/admin/content/testimonials', label: 'Testimonios', icon: '⭐', desc: 'Tarjetas de refinerías y socios comerciales' },
  { href: '/admin/content/services', label: 'Servicios Petroleros', icon: '⚡', desc: '10 servicios integrales de hidrocarburos' },
  { href: '/admin/content/products', label: 'Portafolio Productos', icon: '💰', desc: 'Catálogo de crudos, Jet Fuel A1, EN590, D2' },
  { href: '/admin/content/problema', label: 'Retos del Sector', icon: '🔥', desc: '3 tarjetas de retos energéticos y volatilidad' },
  { href: '/admin/content/plataforma', label: 'Infraestructura', icon: '🏢', desc: 'Terminales marítimas, logística y capacidad' },
  { href: '/admin/content/faq-editor', label: 'Preguntas Frecuentes', icon: '❓', desc: 'Preguntas frecuentes y respuestas editables' },
  { href: '/admin/content/cta-final', label: 'CTA Final de Cierre', icon: '🚀', desc: 'Sección de cierre y botón de contacto principal' },
  { href: '/admin/content/marquee', label: 'Marquesina Doble', icon: '🏷️', desc: 'Banda animada de cotizaciones y reportes OPEP+' },
  { href: '/admin/content/textos', label: 'Textos & i18n', icon: '✏️', desc: 'Titulares y etiquetas bilingües ES / EN' },
  { href: '/admin/content/legales', label: 'Páginas Legales', icon: '⚖️', desc: 'Términos, privacidad, cookies y alerta de fraude' },
  { href: '/admin/content/seo', label: 'SEO & Metadata', icon: '🔍', desc: 'Meta tags, Open Graph, redes y Schema.org' },
  { href: '/admin/content/settings', label: 'Ajustes Generales', icon: '⚙️', desc: 'Oficinas Houston/Madrid/Bogotá, teléfonos y datos' },
];

export default async function ContentOverviewPage() {
  const sections = await getLandingSections();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-text-subtle font-mono">
            ADMIN / CONTENIDO
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
            Gestión de Landing Page
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {QUICK_MODULES.length} módulos editables · Controla cada sección, fondos de video, tipografías y textos desde aquí.
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

      {/* Module cards grid */}
      <div>
        <h2 className="mb-3 text-xs font-mono uppercase tracking-wider text-text-subtle">
          Módulos Rápidos de Contenido
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {QUICK_MODULES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-surf/60 p-4 hover:border-accent/40 hover:bg-card/90 transition-all duration-200 group shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl" role="img" aria-label={item.label}>
                    {item.icon}
                  </span>
                  <ArrowRight className="w-4 h-4 text-text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text group-hover:text-accent transition-colors">
                    {item.label}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Sections visibility table */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-text-subtle">
            Visibilidad y Control de Secciones
          </h2>
          <span className="text-xs text-text-muted">
            Los cambios de visibilidad se reflejan de inmediato en la landing
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surf/50 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/80 bg-card/60">
                <tr>
                  <th className="px-4 py-3.5 text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                    Sección
                  </th>
                  <th className="px-4 py-3.5 text-xs font-mono font-semibold uppercase tracking-wider text-text-muted hidden md:table-cell">
                    Descripción
                  </th>
                  <th className="px-4 py-3.5 text-center text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                    Visible
                  </th>
                  <th className="px-4 py-3.5 text-right text-xs font-mono font-semibold uppercase tracking-wider text-text-muted">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sections.map((s) => {
                  const editLink = MODULE_ROUTES[s.id];

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-card/40 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-lg" role="img" aria-label={s.title}>
                            {s.icon}
                          </span>
                          <div>
                            <p className="font-semibold text-text text-sm">{s.title}</p>
                            <p className="text-[11px] text-accent/80 font-mono">#{s.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-text-muted hidden md:table-cell text-xs max-w-md">
                        {s.description}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex justify-center">
                          <SectionToggle id={s.id} isActive={s.is_active} title={s.title} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {editLink ? (
                          <Link
                            href={editLink}
                            className="inline-flex items-center gap-1 rounded-md bg-accent/15 border border-accent/30 px-3 py-1 text-xs font-semibold text-accent hover:bg-accent/25 hover:border-accent/60 transition-colors"
                          >
                            <span>Editar</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-text-subtle font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
