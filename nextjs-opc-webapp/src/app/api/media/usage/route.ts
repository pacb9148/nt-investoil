import { NextRequest, NextResponse } from 'next/server';
import { findMediaUsage } from '@/lib/db/db-service';

export const dynamic = 'force-dynamic';

// Indica en qué secciones se usa un archivo, para avisar antes de eliminarlo de la biblioteca.
export async function GET(request: NextRequest) {
  const url = new URL(request.url).searchParams.get('url');
  if (!url || url.length > 2048) {
    return NextResponse.json({ error: 'Se requiere el parámetro url' }, { status: 400 });
  }
  try {
    const usedIn = await findMediaUsage(url);
    return NextResponse.json({ usedIn });
  } catch {
    return NextResponse.json({ usedIn: [] });
  }
}
