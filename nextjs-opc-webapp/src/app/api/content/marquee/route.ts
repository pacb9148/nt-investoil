import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';

export const dynamic = 'force-dynamic';

const DEFAULT_MARQUEE = {
  enabled: true,
  showLivePrices: true,
  speedSeconds: 30,
  pauseOnHover: true,
  customItems: [],
};

export async function GET() {
  try {
    const data = await getSectionContent('marquee', DEFAULT_MARQUEE);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error leyendo configuración de marquee' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await saveSectionContent('marquee', body);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/marquee');
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: 'Error guardando configuración de marquee' }, { status: 500 });
  }
}
