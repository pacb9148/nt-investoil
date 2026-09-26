import React from 'react';
import type { Metadata } from 'next';
import { ProductsSection } from '@/components/sections/products-section';
import { getServerLanguage } from '@/lib/i18n/server-language';

export function generateMetadata(): Metadata {
  return getServerLanguage() === 'en'
    ? {
        title: 'Petroleum Products & Derivatives Catalog',
        description: 'Technical specifications for Pet Coke (PC-4500), Merey 16, Brent Blend, EN590 Diesel, Jet A-1 and D2 gasoil.',
      }
    : {
        title: 'Catálogo de Productos Petrolíferos & Derivados',
        description: 'Especificaciones técnicas de Pet Coke (PC-4500), Merey 16, Brent Blend, Diesel EN590, Jet A-1 y Gasoil D2.',
      };
}

export default function ProductsPage() {
  return (
    <div className="pt-20">
      <ProductsSection />
    </div>
  );
}
