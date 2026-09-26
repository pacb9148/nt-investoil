import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSectionContent, saveSectionContent } from '@/lib/services/content-service';

export const dynamic = 'force-dynamic';

export interface LegalSection {
  title: string;
  content: string;
}

export interface LegalPageData {
  badge: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  badge_en?: string;
  title_en?: string;
  intro_en?: string;
  sections_en?: LegalSection[];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const data = await getSectionContent<Record<string, LegalPageData>>('legal-pages', {});

    if (slug) {
      if (data[slug]) {
        return NextResponse.json(data[slug]);
      }
      return NextResponse.json({ error: `Página legal ${slug} no encontrada` }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error leyendo datos de páginas legales' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { slug, pageData, allData } = body;

    let currentData = await getSectionContent<Record<string, LegalPageData>>('legal-pages', {});

    if (allData) {
      currentData = allData;
    } else if (slug && pageData) {
      currentData[slug] = pageData;
    } else {
      return NextResponse.json({ error: 'Formato de payload inválido' }, { status: 400 });
    }

    await saveSectionContent('legal-pages', currentData);
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content/legales');

    return NextResponse.json({ success: true, data: currentData });
  } catch (error) {
    return NextResponse.json({ error: 'Error guardando datos de páginas legales' }, { status: 500 });
  }
}
