import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSectionContent('problem', []);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const items = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    await saveSectionContent('problem', items);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/problema');

    return NextResponse.json({ success: true, problems: items });
  } catch (error) {
    console.error('Error al guardar retos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
