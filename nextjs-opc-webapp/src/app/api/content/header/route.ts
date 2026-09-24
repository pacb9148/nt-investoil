import { NextRequest, NextResponse } from 'next/server';
import { getLandingHeader, saveLandingHeader } from '@/lib/services/content-service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLandingHeader();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer datos de cabecera' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await saveLandingHeader(body);

    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/header');

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar datos de cabecera' }, { status: 500 });
  }
}
