import { NextRequest, NextResponse } from 'next/server';
import { copyFile, mkdir, stat } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { localPath } = await request.json();

    if (!localPath || typeof localPath !== 'string') {
      return NextResponse.json({ error: 'Ruta local requerida' }, { status: 400 });
    }

    // Normalizar ruta (eliminar comillas accidentales)
    const cleanPath = localPath.trim().replace(/^["']|["']$/g, '');

    try {
      const fileStat = await stat(cleanPath);
      if (!fileStat.isFile()) {
        return NextResponse.json({ error: 'La ruta no corresponde a un archivo válido' }, { status: 400 });
      }
    } catch {
      return NextResponse.json(
        { error: 'El archivo local no se encontró en la ruta especificada. Utilice el botón "Examinar archivo" para seleccionarlo de su equipo.' },
        { status: 404 }
      );
    }

    const ext = path.extname(cleanPath).toLowerCase();
    const isVideo = ['.mp4', '.webm', '.mov', '.ogg'].includes(ext);
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { error: 'Formato no soportado. Debe ser un video (MP4, WebM) o imagen (JPG, PNG, WebP).' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const baseName = path.basename(cleanPath).replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${baseName}`;
    const destination = path.join(uploadDir, filename);

    await copyFile(cleanPath, destination);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      mediaType: isVideo ? 'video' : 'image',
    });
  } catch (error) {
    console.error('Error al importar archivo local:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno al importar archivo' },
      { status: 500 }
    );
  }
}
