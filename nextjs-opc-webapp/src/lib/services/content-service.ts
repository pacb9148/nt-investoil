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
export async function getSectionFromPg<T>(sectionId: string): Promise<T | null> {
  if (!hasPostgresDb()) return null;
  try {
    const res = await queryPg('SELECT content FROM landing_sections WHERE id = $1', [sectionId]);
    if (res && res.rows.length > 0 && res.rows[0].content) {
      return res.rows[0].content as T;
    }
  } catch (err) {
    console.warn(`[content-service] Error reading ${sectionId} from pg:`, err);
  }
  return null;
}

export async function saveSectionToPg(sectionId: string, content: any): Promise<void> {
  if (!hasPostgresDb()) return;
  try {
    await queryPg(
      `INSERT INTO landing_sections (id, content, updated_at)
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

  const local = readLocalJson<LandingSectionConfig[]>('sections.json', DEFAULT_LANDING_SECTIONS);
  if (local && Array.isArray(local) && local.length > 0) {
    return local;
  }

  return DEFAULT_LANDING_SECTIONS;
}

// ==============================================================================
// 2. HERO PRINCIPAL & TARJETA
// ==============================================================================
// ==============================================================================
// 2. HERO PRINCIPAL & TARJETA
// ==============================================================================
export async function getLandingHero(): Promise<LandingHeroConfig> {
  const pgData = await getSectionFromPg<LandingHeroConfig>('hero');
  if (pgData) {
    return { ...DEFAULT_HERO_CONFIG, ...pgData };
  }

  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_hero WHERE id = 1');
      if (res && res.rows.length > 0) {
        return { ...DEFAULT_HERO_CONFIG, ...res.rows[0] };
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_hero').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return { ...DEFAULT_HERO_CONFIG, ...(data as LandingHeroConfig) };
      }
    } catch {}
  }

  return readLocalJson<LandingHeroConfig>('hero.json', { ...DEFAULT_HERO_CONFIG });
}

// ==============================================================================
// 3. APARIENCIA & PALETA
// ==============================================================================
export async function getLandingAppearance(): Promise<LandingAppearanceConfig> {
  const pgData = await getSectionFromPg<LandingAppearanceConfig>('appearance');
  if (pgData) {
    return { ...DEFAULT_APPEARANCE_CONFIG, ...pgData };
  }

  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_site_appearance WHERE id = 1');
      if (res && res.rows.length > 0) {
        return { ...DEFAULT_APPEARANCE_CONFIG, ...res.rows[0] };
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_site_appearance').select('*').limit(1).maybeSingle();
      if (!error && data) {
        return { ...DEFAULT_APPEARANCE_CONFIG, ...(data as LandingAppearanceConfig) };
      }
    } catch {}
  }

  return readLocalJson<LandingAppearanceConfig>('appearance.json', { ...DEFAULT_APPEARANCE_CONFIG });
}

// ==============================================================================
// 4. CABECERA & MENÚ (landing_header)
// ==============================================================================
export async function getLandingHeader(): Promise<any> {
  const defaultHeader = {
    logo_url: '/images/branding/oil-drop-logo.png',
    logo_text: 'INVEST OIL',
    logo_tagline: 'Petroleum and Derivates Markets',
    menu_items: [],
  };

  const pgData = await getSectionFromPg<any>('header');
  if (pgData) {
    return { ...defaultHeader, ...pgData };
  }

  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_header WHERE id = 1');
      if (res && res.rows.length > 0) {
        return { ...defaultHeader, ...res.rows[0] };
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_header').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return { ...defaultHeader, ...data };
      }
    } catch {}
  }

  return readLocalJson<any>('header.json', defaultHeader);
}

export async function saveLandingHeader(data: any): Promise<any> {
  writeLocalJson('header.json', data);
  await saveSectionToPg('header', data);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_header (id, logo_url, logo_text, logo_tagline, menu_items, action_button, backoffice_button, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           logo_url = EXCLUDED.logo_url,
           logo_text = EXCLUDED.logo_text,
           logo_tagline = EXCLUDED.logo_tagline,
           menu_items = EXCLUDED.menu_items,
           action_button = EXCLUDED.action_button,
           backoffice_button = EXCLUDED.backoffice_button,
           updated_at = NOW()`,
        [
          data.logo_url || '/images/branding/oil-drop-logo.png',
          data.logo_text || 'INVEST OIL',
          data.logo_tagline || 'Petroleum and Derivates Markets',
          JSON.stringify(data.menu_items || []),
          JSON.stringify(data.action_button || {}),
          JSON.stringify(data.backoffice_button || {}),
        ]
      );
    } catch (e) {
      console.warn('[content-service] PostgreSQL saveLandingHeader fallback:', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_header').upsert({
        id: 1,
        logo_url: data.logo_url !== undefined ? data.logo_url : '/images/branding/oil-drop-logo.png',
        logo_text: data.logo_text || 'INVEST OIL',
        logo_tagline: data.logo_tagline || 'Petroleum and Derivates Markets',
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
  const pgData = await getSectionFromPg<any>('about');
  if (pgData) {
    return pgData;
  }

  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_about WHERE id = 1');
      if (res && res.rows.length > 0) {
        return res.rows[0];
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_about').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return data;
      }
    } catch {}
  }

  return readLocalJson<any>('about.json', {});
}

export async function saveLandingAbout(data: any): Promise<any> {
  writeLocalJson('about.json', data);
  await saveSectionToPg('about', data);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_about (id, badge, badge_en, title, title_en, tagline, tagline_en, story_paragraphs, story_paragraphs_en, mission_vision, values, stats, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO UPDATE SET
           badge = EXCLUDED.badge,
           badge_en = EXCLUDED.badge_en,
           title = EXCLUDED.title,
           title_en = EXCLUDED.title_en,
           tagline = EXCLUDED.tagline,
           tagline_en = EXCLUDED.tagline_en,
           story_paragraphs = EXCLUDED.story_paragraphs,
           story_paragraphs_en = EXCLUDED.story_paragraphs_en,
           mission_vision = EXCLUDED.mission_vision,
           values = EXCLUDED.values,
           stats = EXCLUDED.stats,
           updated_at = NOW()`,
        [
          data.badge || null,
          data.badge_en || null,
          data.title || 'Invest Oil LLC',
          data.title_en || null,
          data.tagline || '',
          data.tagline_en || null,
          JSON.stringify(data.story_paragraphs || []),
          JSON.stringify(data.story_paragraphs_en || []),
          JSON.stringify(data.mission_vision || []),
          JSON.stringify(data.values || []),
          JSON.stringify(data.stats || []),
        ]
      );
    } catch (e) {
      console.warn('[content-service] PostgreSQL saveLandingAbout error:', e);
    }
  }

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
  const pgData = await getSectionFromPg<any>('footer');
  if (pgData) {
    return pgData;
  }

  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_footer WHERE id = 1');
      if (res && res.rows.length > 0) {
        return res.rows[0];
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_footer').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        return data;
      }
    } catch {}
  }

  return readLocalJson<any>('footer.json', {});
}

export async function saveLandingFooter(data: any): Promise<any> {
  writeLocalJson('footer.json', data);
  await saveSectionToPg('footer', data);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_footer (id, brand, columns, headquarters, social_links, legal_notice, copyright, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           brand = EXCLUDED.brand,
           columns = EXCLUDED.columns,
           headquarters = EXCLUDED.headquarters,
           social_links = EXCLUDED.social_links,
           legal_notice = EXCLUDED.legal_notice,
           copyright = EXCLUDED.copyright,
           updated_at = NOW()`,
        [
          JSON.stringify(data.brand || {}),
          JSON.stringify(data.columns || []),
          JSON.stringify(data.headquarters || data.offices || []),
          JSON.stringify(data.social_links || data.social || []),
          data.legal_notice || null,
          data.copyright || null,
        ]
      );
    } catch (e) {
      console.warn('[content-service] PostgreSQL saveLandingFooter error:', e);
    }
  }

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
  let seoData = await getSectionFromPg<any>('seo');
  if (!seoData && hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_seo WHERE id = 1');
      if (res && res.rows.length > 0) {
        seoData = res.rows[0];
      }
    } catch {}
  }

  if (!seoData && isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      const { data, error } = await db.from('landing_seo').select('*').eq('id', 1).maybeSingle();
      if (!error && data) {
        seoData = data;
      }
    } catch {}
  }

  if (!seoData) {
    seoData = readLocalJson<any>('seo.json', {});
  }

  // Sanitización estricta: asegurar que emails antiguos nunca se filtren
  if (seoData) {
    if (seoData.contact_email === 'contacto@investoil.es' || seoData.contact_email === 'trading@investoil.es') {
      seoData.contact_email = 'info@investoil.es';
    }
    if (seoData.business_email === 'contacto@investoil.es' || seoData.business_email === 'trading@investoil.es') {
      seoData.business_email = 'business@investoil.es';
    }
  }

  return seoData;
}

export async function saveLandingSeo(data: any): Promise<any> {
  // Asegurar emails canónicos
  if (data.contact_email === 'contacto@investoil.es' || data.contact_email === 'trading@investoil.es') {
    data.contact_email = 'info@investoil.es';
  }
  if (data.business_email === 'contacto@investoil.es' || data.business_email === 'trading@investoil.es') {
    data.business_email = 'business@investoil.es';
  }

  writeLocalJson('seo.json', data);
  await saveSectionToPg('seo', data);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_seo (id, site_name, title_template, default_meta_description, default_og_image, twitter_handle, keywords, canonical_url, robots_txt, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           site_name = EXCLUDED.site_name,
           title_template = EXCLUDED.title_template,
           default_meta_description = EXCLUDED.default_meta_description,
           default_og_image = EXCLUDED.default_og_image,
           twitter_handle = EXCLUDED.twitter_handle,
           keywords = EXCLUDED.keywords,
           canonical_url = EXCLUDED.canonical_url,
           robots_txt = EXCLUDED.robots_txt,
           updated_at = NOW()`,
        [
          data.site_name || 'Invest Oil LLC',
          data.title_template || '%s | Invest Oil LLC',
          data.default_meta_description || data.meta_description || '',
          data.default_og_image || data.og_image || '/images/branding/oil-drop-logo.png',
          data.twitter_handle || null,
          JSON.stringify(data.keywords || []),
          data.canonical_url || 'https://investoil.es',
          data.robots_txt || null,
        ]
      );
    } catch (e) {
      console.warn('[content-service] PostgreSQL saveLandingSeo error:', e);
    }
  }

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
  const currentSections = await getLandingSections();
  const updated = currentSections.map((s) => (s.id === id ? { ...s, is_active: isActive } : s));
  memorySections = updated;
  writeLocalJson('sections.json', updated);
  await saveSectionToPg('sections', updated);
}

export async function updateMemoryHero(data: Partial<LandingHeroConfig>) {
  const current = await getLandingHero();
  memoryHero = { ...current, ...data };
  writeLocalJson('hero.json', memoryHero);
  await saveSectionToPg('hero', memoryHero);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_hero (id, eyebrow_text, eyebrow_text_en, headline_line1, headline_line1_en, headline_highlight, headline_highlight_en, headline_line2, headline_line2_en, description, description_en, primary_cta_text, primary_cta_text_en, primary_cta_url, secondary_cta_text, secondary_cta_text_en, secondary_cta_url, background_type, background_video_url, background_image_url, background_overlay_opacity, side_card_type, side_card_custom_image, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
         ON CONFLICT (id) DO UPDATE SET
           eyebrow_text = EXCLUDED.eyebrow_text,
           eyebrow_text_en = EXCLUDED.eyebrow_text_en,
           headline_line1 = EXCLUDED.headline_line1,
           headline_line1_en = EXCLUDED.headline_line1_en,
           headline_highlight = EXCLUDED.headline_highlight,
           headline_highlight_en = EXCLUDED.headline_highlight_en,
           headline_line2 = EXCLUDED.headline_line2,
           headline_line2_en = EXCLUDED.headline_line2_en,
           description = EXCLUDED.description,
           description_en = EXCLUDED.description_en,
           primary_cta_text = EXCLUDED.primary_cta_text,
           primary_cta_text_en = EXCLUDED.primary_cta_text_en,
           primary_cta_url = EXCLUDED.primary_cta_url,
           secondary_cta_text = EXCLUDED.secondary_cta_text,
           secondary_cta_text_en = EXCLUDED.secondary_cta_text_en,
           secondary_cta_url = EXCLUDED.secondary_cta_url,
           background_type = EXCLUDED.background_type,
           background_video_url = EXCLUDED.background_video_url,
           background_image_url = EXCLUDED.background_image_url,
           background_overlay_opacity = EXCLUDED.background_overlay_opacity,
           side_card_type = EXCLUDED.side_card_type,
           side_card_custom_image = EXCLUDED.side_card_custom_image,
           updated_at = NOW()`,
        [
          memoryHero.eyebrow_text || null,
          memoryHero.eyebrow_text_en || null,
          memoryHero.heading_line_1 || 'CONEXIONES GLOBALES EN EL',
          memoryHero.heading_line_1_en || null,
          memoryHero.heading_accent || 'MERCADO PETROLERO',
          memoryHero.heading_accent_en || null,
          memoryHero.heading_line_2 || 'Y SUS DERIVADOS',
          memoryHero.heading_line_2_en || null,
          memoryHero.subtitle || '',
          memoryHero.subtitle_en || null,
          memoryHero.cta_primary_text || 'Contactar Especialista',
          memoryHero.cta_primary_text_en || null,
          memoryHero.cta_primary_url || '#contact',
          memoryHero.cta_secondary_text || 'Ver Productos',
          memoryHero.cta_secondary_text_en || null,
          memoryHero.cta_secondary_url || '#products',
          memoryHero.hero_bg_type || 'video',
          memoryHero.hero_bg_type === 'video' ? memoryHero.hero_bg_url : '/videos/hero-background.mp4',
          memoryHero.hero_bg_type === 'image' ? memoryHero.hero_bg_url : null,
          memoryHero.hero_bg_opacity ?? 45,
          memoryHero.hero_card?.logo_url ? 'trading_seal' : 'stats',
          memoryHero.hero_card?.logo_url || null,
        ]
      );
    } catch (e) {
      console.warn('[content-service] PostgreSQL updateMemoryHero error:', e);
    }
  }
}

export async function updateMemoryAppearance(data: Partial<LandingAppearanceConfig>) {
  const current = await getLandingAppearance();
  memoryAppearance = { ...current, ...data };
  writeLocalJson('appearance.json', memoryAppearance);
  await saveSectionToPg('appearance', memoryAppearance);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO landing_site_appearance (id, primary_color, secondary_color, accent_color, font_family, border_radius, custom_css, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           primary_color = EXCLUDED.primary_color,
           secondary_color = EXCLUDED.secondary_color,
           accent_color = EXCLUDED.accent_color,
           font_family = EXCLUDED.font_family,
           border_radius = EXCLUDED.border_radius,
           custom_css = EXCLUDED.custom_css,
           updated_at = NOW()`,
        [
          memoryAppearance.primary_color || '#f59e0b',
          '#0f172a',
          '#10b981',
          memoryAppearance.font_heading || 'Outfit',
          '0.5rem',
          memoryAppearance.custom_css || null,
        ]
      );
    } catch (e) {
      console.warn('[content-service] PostgreSQL updateMemoryAppearance error:', e);
    }
  }
}
