import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';
import type { LandingCtaFinalConfig } from '@/types/content';

export const dynamic = 'force-dynamic';

const CTA_SECTION = 'cta_final';

const TEXT_FIELDS = [
  'kicker', 'kicker_en', 'heading', 'heading_en', 'subheading', 'subheading_en',
  'button_text', 'button_text_en', 'guarantee_line', 'guarantee_line_en',
];

export async function GET() {
  const data = await getSectionContent<Partial<LandingCtaFinalConfig>>(CTA_SECTION, {});
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const clean: Record<string, string> = {};
    for (const key of TEXT_FIELDS) {
      const v = body[key];
      if (typeof v === 'string' && v.trim()) clean[key] = v.trim().slice(0, 400);
    }
    const url = typeof body.button_url === 'string' ? body.button_url.trim() : '';
    if (url) {
      // Solo anclas, rutas del propio sitio o http(s): nunca `javascript:` u otros esquemas.
      if (!/^(#|\/|https?:\/\/)/i.test(url)) {
        return NextResponse.json({ error: 'El destino del botón debe empezar por #, / o http(s)://' }, { status: 400 });
      }
      clean.button_url = url.slice(0, 300);
    }
    await saveSectionContent(CTA_SECTION, clean);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: clean });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error guardando el CTA final' }, { status: 500 });
  }
}
