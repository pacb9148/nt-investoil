import { NextRequest, NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/db/db-service';
import { hasPostgresDb, queryPg } from '@/lib/db/pg-client';
import type { Post } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const targetId = params.id;
  try {
    const posts = readJsonFile<Post[]>('posts.json', []);
    const index = posts.findIndex((p) => p.id === targetId || p.slug === targetId);

    let newLikes = 1;
    if (index !== -1) {
      posts[index].likes = (posts[index].likes || 0) + 1;
      newLikes = posts[index].likes;
      writeJsonFile('posts.json', posts);
    }

    if (hasPostgresDb()) {
      try {
        await queryPg(
          `UPDATE posts 
           SET likes = COALESCE(likes, 0) + 1, updated_at = NOW() 
           WHERE id = $1 OR slug = $1 
           RETURNING likes`,
          [targetId]
        );
      } catch (err) {
        console.warn('Failed to update likes in PostgreSQL:', err);
      }
    }

    return NextResponse.json({ success: true, likes: newLikes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al registrar like' },
      { status: 500 }
    );
  }
}
