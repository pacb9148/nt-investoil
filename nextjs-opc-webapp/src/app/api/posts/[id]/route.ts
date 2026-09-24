import { NextRequest, NextResponse } from 'next/server';
import { getPostById, savePost, deletePost } from '@/lib/db/db-service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await getPostById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const saved = await savePost({ ...body, id: params.id });

    revalidatePath('/', 'layout');
    revalidatePath('/blog');
    if (saved.slug) {
      revalidatePath(`/blog/${saved.slug}`);
    }
    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json({ success: true, post: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al actualizar post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deletePost(params.id);

    revalidatePath('/', 'layout');
    revalidatePath('/blog');
    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json({ success: true, message: 'Post eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al eliminar post' }, { status: 500 });
  }
}
