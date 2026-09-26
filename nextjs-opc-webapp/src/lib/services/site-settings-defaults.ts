import { INVESTOIL_OFFICES, type OfficeLocation } from '@/lib/constants/investoil';

export interface SiteSettingsData {
  companyName: string;
  email: string;
  schedule?: string;
  copyright: string;
  copyrightEn?: string;
  footerLogoUrl?: string;
  footerTagline?: string;
  footerTaglineEn?: string;
  linkedinUrl?: string;
  certificationsText?: string;
  offices: OfficeLocation[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  companyName: 'Invest Oil LLC',
  email: 'info@investoil.es',
  schedule: '24/7 Global Operations & Logistics',
  copyright: '© 2026 Invest Oil LLC. Todos los derechos reservados.',
  copyrightEn: '© 2026 Invest Oil LLC. All Rights Reserved.',
  footerLogoUrl: '/images/branding/oil-drop-logo.png',
  footerTagline: 'Compañía internacional de comercio de petróleo y derivados, fletamento marítimo e infraestructura energética.',
  footerTaglineEn: 'International company for the trading of crude oil and petroleum derivatives, marine chartering and energy infrastructure.',
  linkedinUrl: 'https://linkedin.com/company/invest-oil-llc',
  certificationsText: 'ASTM D1655 / GOST COMPLIANT · INCOTERMS 2020 · SGS & INTERTEK VERIFIED',
  offices: INVESTOIL_OFFICES,
};

