import React from 'react';
import type { Metadata } from 'next';
import { ContactSection } from '@/components/sections/contact-section';

export const metadata: Metadata = {
  title: 'Contacto Comercial & Trading Desk',
  description: 'Comunícate con el equipo de operaciones de Invest Oil LLC para consultas comerciales, cotizaciones de cargamentos y fletamentos.',
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      <ContactSection />
    </div>
  );
}
