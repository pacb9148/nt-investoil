import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import type { ClientTestimonial } from '@/types';

export const dynamic = 'force-dynamic';

const TESTIMONIALS_FILE = path.join(process.cwd(), 'src', 'data', 'testimonials.json');

export async function GET() {
  try {
    const raw = await readFile(TESTIMONIALS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const items = (await request.json()) as ClientTestimonial[];

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    await writeFile(TESTIMONIALS_FILE, JSON.stringify(items, null, 2), 'utf-8');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/testimonials');

    return NextResponse.json({ success: true, testimonials: items });
  } catch (error) {
    console.error('Error al guardar testimonios:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
