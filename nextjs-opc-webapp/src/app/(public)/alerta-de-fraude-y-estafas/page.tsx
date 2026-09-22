import React from 'react';
import type { Metadata } from 'next';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Alerta de Fraude y Estafas',
  description: 'Aviso oficial de seguridad y advertencia contra suplantaciones comerciales en trading de petróleo.',
};

export default function FraudAlertPage() {
  return (
    <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      <Badge variant="danger">SEGURIDAD & COMPLIANCE</Badge>
      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
        Alerta de Fraude y Suplantación de Identidad
      </h1>

      <Card className="p-8 prose prose-invert max-w-none text-sm text-text-muted space-y-4 border-rose-500/30">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 not-prose">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <strong className="block text-sm font-bold text-rose-200">
              Advertencia Importante para Compradores y Vendedores
            </strong>
            <span>
              Invest Oil LLC nunca solicita anticipos de honorarios a cuentas bancarias personales ni opera fuera de los canales oficiales corporativos (@investoil.es).
            </span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-text mt-6">Protocolos de Verificación Obligatorios</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-text">Dominios Oficiales:</strong> Todas las comunicaciones legítimas provienen exclusivamente de direcciones con el dominio <code>@investoil.es</code>.
          </li>
          <li>
            <strong className="text-text">Canales Bancarios:</strong> Las operaciones se liquidan exclusivamente mediante Cartas de Crédito Documentarias Irrevocables (DLC) o transferencias bancarias directas a cuentas institucionales de la compañía.
          </li>
          <li>
            <strong className="text-text">Prueba de Producto (POP) y Asignación:</strong> No se aceptan ni emiten documentos sin estricto respaldo de refinería o inspección certificada SGS/Saybolt.
          </li>
        </ul>

        <h2 className="text-lg font-bold text-text mt-6">Reporte de Actividades Sospechosas</h2>
        <p>
          Si has recibido una oferta no solicitada que sospeches pueda ser fraudulenta a nombre de Invest Oil LLC, remite inmediatamente copia del correo a{' '}
          <a href="mailto:contacto@investoil.es" className="text-accent underline font-semibold">
            contacto@investoil.es
          </a>{' '}
          para su investigación y remisión a las autoridades correspondientes.
        </p>
      </Card>
    </div>
  );
}
