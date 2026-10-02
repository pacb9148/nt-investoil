import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';
import { ALLOWED_OVERRIDE_PATHS, TEXT_OVERRIDES_SECTION, type TextOverrides } from '@/lib/i18n/text-overrides';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getSectionContent<TextOverrides>(TEXT_OVERRIDES_SECTION, {});
  return NextResponse.json(data);
}

// Fusiona por clave: la página de Textos y la de Contacto editan partes distintas del mismo almacén,
// así que ninguna puede reemplazar el idioma entero. Un valor vacío elimina esa personalización.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TextOverrides;
    const current = await getSectionContent<TextOverrides>(TEXT_OVERRIDES_SECTION, {});
    const next: TextOverrides = { es: { ...(current.es || {}) }, en: { ...(current.en || {}) } };
    for (const lang of ['es', 'en'] as const) {
      const incoming = body[lang];
      if (!incoming || typeof incoming !== 'object') continue;
      for (const [path, value] of Object.entries(incoming)) {
        if (!ALLOWED_OVERRIDE_PATHS.has(path) || typeof value !== 'string') continue;
        const text = value.trim().slice(0, 600);
        if (text) next[lang]![path] = text;
        else delete next[lang]![path];
      }
    }
    await saveSectionContent(TEXT_OVERRIDES_SECTION, next);
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, data: next });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error guardando los textos' }, { status: 500 });
  }
}
