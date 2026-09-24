import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
    case '.ogg':
      return 'video/ogg';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}

function nodeStreamToWebStream(nodeStream: Readable): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => {
        controller.enqueue(new Uint8Array(chunk));
      });
      nodeStream.on('end', () => {
        controller.close();
      });
      nodeStream.on('error', (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

function resolveUploadFilePath(relPath: string): string | null {
  const candidates = [
    path.join(process.cwd(), 'public', 'uploads', relPath),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'uploads', relPath),
    path.join(process.cwd(), 'public', 'videos', relPath),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'videos', relPath),
    path.join(process.cwd(), 'public', relPath),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'public', relPath),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slugParts = params.slug || [];
    const relPath = slugParts.join('/');
    const filePath = resolveUploadFilePath(relPath);

    if (!filePath || !existsSync(filePath)) {
      return new NextResponse('Archivo no encontrado', { status: 404 });
    }

    const stat = statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Ruta no válida', { status: 400 });
    }

    const fileSize = stat.size;
    const mimeType = getMimeType(filePath);
    const rangeHeader = request.headers.get('range');

    // Soporte para HTTP Range (indispensable para streaming de video en Chrome/Firefox/Safari)
    if (rangeHeader && rangeHeader.startsWith('bytes=')) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Rango solicitado no satisfacible', {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = createReadStream(filePath, { start, end });
      const webStream = nodeStreamToWebStream(fileStream);

      return new NextResponse(webStream, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // Petición estándar completa (imágenes o videos sin range)
    const fileStream = createReadStream(filePath);
    const webStream = nodeStreamToWebStream(fileStream);

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize.toString(),
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error en streamer de medios:', error);
    return new NextResponse('Error al servir archivo', { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slugParts = params.slug || [];
    const relPath = slugParts.join('/');
    const filePath = resolveUploadFilePath(relPath);

    if (!filePath || !existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stat = statSync(filePath);
    const fileSize = stat.size;
    const mimeType = getMimeType(filePath);

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize.toString(),
        'Content-Type': mimeType,
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
