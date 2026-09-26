import type { Metadata } from 'next';
import './globals.css';
import { COMPANY_INFO } from '@/lib/constants/investoil';
import { LanguageProvider } from '@/lib/i18n/language-context';
import { AppearanceProvider } from '@/components/layout/appearance-provider';
import { getLandingAppearance, getLandingSeo } from '@/lib/services/content-service';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getLandingSeo();

  const title = seo.meta_title || `${COMPANY_INFO.name} — ${COMPANY_INFO.tagline}`;
  const description = seo.meta_description || `${COMPANY_INFO.tagline}. ${COMPANY_INFO.heroSubtitle}`;
  const canonicalUrl = seo.canonical_url || process.env.NEXT_PUBLIC_APP_URL || 'https://investoil.es';
  const ogImageUrl = seo.og_image || '/images/branding/corporate-card-logo.jpeg';
  const keywords = typeof seo.keywords === 'string'
    ? seo.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [
        'Invest Oil LLC',
        'Trading petrolero Delaware',
        'Pet Coke',
        'Merey 16',
        'Brent Blend',
        'Diesel EN590',
        'Jet Fuel A1',
        'Fletamento marítimo',
        'Crudo y derivados',
      ];

  return {
    title: {
      default: title,
      template: `%s | ${seo.brand_name || COMPANY_INFO.name}`,
    },
    description,
    keywords,
    authors: [{ name: seo.legal_name || COMPANY_INFO.name, url: canonicalUrl }],
    creator: seo.legal_name || COMPANY_INFO.name,
    metadataBase: new URL(canonicalUrl),
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonicalUrl,
      title,
      description,
      siteName: seo.brand_name || COMPANY_INFO.name,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${seo.legal_name || COMPANY_INFO.name} — Delaware, USA`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/images/branding/favicon.png', type: 'image/png' },
      ],
      apple: [{ url: '/images/branding/icon-192.png' }],
    },
    robots: {
      index: !seo.robots || !seo.robots.includes('noindex'),
      follow: !seo.robots || !seo.robots.includes('nofollow'),
    },
    verification: {
      google: seo.google_site_verification || undefined,
    },
    other: {
      'geo.region': seo.geo_region || 'US-DE',
      'geo.placename': seo.geo_placename || 'Delaware, United States',
      'corporate:jurisdiction': seo.jurisdiction || 'Delaware, United States',
      'corporate:legalName': seo.legal_name || 'Invest Oil LLC',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [appearance, seo] = await Promise.all([
    getLandingAppearance(),
    getLandingSeo(),
  ]);

  const canonicalUrl = seo.canonical_url || 'https://investoil.es';
  const ogImageUrl = seo.og_image?.startsWith('http')
    ? seo.og_image
    : `${canonicalUrl}${seo.og_image || '/images/branding/corporate-card-logo.jpeg'}`;

  // Schema.org Corporativo Institucional (Desambiguación Delaware USA para Google e IA)
  const corporateEmail =
    seo.contact_email &&
    seo.contact_email !== 'contacto@investoil.es' &&
    seo.contact_email !== 'trading@investoil.es'
      ? seo.contact_email
      : 'info@investoil.es';

  const corporateJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Corporation', 'Organization'],
    '@id': `${canonicalUrl}/#organization`,
    name: seo.brand_name || 'Invest Oil',
    legalName: seo.legal_name || 'Invest Oil LLC',
    alternateName: ['Invest Oil', 'InvestOil LLC', 'Invest Oil Delaware'],
    url: canonicalUrl,
    logo: `${canonicalUrl}/images/branding/logo.png`,
    image: ogImageUrl,
    description: seo.meta_description || COMPANY_INFO.tagline,
    disambiguatingDescription:
      seo.disambiguation_note ||
      'Invest Oil LLC es una corporación registrada en Delaware, Estados Unidos, dedicada a la comercialización internacional de petróleo y derivados, sin vínculo alguno con entidades de Valencia o del sector inmobiliario.',
    address: {
      '@type': 'PostalAddress',
      addressRegion: seo.legal_address?.region || 'Delaware',
      addressCountry: seo.legal_address?.country_code || 'US',
    },
    location: Array.isArray(seo.operating_hubs)
      ? seo.operating_hubs.map((hub: any) => ({
          '@type': 'Place',
          name: `${hub.city} — ${hub.role}`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: hub.city,
            ...(hub.state ? { addressRegion: hub.state } : {}),
            addressCountry: hub.country,
            streetAddress: hub.address,
          },
        }))
      : [
          {
            '@type': 'Place',
            name: 'Delaware Registered Corporate Headquarters',
            address: {
              '@type': 'PostalAddress',
              addressRegion: 'DE',
              addressCountry: 'US',
            },
          },
        ],
    areaServed: 'Global',
    knowsAbout: [
      'Crude Oil Trading',
      'Petroleum Refined Products',
      'Jet Fuel A1',
      'Diesel EN590',
      'Maritime Freight Chartering',
      'Pet Coke',
      'Energy Commodities Facilitation',
    ],
    email: corporateEmail,
    telephone: seo.telephone || undefined,
    sameAs: seo.linkedin_url ? [seo.linkedin_url] : [COMPANY_INFO.linkedin],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(corporateJsonLd) }}
        />
        {seo.custom_head_scripts && (
          <script
            dangerouslySetInnerHTML={{ __html: seo.custom_head_scripts }}
          />
        )}
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
