import { NextResponse } from 'next/server';
import { getMediaList } from '@/lib/db/db-service';
import { hasPostgresDb, queryPg } from '@/lib/db/pg-client';
import fs from 'fs';
import path from 'path';
import { MediaItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const list = await getMediaList();
    const seen = new Set<string>();
    const uniqueList: MediaItem[] = [];
    const removedIds: string[] = [];

    for (const item of list) {
      // Clave única basada en URL o combinación de filename y tamaño
      const key = `${item.url || ''}__${item.size || 0}`;
      if (seen.has(key)) {
        removedIds.push(item.id);
      } else {
        seen.add(key);
        uniqueList.push(item);
      }
    }

    // Guardar en JSON
    const mediaJsonPath = path.join(process.cwd(), 'src/data/media.json');
    if (fs.existsSync(mediaJsonPath)) {
      fs.writeFileSync(mediaJsonPath, JSON.stringify(uniqueList, null, 2), 'utf-8');
    }

    // Limpiar en PostgreSQL si hay conexión
    if (hasPostgresDb() && removedIds.length > 0) {
      try {
        await queryPg(
          `DELETE FROM public.media WHERE id = ANY($1::text[])`,
          [removedIds]
        );
      } catch (err) {
        console.warn('Error al eliminar duplicados en PostgreSQL:', err);
      }
    }

    return NextResponse.json({
      success: true,
      removedCount: removedIds.length,
      remainingCount: uniqueList.length,
      removedIds,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error al deduplicar' },
      { status: 500 }
    );
  }
}
