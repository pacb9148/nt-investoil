import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Validar tipo de archivo (videos e imágenes)
    const mimeType = file.type;
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
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Sanitizar nombre de archivo
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

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
