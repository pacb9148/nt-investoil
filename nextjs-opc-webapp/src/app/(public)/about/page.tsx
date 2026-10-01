import React from 'react';
import type { Metadata } from 'next';

import { getLandingAbout } from '@/lib/services/content-service';
import { getServerLanguage } from '@/lib/i18n/server-language';
import { AboutContent } from '@/components/sections/about-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export function generateMetadata(): Metadata {
  return getServerLanguage() === 'en'
    ? {
        title: 'About Invest Oil LLC — Global Connections in Oil Trading',
        description: 'Learn more about Invest Oil LLC: our track record in hydrocarbon intermediation, maritime logistics and ethical standards.',
      }
    : {
        title: 'Acerca de Invest Oil LLC — Conexiones Globales en Trading Petrolero',
        description: 'Conoce más sobre Invest Oil LLC, nuestra trayectoria en intermediación de hidrocarburos, logística naviera y estándares éticos.',
      };
}

export default async function AboutPage() {
  const data = await getLandingAbout();
  return <AboutContent data={data} />;
}
