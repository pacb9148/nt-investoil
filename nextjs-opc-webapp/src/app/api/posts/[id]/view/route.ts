import { NextRequest, NextResponse } from 'next/server';
import { incrementPostCounter } from '@/lib/db/post-counters';

export const dynamic = 'force-dynamic';

// La lectura la notifica el navegador al abrir el artículo (los rastreadores sin JavaScript no cuentan).
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const views = await incrementPostCounter(params.id, 'views');
    if (views === null) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, views });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al registrar la lectura';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
