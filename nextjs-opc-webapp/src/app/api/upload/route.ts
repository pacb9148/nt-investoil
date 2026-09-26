import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { storeUploadedFile } from '@/lib/media/store-upload';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20 MB (máximo para alojamiento en biblioteca local)

const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
const ALLOWED_VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.ogg'];

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
          error: `El video pesa ${(file.size / (1024 * 1024)).toFixed(1)} MB y supera el límite de 20 MB para alojamiento directo en la biblioteca. Para videos más pesados, use un enlace o URL de referencia de internet y visualice la vista previa sin saturar el servidor.`,
        },
        { status: 400 }
      );
    }

    const stored = await storeUploadedFile(Buffer.from(await file.arrayBuffer()), file.name, mimeType, isVideo);
    const { publicUrl, filename, savedInDb } = stored;

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

