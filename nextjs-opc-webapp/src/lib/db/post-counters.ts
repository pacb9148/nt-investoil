import { readJsonFile, writeJsonFile } from '@/lib/db/db-service';
import { hasPostgresDb, queryPg } from '@/lib/db/pg-client';
import type { Post } from '@/types';

export type PostCounter = 'views' | 'likes';

/**
 * Suma 1 a un contador del artículo y devuelve el valor REAL resultante (el que ve cualquier
 * visitante), o null si el artículo no existe. Con PostgreSQL la base es la única fuente de verdad;
 * el JSON solo sirve en desarrollo sin base. La columna sale de una lista cerrada, nunca de la petición.
 */
export async function incrementPostCounter(idOrSlug: string, counter: PostCounter): Promise<number | null> {
  if (hasPostgresDb()) {
    const column = counter === 'views' ? 'views' : 'likes';
    const result = await queryPg<{ total: number }>(
      `UPDATE posts SET ${column} = COALESCE(${column}, 0) + 1 WHERE id = $1 OR slug = $1 RETURNING ${column} AS total`,
      [idOrSlug]
    );
    const row = result?.rows[0];
    return row ? Number(row.total) : null;
  }

  const posts = readJsonFile<Post[]>('posts.json', []);
  const post = posts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!post) return null;
  post[counter] = (post[counter] || 0) + 1;
  writeJsonFile('posts.json', posts);
  return post[counter];
}
