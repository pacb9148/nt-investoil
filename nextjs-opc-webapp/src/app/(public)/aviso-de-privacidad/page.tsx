import React from 'react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad',
  description: 'Política y aviso de privacidad de Invest Oil LLC.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      <Badge variant="accent">PROTECCIÓN DE DATOS</Badge>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
        Aviso de Privacidad
      </h1>

      <Card className="p-8 prose prose-invert max-w-none text-sm text-text-muted space-y-4">
        <p>
          En <strong className="text-text">Invest Oil LLC</strong> tratamos la información que nos facilitas con la finalidad exclusiva de prestarte el servicio solicitado y atender a tus consultas comerciales.
        </p>
        <h2 className="text-lg font-bold text-text mt-6">Responsable del Tratamiento</h2>
        <p>
          Invest Oil LLC · Dirección de Cumplimiento · Contacto:{' '}
          <a href="mailto:contacto@investoil.es" className="text-accent underline">
            contacto@investoil.es
          </a>
        </p>
        <h2 className="text-lg font-bold text-text mt-6">Legitimación y Conservación</h2>
        <p>
          La base legal para el tratamiento de tus datos es el consentimiento explícito manifestado al remitir el formulario de contacto o entablar comunicaciones por correo electrónico. Los datos se conservarán durante el tiempo necesario para responder a la solicitud y cumplir con las obligaciones legales aplicables.
        </p>
        <h2 className="text-lg font-bold text-text mt-6">Tus Derechos (RGPD)</h2>
        <p>
          Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, limitación del tratamiento y portabilidad enviando un correo electrónico a{' '}
          <a href="mailto:contacto@investoil.es" className="text-accent underline">
            contacto@investoil.es
          </a>.
        </p>
      </Card>
    </div>
  );
}
