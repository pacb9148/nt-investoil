import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';
import { DEFAULT_ACTUALIDAD, type ActualidadConfig } from '@/lib/constants/actualidad-defaults';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSectionContent<ActualidadConfig>('actualidad', DEFAULT_ACTUALIDAD);
    return NextResponse.json({ ...DEFAULT_ACTUALIDAD, ...data });
  } catch (error) {
    return NextResponse.json(DEFAULT_ACTUALIDAD);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ActualidadConfig>;
    const cardCount = Math.min(12, Math.max(1, Number(body.cardCount) || DEFAULT_ACTUALIDAD.cardCount));
    const updated: ActualidadConfig = { ...DEFAULT_ACTUALIDAD, ...body, cardCount };

    await saveSectionContent('actualidad', updated);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/actualidad');

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al guardar la configuración de Actualidad' },
      { status: 500 }
    );
  }
}
