import React from 'react';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del portal corporativo de Invest Oil LLC.',
};

export default async function TermsPage() {
  const pageData = await getLegalPage('terminos-y-condiciones');

  const fallback = {
    badge: 'MARCO LEGAL',
    title: 'Términos y Condiciones de Uso',
    lastUpdated: '2026-03-15',
    intro: 'Bienvenido al portal corporativo de Invest Oil LLC. El acceso y utilización de este sitio web implican la aceptación plena de los presentes términos.',
    sections: [
      {
        title: '1. Objeto y Alcance',
        content: 'Este sitio web tiene un carácter exclusivamente informativo y de contacto comercial en relación con las operaciones de intermediación, comercialización y logística de crudos y derivados energéticos.',
      },
      {
        title: '2. Procedimientos de Compliance y KYC',
        content: 'Toda relación comercial formal queda condicionada a la previa superación de los procedimientos de debida diligencia (Know Your Customer - KYC) y prevención de blanqueo de capitales.',
      },
      {
        title: '3. Propiedad Intelectual',
        content: 'La marca comercial Invest Oil LLC, los logotipos y contenidos son propiedad exclusiva de la entidad.',
      },
    ],
  };

  return <LegalPageView slug="terminos-y-condiciones" initialData={pageData || fallback} />;
}
