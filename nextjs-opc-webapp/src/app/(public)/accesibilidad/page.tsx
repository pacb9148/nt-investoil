import React from 'react';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Declaración de Accesibilidad',
  description: 'Compromiso de accesibilidad WCAG 2.1 AA de Invest Oil LLC.',
};

export default async function AccessibilityPage() {
  const pageData = await getLegalPage('accesibilidad');

  const fallback = {
    badge: 'CUMPLIMIENTO & ESTÁNDARES',
    title: 'Declaración de Accesibilidad',
    lastUpdated: '2026-03-15',
    intro: 'En Invest Oil LLC nos comprometemos a garantizar la accesibilidad digital de nuestro sitio web para todas las personas.',
    sections: [
      {
        title: 'Pautas de Accesibilidad (WCAG 2.1 Nivel AA)',
        content: '• Ratios de contraste superiores a 4.5:1.\n• Navegación por teclado.\n• Atributos ARIA en todos los componentes.',
      },
      {
        title: 'Contacto sobre Accesibilidad',
        content: 'Si experimentas alguna dificultad, contáctanos en contacto@investoil.es.',
      },
    ],
  };

  return <LegalPageView slug="accesibilidad" initialData={pageData || fallback} />;
}
