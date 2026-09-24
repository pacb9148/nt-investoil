import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';
import type { ProductItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getSectionContent<ProductItem[]>('products', []);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const items = (await request.json()) as ProductItem[];

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    await saveSectionContent('products', items);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/products');

    return NextResponse.json({ success: true, products: items });
  } catch (error) {
    console.error('Error al guardar productos:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
