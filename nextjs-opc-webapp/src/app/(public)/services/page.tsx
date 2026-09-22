import React from 'react';
import type { Metadata } from 'next';
import { ServicesSection } from '@/components/sections/services-section';

export const metadata: Metadata = {
  title: 'Nuestros Servicios de Trading & Logística',
  description: 'Conoce los 10 servicios integrales de Invest Oil LLC: conexión de compradores y vendedores, fletamentos navieros, estructuración contractual y gestión de riesgos.',
};

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <ServicesSection />
    </div>
  );
}
