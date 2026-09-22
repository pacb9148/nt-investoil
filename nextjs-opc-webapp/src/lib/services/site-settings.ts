'use client';

import { useState, useEffect } from 'react';
import { INVESTOIL_OFFICES, type OfficeLocation } from '@/lib/constants/investoil';

export interface SiteSettingsData {
  companyName: string;
  email: string;
  copyright: string;
  offices: OfficeLocation[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  companyName: 'Invest Oil LLC',
  email: 'info@investoil.es',
  copyright: '© 2026 Invest Oil LLC. Todos los derechos reservados.',
  offices: INVESTOIL_OFFICES,
};

const STORAGE_KEY = 'investoil_site_settings';

export function getClientSiteSettings(): SiteSettingsData {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      companyName: parsed.companyName || DEFAULT_SITE_SETTINGS.companyName,
      email: parsed.email || DEFAULT_SITE_SETTINGS.email,
      copyright: parsed.copyright || DEFAULT_SITE_SETTINGS.copyright,
      offices: Array.isArray(parsed.offices) && parsed.offices.length > 0 ? parsed.offices : DEFAULT_SITE_SETTINGS.offices,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export function saveClientSiteSettings(settings: SiteSettingsData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(
      new CustomEvent('investoil_settings_updated', { detail: settings })
    );
  } catch (err) {
    console.error('Error al guardar ajustes en localStorage:', err);
  }
}

// Hook reactivo para componentes cliente (como Footer y Admin)
export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    // 1. Cargar inmediato de localStorage
    const local = getClientSiteSettings();
    setSettings(local);

    // 2. Sincronizar desde API
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.offices) {
          setSettings(data);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    // 3. Escuchar evento en tiempo real
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<SiteSettingsData>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
      }
    };

    window.addEventListener('investoil_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('investoil_settings_updated', handleUpdate);
    };
  }, []);

  return settings;
}
