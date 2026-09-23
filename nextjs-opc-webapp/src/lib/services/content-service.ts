import { isSupabaseConfigured } from '@/lib/supabase/config';
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

function readLocalJson<T>(filename: string, fallback: T): T {
  if (typeof window !== 'undefined') return fallback;
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // Fallback
  }
  return fallback;
}

function writeLocalJson(filename: string, data: any): void {
  if (typeof window !== 'undefined') return;
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'src', 'data', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Fallback
  }
}

// Almacén fallback local inicializado desde JSON o valores por defecto
let memorySections = [...DEFAULT_LANDING_SECTIONS];
let memoryHero = readLocalJson<LandingHeroConfig>('hero.json', { ...DEFAULT_HERO_CONFIG });
let memoryAppearance = readLocalJson<LandingAppearanceConfig>('appearance.json', { ...DEFAULT_APPEARANCE_CONFIG });

export async function getLandingSections(): Promise<LandingSectionConfig[]> {
  if (!isSupabaseConfigured()) {
    return memorySections;
  }
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
  return memorySections;
}

export async function getLandingHero(): Promise<LandingHeroConfig> {
  if (!isSupabaseConfigured()) {
    return readLocalJson<LandingHeroConfig>('hero.json', memoryHero);
  }
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const db = createAdminClient();
    const { data, error } = await db.from('landing_hero').select('*').limit(1).maybeSingle();
    if (!error && data) {
      return data as LandingHeroConfig;
    }
  } catch {
    // Fallback
  }
  return readLocalJson<LandingHeroConfig>('hero.json', memoryHero);
}

export async function getLandingAppearance(): Promise<LandingAppearanceConfig> {
  if (!isSupabaseConfigured()) {
    return readLocalJson<LandingAppearanceConfig>('appearance.json', memoryAppearance);
  }
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const db = createAdminClient();
    const { data, error } = await db.from('landing_site_appearance').select('*').limit(1).maybeSingle();
    if (!error && data) {
      return data as LandingAppearanceConfig;
    }
  } catch {
    // Fallback
  }
  return readLocalJson<LandingAppearanceConfig>('appearance.json', memoryAppearance);
}

// Helpers para actualizar el fallback local con persistencia en archivo
export function updateMemorySection(id: string, isActive: boolean) {
  memorySections = memorySections.map((s) => (s.id === id ? { ...s, is_active: isActive } : s));
}

export function updateMemoryHero(data: Partial<LandingHeroConfig>) {
  memoryHero = { ...memoryHero, ...data };
  writeLocalJson('hero.json', memoryHero);
}

export function updateMemoryAppearance(data: Partial<LandingAppearanceConfig>) {
  memoryAppearance = { ...memoryAppearance, ...data };
  writeLocalJson('appearance.json', memoryAppearance);
}
