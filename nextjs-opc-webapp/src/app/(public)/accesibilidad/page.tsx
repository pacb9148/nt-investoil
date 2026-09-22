import React from 'react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Declaración de Accesibilidad',
  description: 'Compromiso de accesibilidad WCAG 2.1 AA de Invest Oil LLC.',
};

export default function AccessibilityPage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      <Badge variant="accent">CUMPLIMIENTO & ESTÁNDARES</Badge>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
        Declaración de Accesibilidad
      </h1>

      <Card className="p-8 prose prose-invert max-w-none text-sm text-text-muted space-y-4">
        <p>
          En <strong className="text-text">Invest Oil LLC</strong> nos comprometemos a garantizar la accesibilidad digital de nuestro sitio web para todas las personas, incluidas aquellas con discapacidades físicas, visuales, auditivas o cognitivas.
        </p>
        <h2 className="text-lg font-bold text-text mt-6">Pautas de Accesibilidad (WCAG 2.1 Nivel AA)</h2>
        <p>
          Este sitio web ha sido diseñado e implementado siguiendo las pautas de accesibilidad para el contenido web (WCAG) 2.1 en su nivel AA. Entre las medidas adoptadas se incluyen:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Ratios de contraste tipográfico superiores a 4.5:1 sobre fondos oscuros.</li>
          <li>Navegación completa y accesible a través del teclado mediante el uso de tabuladores e indicadores visuales de foco.</li>
          <li>Atributos ARIA y etiquetas descriptivas en todos los elementos interactivos, formularios y botones.</li>
          <li>Textos alternativos en todas las imágenes de contenido y logotipos corporativos.</li>
          <li>Jerarquía estructural clara con encabezados semánticos (h1, h2, h3).</li>
        </ul>
        <h2 className="text-lg font-bold text-text mt-6">Contacto sobre Accesibilidad</h2>
        <p>
          Si experimentas alguna dificultad para acceder a cualquier contenido o funcionalidad de este portal, por favor escríbenos a{' '}
          <a href="mailto:contacto@investoil.es" className="text-accent underline">
            contacto@investoil.es
          </a>.
        </p>
      </Card>
    </div>
  );
}
