import { NextRequest, NextResponse } from 'next/server';
import { getCategories, saveCategory } from '@/lib/db/db-service';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al obtener categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Category>;

    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: 'El nombre de la categoría es obligatorio' },
        { status: 400 }
      );
    }

    const saved = await saveCategory(body);

    revalidatePath('/blog');
    revalidatePath('/admin/posts');
    revalidatePath('/admin/posts/new');

    return NextResponse.json({ success: true, category: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al guardar categoría en la base de datos' },
      { status: 400 }
    );
  }
}
