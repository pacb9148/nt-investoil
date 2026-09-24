import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

import { existsSync, mkdirSync } from 'fs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validar tipo de archivo (videos e imágenes)
    const mimeType = file.type || 'application/octet-stream';
    const isVideo = mimeType.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
    const isImage = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: 'Formato no soportado. Debe ser un video (MP4, WebM) o imagen (JPG, PNG, WebP).' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Asegurar directorio public/uploads
    const uploadDir = resolveUploadsDir();

    // Sanitizar nombre de archivo
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    // Registrar en la base de datos de media
    try {
      const { saveMediaItem } = await import('@/lib/db/db-service');
      await saveMediaItem({
        filename: safeName,
        url: publicUrl,
        type: isVideo ? 'video' : 'image',
        mime_type: mimeType,
        size: file.size,
        alt_text: safeName.split('.')[0],
      });
    } catch (dbErr) {
      console.warn('Error al registrar media en base de datos:', dbErr);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      mediaType: isVideo ? 'video' : 'image',
      size: file.size,
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al procesar el archivo' },
      { status: 500 }
    );
  }
}
