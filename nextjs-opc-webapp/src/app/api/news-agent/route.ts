import { NextRequest, NextResponse } from 'next/server';
import { fetchRadarNewsForDate, parseRadarDate } from '@/lib/news/google-news-radar';

export const dynamic = 'force-dynamic';

export interface MarketNewsItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
  imageUrl?: string;
}

export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // El navegador envía su fecha local, que puede ir un día por delante de UTC por la noche.
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);
    const rawDate = new URL(request.url).searchParams.get('date');
    const date = rawDate ? parseRadarDate(rawDate) : today;

    if (!date || date > tomorrow) {
      return NextResponse.json(
        { error: 'Fecha no válida: usa AAAA-MM-DD y no una fecha futura.' },
        { status: 400 }
      );
    }

    let live: MarketNewsItem[] = [];
    let warning: string | undefined;
    try {
      live = await fetchRadarNewsForDate(date);
    } catch (e) {
      warning = 'No se pudo consultar Google News en este momento.';
      console.error('[news-agent] Error consultando el radar:', e);
    }

    // Solo noticias reales: el archivo «curado» anterior atribuía a Reuters, BBC o Platts textos que
    // esos medios no habían publicado, con enlaces a sus portadas.
    const news = live;

    return NextResponse.json({ success: true, date, count: news.length, liveCount: live.length, warning, news });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error al obtener radar de noticias' },
      { status: 500 }
    );
  }
}
