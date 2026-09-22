import React from 'react';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies técnicas en el sitio web de Invest Oil LLC.',
};

export default async function CookiesPage() {
  const pageData = await getLegalPage('politica-de-cookies');

  const fallback = {
    badge: 'PRIVACIDAD & COOKIES',
    title: 'Política de Cookies',
    lastUpdated: '2026-03-15',
    intro: 'Este sitio web utiliza cookies técnicas estrictamente necesarias para el correcto funcionamiento del portal, la autenticación de administradores y la preservación de la seguridad.',
    sections: [
      {
        title: 'Tipos de Cookies Utilizadas',
        content: '• Cookies de Sesión y Autenticación: Permiten mantener la sesión segura.\n• Cookies de Seguridad: Prevención de ataques CSRF.',
      },
      {
        title: 'Cómo Desactivar las Cookies',
        content: 'Puedes configurar tu navegador en cualquier momento para bloquear o alertar sobre la presencia de estas cookies.',
      },
    ],
  };

  return <LegalPageView slug="politica-de-cookies" initialData={pageData || fallback} />;
}
