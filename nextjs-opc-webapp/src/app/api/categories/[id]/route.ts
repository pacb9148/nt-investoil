import { NextRequest, NextResponse } from 'next/server';
import { getCategoryById, saveCategory, deleteCategory } from '@/lib/db/db-service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cat = await getCategoryById(params.id);
    if (!cat) {
      return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 404 });
    }
    return NextResponse.json(cat);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al obtener categoría' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const saved = await saveCategory({ ...body, id: params.id });

    revalidatePath('/blog');
    revalidatePath('/admin/posts');

    return NextResponse.json({ success: true, category: saved });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al actualizar categoría' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteCategory(params.id);

    revalidatePath('/blog');
    revalidatePath('/admin/posts');

    return NextResponse.json({ success: true, message: 'Categoría eliminada con éxito' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al eliminar categoría' },
      { status: 400 }
    );
  }
}
