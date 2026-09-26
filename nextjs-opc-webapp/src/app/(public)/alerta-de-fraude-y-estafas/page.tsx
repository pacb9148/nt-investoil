import React from 'react';
import type { Metadata } from 'next';
import { getLegalPage } from '@/lib/services/server-legal-service';
import { LegalPageView } from '@/components/legal/legal-page-view';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Alerta de Fraude y Estafas',
  description: 'Aviso oficial de seguridad y advertencia contra suplantaciones comerciales en trading de petróleo.',
};

export default async function FraudAlertPage() {
  const pageData = await getLegalPage('alerta-de-fraude-y-estafas');

  const fallback = {
    badge: 'SEGURIDAD & COMPLIANCE',
    title: 'Alerta de Fraude y Suplantación de Identidad',
    lastUpdated: '2026-03-15',
    intro: 'Aviso oficial de seguridad y advertencia contra suplantaciones comerciales en trading de petróleo.',
    sections: [
      {
        title: 'Advertencia Importante para Compradores y Vendedores',
        content: 'Invest Oil LLC nunca solicita anticipos de honorarios a cuentas bancarias personales ni opera fuera de los canales oficiales corporativos (@investoil.es).',
      },
      {
        title: 'Protocolos de Verificación Obligatorios',
        content: '• Dominios Oficiales: @investoil.es exclusivamente.\n• Canales Bancarios: Cartas de Crédito Documentarias Irrevocables (DLC) o cuentas corporativas.\n• Prueba de Producto (POP): Estricto respaldo de refinería.',
      },
      {
        title: 'Reporte de Actividades Sospechosas',
        content: 'Remite inmediatamente copia del correo a info@investoil.es para su investigación.',
      },
    ],
  };

  return <LegalPageView slug="alerta-de-fraude-y-estafas" initialData={pageData || fallback} />;
}
