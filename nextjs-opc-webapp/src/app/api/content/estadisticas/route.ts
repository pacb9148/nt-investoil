import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';
import type { LandingStatsConfig } from '@/types/content';

export const dynamic = 'force-dynamic';

const STATS_SECTION = 'estadisticas';

const FIELDS = [1, 2, 3, 4].flatMap((n) => [`stat${n}_value`, `stat${n}_label`, `stat${n}_label_en`]);

export async function GET() {
  const data = await getSectionContent<Partial<LandingStatsConfig>>(STATS_SECTION, {});
  return NextResponse.json(data);
}

// El middleware exige sesión de administrador para toda escritura en /api/content.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const clean: Record<string, string> = {};
    for (const key of FIELDS) {
      const v = body[key];
      if (typeof v === 'string' && v.trim()) clean[key] = v.trim().slice(0, 160);
    }
    await saveSectionContent(STATS_SECTION, clean);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: clean });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error guardando las estadísticas' }, { status: 500 });
  }
}
