import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getSeoFilePath(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', 'seo.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'seo.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

import { getLandingSeo, saveLandingSeo } from '@/lib/services/content-service';

export async function GET() {
  try {
    const data = await getLandingSeo();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al leer datos SEO' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await saveLandingSeo(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al guardar datos SEO' }, { status: 500 });
  }
}
