import React from 'react';
import type { Metadata } from 'next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso del portal corporativo de Invest Oil LLC.',
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      <Badge variant="accent">MARCO LEGAL</Badge>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
        Términos y Condiciones de Uso
      </h1>

      <Card className="p-8 prose prose-invert max-w-none text-sm text-text-muted space-y-4">
        <p>
          Bienvenido al portal corporativo de <strong className="text-text">Invest Oil LLC</strong>. El acceso y utilización de este sitio web implican la aceptación plena de los presentes términos.
        </p>
        <h2 className="text-lg font-bold text-text mt-6">1. Objeto y Alcance</h2>
        <p>
          Este sitio web tiene un carácter exclusivamente informativo y de contacto comercial en relación con las operaciones de intermediación, comercialización y logística de crudos y derivados energéticos. Ninguna información expuesta constituye una oferta pública vinculante hasta la formalización de los contratos correspondientes (Sales & Purchase Agreement).
        </p>
        <h2 className="text-lg font-bold text-text mt-6">2. Procedimientos de Compliance y KYC</h2>
        <p>
          Toda relación comercial formal queda condicionada a la previa superación de los procedimientos de debida diligencia (Know Your Customer - KYC), antiblanqueo de capitales (AML) y verificación contra listas de sanciones internacionales (OFAC, UE, ONU).
        </p>
        <h2 className="text-lg font-bold text-text mt-6">3. Propiedad Intelectual</h2>
        <p>
          La marca comercial "Invest Oil LLC", los logotipos, sellos, textos, gráficos y estructura visual son propiedad exclusiva de Invest Oil LLC o se encuentran debidamente licenciados.
        </p>
      </Card>
    </div>
  );
}
