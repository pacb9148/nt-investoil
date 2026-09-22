import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'marquee.json');

export async function GET() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      const data = fs.readFileSync(DATA_PATH, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json({
      enabled: true,
      showLivePrices: true,
      speedSeconds: 30,
      pauseOnHover: true,
      customItems: [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error leyendo configuración de marquee' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: 'Error guardando configuración de marquee' }, { status: 500 });
  }
}
