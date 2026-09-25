import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getLandingHero, updateMemoryHero } from '@/lib/services/content-service';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { LandingHeroConfig } from '@/types/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLandingHero();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener hero' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LandingHeroConfig>;

    if (!body) {
      return NextResponse.json({ error: 'Configuración requerida' }, { status: 400 });
    }

    // 1. Guardar en memoria, archivo JSON local y PostgreSQL
    await updateMemoryHero(body);

    // 2. Si Supabase está configurado, sincronizar
    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const db = createAdminClient();
        await db.from('landing_hero').upsert({ id: 1, ...body });
      } catch (err) {
        console.warn('Fallo sync Supabase landing_hero:', err);
      }
    }

    // 3. Revalidar rutas para propagar cambios inmediatamente
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/hero');

    return NextResponse.json({ success: true, hero: body });
  } catch (error: any) {
    console.error('Error al guardar hero:', error);
    return NextResponse.json({ error: error?.message || 'Error al guardar hero' }, { status: 500 });
  }
}
