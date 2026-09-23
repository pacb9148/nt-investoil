import type { Metadata } from 'next';
import './globals.css';
import { COMPANY_INFO } from '@/lib/constants/investoil';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { AppearanceProvider } from '@/components/layout/appearance-provider';

export const metadata: Metadata = {
  title: {
    default: `${COMPANY_INFO.name} — ${COMPANY_INFO.tagline}`,
    template: `%s | ${COMPANY_INFO.name}`,
  },
  description: `${COMPANY_INFO.tagline}. ${COMPANY_INFO.heroSubtitle}`,
  keywords: [
    'Invest Oil',
    'Trading petrolero',
    'Pet Coke',
    'Merey 16',
    'Brent Blend',
    'Diesel EN590',
    'Logística marítima',
    'Crudo y derivados',
  ],
  authors: [{ name: COMPANY_INFO.name, url: 'https://investoil.es' }],
  creator: COMPANY_INFO.name,
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://investoil.es'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://investoil.es',
    title: `${COMPANY_INFO.name} — ${COMPANY_INFO.tagline}`,
    description: COMPANY_INFO.heroSubtitle,
    siteName: COMPANY_INFO.name,
    images: [
      {
        url: '/images/branding/seal-transparent.png',
        width: 800,
        height: 800,
        alt: COMPANY_INFO.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${COMPANY_INFO.name} — ${COMPANY_INFO.tagline}`,
    description: COMPANY_INFO.heroSubtitle,
    images: ['/images/branding/seal-transparent.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/branding/favicon.png', type: 'image/png' },
    ],
    apple: [{ url: '/images/branding/icon-192.png' }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { getLandingAppearance } from '@/lib/services/content-service';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const appearance = await getLandingAppearance();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY_INFO.name,
    url: 'https://investoil.es',
    logo: 'https://investoil.es/images/branding/logo.png',
    email: COMPANY_INFO.email,
    sameAs: [COMPANY_INFO.linkedin],
    description: COMPANY_INFO.tagline,
  };

  return (
    <html lang="es" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Montserrat:wght@500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-text antialiased selection:bg-accent/30 selection:text-neon">
        <LanguageProvider>
          <AppearanceProvider initialAppearance={appearance}>
            {children}
          </AppearanceProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
