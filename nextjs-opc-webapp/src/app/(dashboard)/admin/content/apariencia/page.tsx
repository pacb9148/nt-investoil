import React from 'react';
import Link from 'next/link';
import { getLandingAppearance } from '@/lib/services/content-service';
import { AparienciaForm } from '@/components/admin/content/apariencia-form';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Apariencia y Tipografía | Admin Invest Oil LLC',
};

export default async function AparienciaPage() {
  const appearance = await getLandingAppearance();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            Apariencia, Tipografía y Paleta
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Personaliza el tipo de letra para titulares y cuerpo, paleta de colores de la marca y efectos de fondo sin tocar código.
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

      <AparienciaForm defaultValues={appearance} />
    </div>
  );
}
