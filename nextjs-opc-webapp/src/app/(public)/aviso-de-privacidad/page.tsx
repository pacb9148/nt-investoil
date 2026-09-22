import React from 'react';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Aviso de Privacidad',
  description: 'Política y aviso de privacidad de Invest Oil LLC.',
};

export default async function PrivacyPage() {
  const pageData = await getLegalPage('aviso-de-privacidad');

  const fallback = {
    badge: 'PROTECCIÓN DE DATOS',
    title: 'Aviso de Privacidad',
    lastUpdated: '2026-03-15',
    intro: 'En Invest Oil LLC tratamos la información que nos facilitas con la finalidad exclusiva de prestarte el servicio solicitado.',
    sections: [
      {
        title: 'Responsable del Tratamiento',
        content: 'Invest Oil LLC · Dirección de Cumplimiento · Contacto: contacto@investoil.es',
      },
      {
        title: 'Legitimación y Conservación',
        content: 'La base legal para el tratamiento de tus datos es el consentimiento explícito manifestado al remitir el formulario.',
      },
      {
        title: 'Tus Derechos (RGPD)',
        content: 'Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión y limitación escribiendo a contacto@investoil.es.',
      },
    ],
  };

  return <LegalPageView slug="aviso-de-privacidad" initialData={pageData || fallback} />;
}
