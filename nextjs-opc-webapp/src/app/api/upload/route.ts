import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { queryPg, hasPostgresDb } from '@/lib/db/pg-client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.ogg'];

function resolveUploadsDir(): string {
  const candidates = [
    path.join(process.cwd(), 'public', 'uploads'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'uploads'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  const defaultDir = existsSync(path.join(process.cwd(), 'nextjs-opc-webapp'))
    ? path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'uploads')
    : path.join(process.cwd(), 'public', 'uploads');
  mkdirSync(defaultDir, { recursive: true });
  return defaultDir;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo para subir' }, { status: 400 });
    }

    const filenameOriginal = file.name.toLowerCase();
    const ext = path.extname(filenameOriginal);
    const mimeType = file.type || 'application/octet-stream';

    const isVideo =
      mimeType.startsWith('video/') ||
      ALLOWED_VIDEO_EXTS.includes(ext);

    const isImage =
      mimeType.startsWith('image/') ||
      ALLOWED_IMAGE_EXTS.includes(ext);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        {
          error: `Formato "${ext || 'desconocido'}" no permitido. Formatos válidos: Imágenes (JPG, PNG, WebP, SVG, GIF) o Videos (MP4, WebM, MOV).`,
        },
        { status: 400 }
      );
    }

    // Validación de límites de tamaño
    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        {
          error: `La imagen excede el límite máximo de 2 MB (tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        {
          error: `El video excede el límite máximo de 100 MB (tamaño actual: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dataBase64 = buffer.toString('base64');

    // Sanitizar nombre de archivo único
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const fileId = `mf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const publicUrl = `/uploads/${filename}`;

    // 1. Guardar en memoria caché de disco local
    try {
      const uploadDir = resolveUploadsDir();
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
    } catch (fsErr) {
      console.warn('Aviso: no se pudo escribir en disco local, continuará con base de datos:', fsErr);
    }

    // 2. Guardar en Base de Datos PostgreSQL (DATABASE_URL)
    let savedInDb = false;
    if (hasPostgresDb()) {
      try {
        await queryPg(
          `INSERT INTO public.media_files (id, filename, mime_type, size, data_base64, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (id) DO UPDATE SET data_base64 = EXCLUDED.data_base64, updated_at = NOW()`,
          [fileId, filename, mimeType, file.size, dataBase64]
        );

        await queryPg(
          `INSERT INTO public.media (id, filename, url, type, mime_type, size, alt_text, data_base64, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [fileId, safeName, publicUrl, isVideo ? 'video' : 'image', mimeType, file.size, safeName.split('.')[0], dataBase64]
        );
        savedInDb = true;
      } catch (pgErr) {
        console.error('Error al guardar archivo en PostgreSQL:', pgErr);
      }
    }

    // 3. Guardar en Supabase si está disponible
    if (isSupabaseConfigured() && !savedInDb) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        await supabase.from('media_files').upsert({
          id: fileId,
          filename,
          mime_type: mimeType,
          size: file.size,
          data_base64: dataBase64,
        });
        savedInDb = true;
      } catch (supErr) {
        console.warn('Aviso al guardar en Supabase media_files:', supErr);
      }
    }

    // 4. Registrar en el catálogo general de db-service
    try {
      const { saveMediaItem } = await import('@/lib/db/db-service');
      await saveMediaItem({
        id: fileId,
        filename: safeName,
        url: publicUrl,
        type: isVideo ? 'video' : 'image',
        mime_type: mimeType,
        size: file.size,
        alt_text: safeName.split('.')[0],
        data_base64: dataBase64,
      });
    } catch (catErr) {
      console.warn('Aviso al catalogar en db-service:', catErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      mediaType: isVideo ? 'video' : 'image',
      size: file.size,
      mimeType,
      savedInDatabase: savedInDb,
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al procesar el archivo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let target = searchParams.get('url') || searchParams.get('filename') || searchParams.get('id');

    if (!target) {
      try {
        const body = await request.json();
        target = body.url || body.filename || body.id;
      } catch {}
    }

    if (!target) {
      return NextResponse.json({ error: 'Se requiere url, filename o id para eliminar' }, { status: 400 });
    }

    const { deleteMediaItem } = await import('@/lib/db/db-service');
    await deleteMediaItem(target);

    return NextResponse.json({ success: true, message: 'Archivo eliminado con éxito' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error al eliminar archivo' }, { status: 500 });
  }
}

