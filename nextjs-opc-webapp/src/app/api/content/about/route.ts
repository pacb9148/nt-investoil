import { NextRequest, NextResponse } from 'next/server';
import { getLandingAbout, saveLandingAbout } from '@/lib/services/content-service';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLandingAbout();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error al leer datos de Nosotros' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const saved = await saveLandingAbout(body);

    revalidatePath('/about');
    revalidatePath('/admin/content/nosotros');

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar datos de Nosotros' }, { status: 500 });
  }
}
