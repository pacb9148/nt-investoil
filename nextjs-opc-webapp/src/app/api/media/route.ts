import { NextRequest, NextResponse } from 'next/server';
import { getMediaList, saveMediaItem } from '@/lib/db/db-service';
import type { MediaItem } from '@/types';

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
    const body = (await request.json()) as Partial<MediaItem>;
    if (!body.url) {
      return NextResponse.json({ error: 'La URL del medio es requerida' }, { status: 400 });
    }

    const saved = await saveMediaItem(body);
    return NextResponse.json({ success: true, item: saved, media: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al registrar medio' }, { status: 500 });
  }
}
