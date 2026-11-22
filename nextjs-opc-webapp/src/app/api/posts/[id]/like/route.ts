import { NextRequest, NextResponse } from 'next/server';
import { incrementPostCounter } from '@/lib/db/post-counters';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const likes = await incrementPostCounter(params.id, 'likes');
    if (likes === null) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, likes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar like';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
