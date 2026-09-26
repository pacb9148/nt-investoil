import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { AboutForm } from '@/components/admin/content/about-form';
import fs from 'fs';
import path from 'path';

import { getLandingAbout } from '@/lib/services/content-service';

export const metadata = {
  title: 'Editar Página Nosotros | Admin Invest Oil LLC',
};

export const dynamic = 'force-dynamic';

export default async function AdminNosotrosPage() {
  const aboutData = await getLandingAbout();

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
