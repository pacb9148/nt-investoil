import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { queryPg, hasPostgresDb } from '@/lib/db/pg-client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

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

export interface StoredUpload {
  publicUrl: string;
  filename: string;
  savedInDb: boolean;
}

/**
 * Guarda un archivo en la biblioteca: caché en disco, PostgreSQL (o Supabase) y catálogo de medios.
 * Las validaciones de tipo y tamaño las hace quien llama; aquí solo se persiste.
 */
export async function storeUploadedFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  isVideo = false
): Promise<StoredUpload> {
  const dataBase64 = buffer.toString('base64');

  // Sanitizar nombre de archivo único
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  const fileId = `mf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const publicUrl = `/uploads/${filename}`;

  // 1. Guardar en memoria caché de disco local
  try {
    const uploadDir = resolveUploadsDir();
    await writeFile(path.join(uploadDir, filename), buffer);
  } catch (fsErr) {
    console.warn('Aviso: no se pudo escribir en disco local, continuará con base de datos:', fsErr);
  }

  // 2. Guardar en Base de Datos PostgreSQL (DATABASE_URL)
  let savedInDb = false;
  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO media_files (id, filename, mime_type, size, data_base64, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET data_base64 = EXCLUDED.data_base64, updated_at = NOW()`,
        [fileId, filename, mimeType, buffer.length, dataBase64]
      );

      await queryPg(
        `INSERT INTO media (id, filename, url, type, mime_type, size, alt_text, data_base64, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [fileId, safeName, publicUrl, isVideo ? 'video' : 'image', mimeType, buffer.length, safeName.split('.')[0], dataBase64]
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
        size: buffer.length,
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
      size: buffer.length,
      alt_text: safeName.split('.')[0],
      data_base64: dataBase64,
    });
  } catch (catErr) {
    console.warn('Aviso al catalogar en db-service:', catErr);
  }

  return { publicUrl, filename, savedInDb };
}
