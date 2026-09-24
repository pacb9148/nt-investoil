import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSectionContent('faq', []);
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

    await saveSectionContent('faq', items);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/faq-editor');

    return NextResponse.json({ success: true, faqs: items });
  } catch (error) {
    console.error('Error al guardar FAQ:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
