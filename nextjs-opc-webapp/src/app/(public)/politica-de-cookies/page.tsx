import React from 'react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies técnicas en el sitio web de Invest Oil LLC.',
};

export default function CookiesPage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      <Badge variant="accent">PRIVACIDAD & COOKIES</Badge>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
        Política de Cookies
      </h1>

      <Card className="p-8 prose prose-invert max-w-none text-sm text-text-muted space-y-4">
        <p>
          Este sitio web utiliza cookies técnicas estrictamente necesarias para el correcto funcionamiento del portal, la autenticación de administradores y la preservación de la seguridad.
        </p>
        <h2 className="text-lg font-bold text-text mt-6">Tipos de Cookies Utilizadas</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-text">Cookies de Sesión y Autenticación:</strong> Permiten mantener la sesión segura en el panel administrativo de Supabase.
          </li>
          <li>
            <strong className="text-text">Cookies de Seguridad y Prevención de Abusos:</strong> Utilizadas para mitigar ataques CSRF y prevenir envíos automatizados no deseados.
          </li>
        </ul>
        <h2 className="text-lg font-bold text-text mt-6">Cómo Desactivar las Cookies</h2>
        <p>
          Puedes configurar tu navegador en cualquier momento para bloquear o alertar sobre la presencia de estas cookies; no obstante, algunas funciones del sitio podrían no operar correctamente.
        </p>
      </Card>
    </div>
  );
}
