import { isSupabaseConfigured } from '@/lib/supabase/config';
import { hasPostgresDb, queryPg } from '@/lib/db/pg-client';
import type {
  LandingSectionConfig,
  LandingHeroConfig,
  LandingAppearanceConfig,
  LandingFaqItem,
  SectionBackgroundColors,
  HeroCardCustomization,
} from '@/types/content';

export {
  DEFAULT_HERO_CARD_CUSTOMIZATION,
  DEFAULT_SECTION_BG_COLORS,
  DEFAULT_LANDING_SECTIONS,
  DEFAULT_HERO_CONFIG,
  DEFAULT_APPEARANCE_CONFIG,
} from '@/lib/constants/appearance-defaults';

import {
  DEFAULT_LANDING_SECTIONS,
  DEFAULT_HERO_CONFIG,
  DEFAULT_APPEARANCE_CONFIG,
} from '@/lib/constants/appearance-defaults';

function resolveDataDir(): string {
  const fs = require('fs');
  const path = require('path');
  const candidates = [
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../../../data'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  const fallback = fs.existsSync(path.join(process.cwd(), 'nextjs-opc-webapp'))
    ? path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data')
    : path.join(process.cwd(), 'src', 'data');
  try {
    fs.mkdirSync(fallback, { recursive: true });
  } catch {}
  return fallback;
}

export function readLocalJson<T>(filename: string, fallback: T): T {
  if (typeof window !== 'undefined') return fallback;
  try {
    const fs = require('fs');
    const path = require('path');
    const dir = resolveDataDir();
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (e) {
    console.error(`[content-service] Error reading ${filename}:`, e);
  }
  return fallback;
}

export function writeLocalJson(filename: string, data: any): void {
  if (typeof window !== 'undefined') return;
  try {
    const fs = require('fs');
    const path = require('path');
    const dir = resolveDataDir();
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`[content-service] Error writing ${filename}:`, e);
  }
}

// Helpers para PostgreSQL landing_sections
async function getSectionFromPg<T>(sectionId: string): Promise<T | null> {
  if (!hasPostgresDb()) return null;
  try {
    const res = await queryPg('SELECT content FROM public.landing_sections WHERE id = $1', [sectionId]);
    if (res && res.rows.length > 0 && res.rows[0].content) {
      return res.rows[0].content as T;
    }
  } catch (err) {
    console.warn(`[content-service] Error reading ${sectionId} from pg:`, err);
  }
  return null;
}

async function saveSectionToPg(sectionId: string, content: any): Promise<void> {
  if (!hasPostgresDb()) return;
  try {
    await queryPg(
      `INSERT INTO public.landing_sections (id, content, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
      [sectionId, JSON.stringify(content)]
    );
  } catch (err) {
    console.warn(`[content-service] Error saving ${sectionId} to pg:`, err);
  }
}

export async function getSectionContent<T>(sectionKey: string, fallback: T): Promise<T> {
  const pgData = await getSectionFromPg<T>(sectionKey);
  if (pgData !== null && pgData !== undefined) {
    return pgData;
  }
  return readLocalJson<T>(`${sectionKey}.json`, fallback);
}

export async function saveSectionContent<T>(sectionKey: string, data: T): Promise<T> {
  writeLocalJson(`${sectionKey}.json`, data);
  await saveSectionToPg(sectionKey, data);
  return data;
}

// Almacén fallback local inicializado desde JSON o valores por defecto
let memorySections = [...DEFAULT_LANDING_SECTIONS];
let memoryHero = readLocalJson<LandingHeroConfig>('hero.json', { ...DEFAULT_HERO_CONFIG });
let memoryAppearance = readLocalJson<LandingAppearanceConfig>('appearance.json', { ...DEFAULT_APPEARANCE_CONFIG });

// ==============================================================================
// 1. SECCIONES GENERALES
// ==============================================================================
export async function getLandingSections(): Promise<LandingSectionConfig[]> {
  const pgData = await getSectionFromPg<LandingSectionConfig[]>('sections');
  if (pgData && Array.isArray(pgData) && pgData.length > 0) {
    return pgData;
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_sections').select('*').order('sort_order');
      if (!error && data && data.length > 0) {
        return data as LandingSectionConfig[];
      }
    } catch {
      // Supabase no disponible o tabla no creada aún
    }
  }
  return memorySections;
}

// ==============================================================================
// 2. HERO PRINCIPAL & TARJETA
// ==============================================================================
export async function getLandingHero(): Promise<LandingHeroConfig> {
  const localData = readLocalJson<LandingHeroConfig>('hero.json', { ...DEFAULT_HERO_CONFIG });

  const pgData = await getSectionFromPg<LandingHeroConfig>('hero');
  if (pgData) {
    return { ...localData, ...pgData };
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_hero').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return { ...localData, ...(data as LandingHeroConfig) };
      }
    } catch {
      // Fallback
    }
  }
  return localData;
}

// ==============================================================================
// 3. APARIENCIA & PALETA
// ==============================================================================
export async function getLandingAppearance(): Promise<LandingAppearanceConfig> {
  const localData = readLocalJson<LandingAppearanceConfig>('appearance.json', { ...DEFAULT_APPEARANCE_CONFIG });

  const pgData = await getSectionFromPg<LandingAppearanceConfig>('appearance');
  if (pgData) {
    return { ...localData, ...pgData };
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_site_appearance').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return { ...localData, ...(data as LandingAppearanceConfig) };
      }
    } catch {
      // Fallback
    }
  }
  return localData;
}

// ==============================================================================
// 4. CABECERA & MENÚ (landing_header)
// ==============================================================================
export async function getLandingHeader(): Promise<any> {
  const local = readLocalJson<any>('header.json', {
    logo_url: '/images/branding/corporate-card-logo.jpeg',
    logo_text: 'INVEST OIL',
    logo_tagline: 'Trading Company',
    menu_items: [],
  });

  const pgData = await getSectionFromPg<any>('header');
  if (pgData) {
    return { ...local, ...pgData };
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_header').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return { ...local, ...data };
      }
    } catch {}
  }

  return local;
}

export async function saveLandingHeader(data: any): Promise<any> {
  writeLocalJson('header.json', data);
  await saveSectionToPg('header', data);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_header').upsert({
        id: 1,
        logo_url: data.logo_url || '/images/branding/corporate-card-logo.jpeg',
        logo_text: data.logo_text || 'INVEST OIL',
        logo_tagline: data.logo_tagline || 'Trading Company',
        menu_items: data.menu_items || [],
        action_button: data.action_button || {},
        backoffice_button: data.backoffice_button || {},
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[content-service] Supabase saveLandingHeader fallback:', e);
    }
  }

  return data;
}

// ==============================================================================
// 5. PÁGINA NOSOTROS (/about) (landing_about)
// ==============================================================================
export async function getLandingAbout(): Promise<any> {
  const local = readLocalJson<any>('about.json', {});

  const pgData = await getSectionFromPg<any>('about');
  if (pgData) {
    return { ...local, ...pgData };
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_about').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return { ...local, ...data };
      }
    } catch {}
  }

  return local;
}

export async function saveLandingAbout(data: any): Promise<any> {
  writeLocalJson('about.json', data);
  await saveSectionToPg('about', data);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_about').upsert({
        id: 1,
        badge: data.badge,
        badge_en: data.badge_en,
        title: data.title,
        title_en: data.title_en,
        tagline: data.tagline,
        tagline_en: data.tagline_en,
        story_paragraphs: data.story_paragraphs,
        story_paragraphs_en: data.story_paragraphs_en,
        mission_vision: data.mission_vision,
        values: data.values,
        stats: data.stats,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[content-service] Supabase saveLandingAbout fallback:', e);
    }
  }

  return data;
}

// ==============================================================================
// 6. PIE DE PÁGINA & SEDES (landing_footer)
// ==============================================================================
export async function getLandingFooter(): Promise<any> {
  const local = readLocalJson<any>('footer.json', {});

  const pgData = await getSectionFromPg<any>('footer');
  if (pgData) {
    return { ...local, ...pgData };
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_footer').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return { ...local, ...data };
      }
    } catch {}
  }

  return local;
}

export async function saveLandingFooter(data: any): Promise<any> {
  writeLocalJson('footer.json', data);
  await saveSectionToPg('footer', data);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_footer').upsert({
        id: 1,
        brand: data.brand || {},
        columns: data.columns || [],
        headquarters: data.headquarters || [],
        social_links: data.social_links || [],
        legal_notice: data.legal_notice,
        copyright: data.copyright,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[content-service] Supabase saveLandingFooter fallback:', e);
    }
  }

  return data;
}

// ==============================================================================
// 7. SEO & REDES SOCIALES (landing_seo)
// ==============================================================================
export async function getLandingSeo(): Promise<any> {
  const local = readLocalJson<any>('seo.json', {});

  const pgData = await getSectionFromPg<any>('seo');
  if (pgData) {
    return { ...local, ...pgData };
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_seo').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return { ...local, ...data };
      }
    } catch {}
  }

  return local;
}

export async function saveLandingSeo(data: any): Promise<any> {
  writeLocalJson('seo.json', data);
  await saveSectionToPg('seo', data);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_seo').upsert({
        id: 1,
        site_name: data.site_name,
        title_template: data.title_template,
        default_meta_description: data.default_meta_description,
        default_og_image: data.default_og_image,
        twitter_handle: data.twitter_handle,
        keywords: data.keywords,
        canonical_url: data.canonical_url,
        robots_txt: data.robots_txt,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[content-service] Supabase saveLandingSeo fallback:', e);
    }
  }

  return data;
}

// Helpers para actualizar el fallback local con persistencia en archivo y PostgreSQL
export async function updateMemorySection(id: string, isActive: boolean) {
  memorySections = memorySections.map((s) => (s.id === id ? { ...s, is_active: isActive } : s));
  writeLocalJson('sections.json', memorySections);
  await saveSectionToPg('sections', memorySections);
}

export async function updateMemoryHero(data: Partial<LandingHeroConfig>) {
  memoryHero = { ...memoryHero, ...data };
  writeLocalJson('hero.json', memoryHero);
  await saveSectionToPg('hero', memoryHero);
}

export async function updateMemoryAppearance(data: Partial<LandingAppearanceConfig>) {
  memoryAppearance = { ...memoryAppearance, ...data };
  writeLocalJson('appearance.json', memoryAppearance);
  await saveSectionToPg('appearance', memoryAppearance);
}
