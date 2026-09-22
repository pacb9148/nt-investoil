import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://investoil.es';

  const routes = [
    '',
    '/about',
    '/services',
    '/products',
    '/blog',
    '/contact',
    '/accesibilidad',
    '/terminos-y-condiciones',
    '/aviso-de-privacidad',
    '/politica-de-cookies',
    '/alerta-de-fraude-y-estafas',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route.startsWith('/blog') ? 0.8 : 0.6,
  }));

  return routes;
}
