import type { Metadata } from 'next';
import { getServerLanguage } from '@/lib/i18n/server-language';

export const LEGAL_META: Record<string, { es: [string, string]; en: [string, string] }> = {
  'terminos-y-condiciones': {
    es: ['Términos de Uso', 'Condiciones de uso del sitio web de Invest Oil LLC.'],
    en: ['Terms of Use', 'Terms of use of the Invest Oil LLC website.'],
  },
  'aviso-de-privacidad': {
    es: ['Aviso de Privacidad', 'Cómo trata Invest Oil LLC los datos personales y qué derechos tienes.'],
    en: ['Privacy Statement', 'How Invest Oil LLC handles personal data and what rights you have.'],
  },
  'politica-de-cookies': {
    es: ['Aviso de Cookies', 'Cookies y almacenamiento local que utiliza el sitio de Invest Oil LLC.'],
    en: ['Cookie Statement', 'Cookies and local storage used by the Invest Oil LLC website.'],
  },
  'opciones-de-privacidad': {
    es: ['Tus Opciones de Privacidad', 'No vender ni compartir mi información: configuración de cookies y privacidad.'],
    en: ['Your Privacy Choices', 'Do not sell or share my information: cookie settings and privacy choices.'],
  },
  'alerta-de-fraude-y-estafas': {
    es: ['Alerta de Fraude y Estafas', 'Aviso oficial contra fraude y suplantación en el trading petrolero.'],
    en: ['Fraud & Scam Alert', 'Official warning against fraud and impersonation in oil trading.'],
  },
  accesibilidad: {
    es: ['Declaración de Accesibilidad', 'Compromiso de accesibilidad web de Invest Oil LLC.'],
    en: ['Accessibility Statement', 'Web accessibility commitment of Invest Oil LLC.'],
  },
};

export function legalMetadata(slug: string): Metadata {
  const lang = getServerLanguage();
  const [title, description] = LEGAL_META[slug]?.[lang] ?? ['Invest Oil LLC', ''];
  return { title, description };
}
