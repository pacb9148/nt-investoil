import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { queryPg, hasPostgresDb } from '@/lib/db/pg-client';

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

function resolveFallbackFilePath(_relPath: string): string | null {
  // Política estricta: Si un archivo no existe en disco ni en base de datos,
  // no se inventan ni resucitan imágenes borradas.
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slugParts = params.slug || [];
    const relPath = slugParts.join('/');
    const filename = slugParts[slugParts.length - 1] || '';

    // 1. Intentar resolver desde el disco local
    let filePath = resolveUploadFilePath(relPath);

    // 2. Si no está en disco, consultar la Base de Datos PostgreSQL
    if (!filePath && hasPostgresDb()) {
      try {
        const result = await queryPg(
          `SELECT mime_type, data_base64 FROM media_files WHERE filename = $1 OR id = $1 LIMIT 1`,
          [filename]
        );

        if (result && result.rows.length > 0) {
          const row = result.rows[0];
          const buffer = Buffer.from(row.data_base64, 'base64');
          const mimeType = row.mime_type || getMimeType(filename);

          // Escribir en caché de disco para siguientes peticiones
          try {
            const cacheDir = path.join(process.cwd(), 'public', 'uploads');
            if (existsSync(cacheDir)) {
              writeFileSync(path.join(cacheDir, filename), buffer);
            }
          } catch {}

          // Streaming con soporte de Range para videos
          const fileSize = buffer.length;
          const rangeHeader = request.headers.get('range');

          if (rangeHeader && rangeHeader.startsWith('bytes=')) {
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            if (start >= fileSize || end >= fileSize) {
              return new NextResponse('Rango no válido', {
                status: 416,
                headers: { 'Content-Range': `bytes */${fileSize}` },
              });
            }

            const chunk = buffer.subarray(start, end + 1);
            return new NextResponse(chunk, {
              status: 206,
              headers: {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunk.length.toString(),
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=86400',
              },
            });
          }

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': fileSize.toString(),
              'Cache-Control': 'public, max-age=86400',
            },
          });
        }
      } catch (dbErr) {
        console.error('Error al recuperar archivo de base de datos:', dbErr);
      }
    }

    // 3. Si aún no se encuentra, usar archivo de respaldo existente
    if (!filePath) {
      filePath = resolveFallbackFilePath(relPath);
    }

    if (!filePath || !existsSync(filePath)) {
      return new NextResponse('Archivo multimedia no encontrado', { status: 404 });
    }

    const stat = statSync(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Ruta no válida', { status: 400 });
    }

    const fileSize = stat.size;
    const mimeType = getMimeType(filePath);
    const rangeHeader = request.headers.get('range');

    // Soporte para HTTP Range (streaming nativo de video en Chrome, Edge, Safari, Firefox)
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
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    const fileStream = createReadStream(filePath);
    const webStream = nodeStreamToWebStream(fileStream);

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error en /uploads route:', error);
    return new NextResponse('Error interno al servir el archivo', { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  context: { params: { slug: string[] } }
) {
  const getRes = await GET(request, context);
  return new NextResponse(null, {
    status: getRes.status,
    headers: getRes.headers,
  });
}
