import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Globe, Target, Award, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { COMPANY_INFO } from '@/lib/constants/investoil';

export const metadata: Metadata = {
  title: 'Acerca de Invest Oil LLC',
  description: 'Conoce más sobre Invest Oil LLC, nuestra trayectoria en intermediación de hidrocarburos, logística naviera y estándares éticos.',
};

export default function AboutPage() {
  return (
    <div className="pt-32 pb-24 space-y-24">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <Badge variant="accent">IDENTIDAD & VALORES</Badge>
            <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-text leading-tight">
              Liderando el puente comercial entre productores y refinerías globales
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              En <strong className="text-text">Invest Oil LLC</strong>, nos especializamos en la comercialización física y estructuración de contratos para crudos pesados, ligeros y derivados como Pet Coke, Merey 16, Brent Blend y Diesel EN590.
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              Nuestra misión es mitigar los riesgos operativos y financieros en cada transacción mediante una red global de fletamentos, análisis riguroso de mercado y estricto cumplimiento normativo KYC y antiblanqueo.
            </p>
            <div className="pt-2">
              <Button href="/#contact" variant="accent" size="lg" className="gap-2">
                <span>Contactar con la dirección</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 p-6 rounded-2xl border border-border bg-card shadow-2xl flex items-center justify-center">
              <Image
                src="/images/branding/seal-transparent.png"
                alt="Sello Corporativo Invest Oil LLC"
                width={300}
                height={300}
                className="object-contain filter drop-shadow-[0_4px_24px_rgba(0,201,167,0.3)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-text">Transparencia Total</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Cada operación se rige por contratos estandarizados bajo normativas internacionales y reglas ICC Incoterms 2020, sin cargos ocultos ni intermediarios no verificados.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-warm/15 border border-warm/30 text-warm flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-text">Alcance Multirregional</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Presencia operativa en Madrid, Lisboa, Dubái y Singapur para dar cobertura a las principales rutas marítimas de Europa, Asia y América.
            </p>
          </Card>

          <Card className="p-8 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-neon/15 border border-neon/30 text-neon flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-text">Gestión de Riesgo Integral</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Monitoreo continuo de cotizaciones de referencia, derivados financieros de cobertura e inspecciones SGS en puertos de carga y descarga.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
