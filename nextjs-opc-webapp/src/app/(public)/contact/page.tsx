import React from 'react';
import type { Metadata } from 'next';
import { ContactSection } from '@/components/sections/contact-section';
import { getServerLanguage } from '@/lib/i18n/server-language';

export function generateMetadata(): Metadata {
  return getServerLanguage() === 'en'
    ? {
        title: 'Commercial & Operations Contact',
        description: 'Get in touch with the management and operations team of Invest Oil LLC for commercial enquiries, cargo quotations and hydrocarbon logistics.',
      }
    : {
        title: 'Contacto Comercial & Operaciones',
        description: 'Comunícate con el equipo directivo y de operaciones de Invest Oil LLC para consultas comerciales, cotizaciones de cargamentos y logística de hidrocarburos.',
      };
}

export default function ContactPage() {
  return (
    <div className="pt-20">
      <ContactSection />
    </div>
  );
}
