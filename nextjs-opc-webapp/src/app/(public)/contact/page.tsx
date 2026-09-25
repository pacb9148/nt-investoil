import React from 'react';
import type { Metadata } from 'next';
import { ContactSection } from '@/components/sections/contact-section';

export const metadata: Metadata = {
  title: 'Contacto Comercial & Operaciones',
  description: 'Comunícate con el equipo directivo y de operaciones de Invest Oil LLC para consultas comerciales, cotizaciones de cargamentos y logística de hidrocarburos.',
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      <ContactSection />
    </div>
  );
}
