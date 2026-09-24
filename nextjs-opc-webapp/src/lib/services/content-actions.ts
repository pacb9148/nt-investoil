'use server';

import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import {
  updateMemorySection,
  updateMemoryHero,
  updateMemoryAppearance,
} from './content-service';
import type {
  ContentActionResponse,
  HeroBgType,
  HeroVisualType,
  SectionBackgroundColors,
  HeroCardCustomization,
} from '@/types/content';

export async function toggleSectionAction(
  id: string,
  isActive: boolean
): Promise<ContentActionResponse> {
  updateMemorySection(id, isActive);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db
        .from('landing_sections')
        .update({ is_active: isActive })
        .eq('id', id);
    } catch (err) {
      console.warn('Supabase toggleSection connection fallback');
    }
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content');
  return { success: true, message: `Sección ${id} actualizada a ${isActive ? 'Visible' : 'Oculta'}` };
}

export async function updateHeroAction(
  _prev: ContentActionResponse,
  formData: FormData
): Promise<ContentActionResponse> {
  const heroCard: HeroCardCustomization = {
    card_bg_color: (formData.get('hero_card_bg') as string) || undefined,
    card_border_color: (formData.get('hero_card_border') as string) || undefined,
    card_glow_opacity: formData.get('hero_card_glow_opacity') !== null ? Number(formData.get('hero_card_glow_opacity')) : undefined,
    logo_url: (formData.get('hero_logo_url') as string) || undefined,
    logo_hue: formData.get('hero_logo_hue') !== null ? Number(formData.get('hero_logo_hue')) : undefined,
    logo_brightness: formData.get('hero_logo_brightness') !== null ? Number(formData.get('hero_logo_brightness')) : undefined,
    logo_saturation: formData.get('hero_logo_saturation') !== null ? Number(formData.get('hero_logo_saturation')) : undefined,
    logo_shadow_color: (formData.get('hero_logo_shadow_color') as string) || undefined,
    logo_shadow_blur: formData.get('hero_logo_shadow_blur') !== null ? Number(formData.get('hero_logo_shadow_blur')) : undefined,
    badge_text: (formData.get('hero_badge_text') as string) || undefined,
    badge_text_en: (formData.get('hero_badge_text_en') as string) || undefined,
    metric1_label: (formData.get('hero_metric1_label') as string) || undefined,
    metric1_label_en: (formData.get('hero_metric1_label_en') as string) || undefined,
    metric1_value: (formData.get('hero_metric1_value') as string) || undefined,
    metric2_label: (formData.get('hero_metric2_label') as string) || undefined,
    metric2_label_en: (formData.get('hero_metric2_label_en') as string) || undefined,
    metric2_value: (formData.get('hero_metric2_value') as string) || undefined,
    metric3_label: (formData.get('hero_metric3_label') as string) || undefined,
    metric3_label_en: (formData.get('hero_metric3_label_en') as string) || undefined,
    metric3_value: (formData.get('hero_metric3_value') as string) || undefined,
  };

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
    hero_card: heroCard,
    market_ticker: formData.get('market_ticker') as string,
    updated_at: new Date().toISOString(),
  };

  updateMemoryHero(data);
  // Sincronizar también hero_card en appearance.json
  updateMemoryAppearance({ hero_card: heroCard });

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_hero').upsert({ id: 1, ...data });
      await db.from('landing_site_appearance').update({ hero_card: heroCard }).eq('id', 1);
    } catch (err) {
      console.warn('Supabase updateHero connection fallback');
    }
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content/hero');
  revalidatePath('/admin/content/apariencia');
  return { success: true, message: 'Hero actualizado correctamente' };
}

export async function updateAppearanceAction(
  _prev: ContentActionResponse,
  formData: FormData
): Promise<ContentActionResponse> {
  const sectionBgColors: SectionBackgroundColors = {
    hero: (formData.get('sec_bg_hero') || '') as string,
    marquee: (formData.get('sec_bg_marquee') || '') as string,
    problema: (formData.get('sec_bg_problema') || '') as string,
    services: (formData.get('sec_bg_services') || '') as string,
    products: (formData.get('sec_bg_products') || '') as string,
    plataforma: (formData.get('sec_bg_plataforma') || '') as string,
    team: (formData.get('sec_bg_team') || '') as string,
    testimonials: (formData.get('sec_bg_testimonials') || '') as string,
    faq: (formData.get('sec_bg_faq') || '') as string,
    contact: (formData.get('sec_bg_contact') || '') as string,
  };

  const heroCard: HeroCardCustomization = {
    card_bg_color: (formData.get('hero_card_bg') as string) || '#0e1424',
    card_border_color: (formData.get('hero_card_border') as string) || '#f59e0b',
    card_glow_opacity: Number(formData.get('hero_card_glow_opacity') ?? 50),
    logo_url: (formData.get('hero_logo_url') as string) || undefined,
    logo_hue: Number(formData.get('hero_logo_hue') ?? 0),
    logo_brightness: Number(formData.get('hero_logo_brightness') ?? 100),
    logo_saturation: Number(formData.get('hero_logo_saturation') ?? 100),
    logo_shadow_color: (formData.get('hero_logo_shadow_color') as string) || '#f59e0b',
    logo_shadow_blur: Number(formData.get('hero_logo_shadow_blur') ?? 20),
    badge_text: (formData.get('hero_badge_text') as string) || undefined,
    badge_text_en: (formData.get('hero_badge_text_en') as string) || undefined,
    metric1_label: (formData.get('hero_metric1_label') as string) || undefined,
    metric1_label_en: (formData.get('hero_metric1_label_en') as string) || undefined,
    metric1_value: (formData.get('hero_metric1_value') as string) || undefined,
    metric2_label: (formData.get('hero_metric2_label') as string) || undefined,
    metric2_label_en: (formData.get('hero_metric2_label_en') as string) || undefined,
    metric2_value: (formData.get('hero_metric2_value') as string) || undefined,
    metric3_label: (formData.get('hero_metric3_label') as string) || undefined,
    metric3_label_en: (formData.get('hero_metric3_label_en') as string) || undefined,
    metric3_value: (formData.get('hero_metric3_value') as string) || undefined,
  };

  const data = {
    font_heading: (formData.get('font_heading') || 'Outfit') as any,
    font_body: (formData.get('font_body') || 'Inter') as any,
    primary_color: (formData.get('primary_color') || '#F59E0B') as string,
    accent_glow: formData.get('accent_glow') === 'on',
    background_pattern: (formData.get('background_pattern') || 'grid') as any,
    custom_css: (formData.get('custom_css') || '') as string,
    section_bg_colors: sectionBgColors,
    hero_card: heroCard,
  };

  updateMemoryAppearance(data);
  // Sincronizar hero_card en hero.json para mantener coherencia total
  updateMemoryHero({ hero_card: heroCard });

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const db = createAdminClient();
      await db.from('landing_site_appearance').upsert({ id: 1, ...data });
      await db.from('landing_hero').update({ hero_card: heroCard }).eq('id', 1);
    } catch (err) {
      console.warn('Supabase updateAppearance connection fallback');
    }
  }

  revalidatePath('/', 'layout');
  revalidatePath('/admin/content/apariencia');
  revalidatePath('/admin/content/hero');
  return { success: true, message: 'Apariencia actualizada correctamente' };
}
