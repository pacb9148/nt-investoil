import { NextRequest, NextResponse } from 'next/server';
import { getMediaList, saveMediaItem, deleteMediaItem } from '@/lib/db/db-service';
import type { MediaItem } from '@/types';
import { POST as handleUpload } from '@/app/api/upload/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const media = await getMediaList(search);
    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al obtener galería de medios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      // Si llega un archivo en FormData multipart, delegar de inmediato al handler de upload
      return await handleUpload(request);
    }

    const body = (await request.json()) as Partial<MediaItem>;
    if (!body.url) {
      return NextResponse.json({ error: 'La URL del medio es requerida' }, { status: 400 });
    }

    const saved = await saveMediaItem(body);
    return NextResponse.json({ success: true, item: saved, media: saved, url: saved.url });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al registrar medio' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get('url') || searchParams.get('id') || searchParams.get('filename');

    let target = urlParam;
    if (!target) {
      try {
        const body = await request.json();
        target = body.url || body.id || body.filename;
      } catch {}
    }

    if (!target) {
      return NextResponse.json({ error: 'Se requiere url, id o filename para eliminar' }, { status: 400 });
    }

    await deleteMediaItem(target);
    return NextResponse.json({ success: true, message: 'Archivo eliminado correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al eliminar archivo' }, { status: 500 });
  }
}
