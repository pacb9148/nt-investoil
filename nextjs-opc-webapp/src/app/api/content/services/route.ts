import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { ServiceItem } from '@/types';

export const dynamic = 'force-dynamic';

const SERVICES_FILE = path.join(process.cwd(), 'src', 'data', 'services.json');

export async function GET() {
  try {
    const raw = await readFile(SERVICES_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const items = (await request.json()) as ServiceItem[];

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    await writeFile(SERVICES_FILE, JSON.stringify(items, null, 2), 'utf-8');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/services');

    return NextResponse.json({ success: true, services: items });
  } catch (error) {
    console.error('Error al guardar servicios:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
