import React from 'react';
import type { Metadata } from 'next';
import { ProductsSection } from '@/components/sections/products-section';

export const metadata: Metadata = {
  title: 'Catálogo de Productos Petrolíferos & Derivados',
  description: 'Especificaciones técnicas de Pet Coke (PC-4500), Merey 16, Brent Blend, Diesel EN590, Nafta virgen, Fuel Oil 380 CST, Bitumen y GLP.',
};

export default function ProductsPage() {
  return (
    <div className="pt-20">
      <ProductsSection />
    </div>
  );
}
