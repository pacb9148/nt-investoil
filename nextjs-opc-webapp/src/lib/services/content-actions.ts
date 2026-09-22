'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  updateMemorySection,
  updateMemoryHero,
  updateMemoryAppearance,
} from './content-service';
import type {
  ContentActionResponse,
  HeroBgType,
  HeroVisualType,
} from '@/types/content';

export async function toggleSectionAction(
  id: string,
  isActive: boolean
): Promise<ContentActionResponse> {
  updateMemorySection(id, isActive);

  try {
    const db = createAdminClient();
    const { error } = await db
      .from('landing_sections')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      console.warn('Supabase toggleSection warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase toggleSection connection fallback');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content');
  return { success: true, message: `Sección ${id} actualizada a ${isActive ? 'Visible' : 'Oculta'}` };
}

export async function updateHeroAction(
  _prev: ContentActionResponse,
  formData: FormData
): Promise<ContentActionResponse> {
  const data = {
    eyebrow_text: formData.get('eyebrow_text') as string,
    eyebrow_text_en: formData.get('eyebrow_text_en') as string,
    heading_line_1: formData.get('heading_line_1') as string,
    heading_line_1_en: formData.get('heading_line_1_en') as string,
    heading_line_2: formData.get('heading_line_2') as string,
    heading_line_2_en: formData.get('heading_line_2_en') as string,
    heading_accent: formData.get('heading_accent') as string,
    heading_accent_en: formData.get('heading_accent_en') as string,
    subtitle: formData.get('subtitle') as string,
    subtitle_en: formData.get('subtitle_en') as string,
    cta_primary_text: formData.get('cta_primary_text') as string,
    cta_primary_text_en: formData.get('cta_primary_text_en') as string,
    cta_primary_url: formData.get('cta_primary_url') as string,
    cta_secondary_text: formData.get('cta_secondary_text') as string,
    cta_secondary_text_en: formData.get('cta_secondary_text_en') as string,
    cta_secondary_url: formData.get('cta_secondary_url') as string,
    hero_bg_type: (formData.get('hero_bg_type') || 'gradient') as HeroBgType,
    hero_bg_url: (formData.get('hero_bg_url') || '') as string,
    hero_bg_fit: (formData.get('hero_bg_fit') || 'cover') as 'cover' | 'contain' | 'fill',
    hero_bg_position: (formData.get('hero_bg_position') || 'center center') as string,
    hero_bg_opacity: Number(formData.get('hero_bg_opacity') || 20),
    hero_bg_blur: Number(formData.get('hero_bg_blur') || 0),
    hero_visual_tipo: (formData.get('hero_visual_tipo') || 'mockup') as HeroVisualType,
    hero_visual_url: (formData.get('hero_visual_url') || '') as string,
    market_ticker: formData.get('market_ticker') as string,
    updated_at: new Date().toISOString(),
  };

  updateMemoryHero(data);

  try {
    const db = createAdminClient();
    const { error } = await db.from('landing_hero').upsert({ id: 1, ...data });
    if (error) {
      console.warn('Supabase updateHero warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase updateHero connection fallback');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content/hero');
  return { success: true, message: 'Hero actualizado correctamente' };
}

export async function updateAppearanceAction(
  _prev: ContentActionResponse,
  formData: FormData
): Promise<ContentActionResponse> {
  const data = {
    font_heading: (formData.get('font_heading') || 'Outfit') as any,
    font_body: (formData.get('font_body') || 'Inter') as any,
    primary_color: (formData.get('primary_color') || '#F59E0B') as string,
    accent_glow: formData.get('accent_glow') === 'on',
    background_pattern: (formData.get('background_pattern') || 'grid') as any,
    custom_css: (formData.get('custom_css') || '') as string,
  };

  updateMemoryAppearance(data);

  try {
    const db = createAdminClient();
    const { error } = await db.from('landing_site_appearance').upsert({ id: 1, ...data });
    if (error) {
      console.warn('Supabase updateAppearance warning:', error.message);
    }
  } catch (err) {
    console.warn('Supabase updateAppearance connection fallback');
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content/apariencia');
  return { success: true, message: 'Apariencia actualizada correctamente' };
}
