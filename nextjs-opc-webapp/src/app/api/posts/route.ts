import { NextRequest, NextResponse } from 'next/server';
import { getPosts, savePost } from '@/lib/db/db-service';
import { revalidatePath } from 'next/cache';
import type { Post } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const posts = await getPosts({
      status,
      search,
      categorySlug: category,
      limit,
    });

    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<Post>;

    if (!body.title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const saved = await savePost(body);

    // Revalidar rutas para reflejar inmediatamente los cambios
    revalidatePath('/', 'layout');
    revalidatePath('/blog');
    if (saved.slug) {
      revalidatePath(`/blog/${saved.slug}`);
    }
    revalidatePath('/admin');
    revalidatePath('/admin/posts');

    return NextResponse.json({ success: true, post: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al guardar post' }, { status: 500 });
  }
}
