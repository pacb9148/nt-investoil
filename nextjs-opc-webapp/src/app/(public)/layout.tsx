import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PublicAiOrbe } from '@/components/chat/public-ai-orbe';
import { getLandingHeader, getSectionFromPg } from '@/lib/services/content-service';
import { DEFAULT_SITE_SETTINGS, type SiteSettingsData } from '@/lib/services/site-settings-defaults';
import { DEFAULT_HEADER_DATA } from '@/lib/constants/header-defaults';
import type { HeaderData } from '@/components/admin/content/header-form';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stored = await getLandingHeader();
  const headerConfig: HeaderData =
    stored && Array.isArray(stored.menu_items) && stored.menu_items.length > 0
      ? (stored as HeaderData)
      : DEFAULT_HEADER_DATA;

  const storedSettings = await getSectionFromPg<SiteSettingsData>('site_settings');
  const siteSettings: SiteSettingsData = { ...DEFAULT_SITE_SETTINGS, ...(storedSettings || {}) };

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <Header initialConfig={headerConfig} />
      <main className="flex-1">{children}</main>
      <Footer initialSettings={siteSettings} />
      <PublicAiOrbe />
    </div>
  );
}
