import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AboutForm } from '@/components/admin/content/about-form';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Editar Página Nosotros | Admin Invest Oil LLC',
};

function getAboutData() {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', 'about.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'about.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        return JSON.parse(fs.readFileSync(c, 'utf-8'));
      } catch {}
    }
  }
  return {
    badge_text: 'IDENTIDAD & VALORES',
    title: 'Liderando el puente comercial entre productores y refinerías globales',
    slogan: 'En Invest Oil LLC, nos especializamos en la comercialización física y estructuración de contratos para crudos pesados, ligeros y derivados.',
    featured_image: '/images/branding/corporate-card-logo.jpeg',
    pillars: []
  };
}

export default function AdminNosotrosPage() {
  const aboutData = getAboutData();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
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
            Personalizar Página Nosotros (/about)
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura el titular, eslogan, misión, pilares de valor y la imagen central corporativa de la página Nosotros.
          </p>
        </div>

        <Link
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <span>Ver Nosotros en vivo</span>
          <ExternalLink className="w-3.5 h-3.5 text-accent" />
        </Link>
      </div>

      <AboutForm initialData={aboutData} />
    </div>
  );
}
