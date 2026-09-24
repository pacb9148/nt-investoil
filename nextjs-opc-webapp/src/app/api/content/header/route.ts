import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getHeaderFilePath(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', 'header.json'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data', 'header.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

export async function GET() {
  try {
    const filePath = getHeaderFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Archivo header.json no encontrado' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer datos de cabecera' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const filePath = getHeaderFilePath();

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar datos de cabecera' }, { status: 500 });
  }
}
