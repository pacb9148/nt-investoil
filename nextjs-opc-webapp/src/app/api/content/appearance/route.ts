import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getLandingAppearance, updateMemoryAppearance } from '@/lib/services/content-service';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { LandingAppearanceConfig, SectionBackgroundColors } from '@/types/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLandingAppearance();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener apariencia' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Soportar actualización directa de section_bg_colors o configuración completa
    const current = await getLandingAppearance();
    let updated: LandingAppearanceConfig;

    if (body.sectionId && body.bgColor !== undefined) {
      // Actualización rápida de una sección individual
      const newSecBg: SectionBackgroundColors = {
        ...(current.section_bg_colors || {}),
        [body.sectionId]: body.bgColor,
      };
      updated = {
        ...current,
        section_bg_colors: newSecBg,
      };
    } else {
      updated = {
        ...current,
        ...body,
      };
    }

    // 1. Guardar en memoria y archivo JSON
    updateMemoryAppearance(updated);

    // 2. Si Supabase está disponible, sincronizar
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const db = createAdminClient();
        await db.from('landing_site_appearance').upsert({ id: 1, ...updated });
      } catch (err) {
        console.warn('Fallo sync Supabase landing_site_appearance:', err);
      }
    }

    // 3. Revalidar rutas
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content');
    revalidatePath('/admin/content/apariencia');

    return NextResponse.json({ success: true, appearance: updated });
  } catch (error: any) {
    console.error('Error al actualizar apariencia:', error);
    return NextResponse.json({ error: error?.message || 'Error al guardar apariencia' }, { status: 500 });
  }
}
