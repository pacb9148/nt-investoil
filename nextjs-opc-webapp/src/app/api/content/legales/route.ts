import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DATA_PATH = path.join(process.cwd(), 'src', 'data', 'legal-pages.json');

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
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!fs.existsSync(DATA_PATH)) {
      return NextResponse.json({ error: 'Archivo de legales no encontrado' }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

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

    let currentData: Record<string, LegalPageData> = {};
    if (fs.existsSync(DATA_PATH)) {
      currentData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }

    if (allData) {
      currentData = allData;
    } else if (slug && pageData) {
      currentData[slug] = pageData;
    } else {
      return NextResponse.json({ error: 'Formato de payload inválido' }, { status: 400 });
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(currentData, null, 2), 'utf-8');
    return NextResponse.json({ success: true, data: currentData });
  } catch (error) {
    return NextResponse.json({ error: 'Error guardando datos de páginas legales' }, { status: 500 });
  }
}
