import { NextRequest, NextResponse } from 'next/server';
import {
  composeAnalysis,
  extractArticle,
  importFeaturedImage,
  isPublicHttpUrl,
  resolveGoogleNewsUrl,
} from '@/lib/news/article-composer';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// Trabajo completo del radar: localiza el artículo real, lo lee, redacta el análisis de Invest Oil
// con la IA, trae la imagen destacada y deja el enlace al artículo. Un humano revisa y publica.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const link = typeof body.url === 'string' ? body.url : '';
    if (!isPublicHttpUrl(link)) {
      return NextResponse.json({ error: 'URL de noticia no válida.' }, { status: 400 });
    }

    const warnings: string[] = [];

    const resolved = await resolveGoogleNewsUrl(link);
    if (!resolved) {
      return NextResponse.json(
        { error: 'No se pudo localizar el artículo original de esta noticia. Prueba con otra o usa «Republicar Noticia (Scraper)» con la URL directa.' },
        { status: 502 }
      );
    }

    const article = await extractArticle(resolved);
    const note = await composeAnalysis(article);
    if (!note.aiUsed) {
      warnings.push('No hay un proveedor de IA disponible o no se pudo leer el texto: el borrador solo trae el enlace, la imagen y un esqueleto para redactar.');
    }

    let imageUrl: string | undefined;
    let imageNeedsCompression = false;
    if (article.imageUrl) {
      const img = await importFeaturedImage(article.imageUrl);
      if (img.url) imageUrl = img.url;
      else if (img.tooLarge) {
        imageUrl = article.imageUrl;
        imageNeedsCompression = true;
      } else warnings.push('No se pudo traer la imagen destacada de la noticia.');
    } else {
      warnings.push('La noticia original no publica imagen destacada.');
    }

    const sourceLine =
      `<hr /><p><strong>Fuente original:</strong> <a href="${escapeAttr(article.url)}" target="_blank" rel="noopener noreferrer">` +
      `${article.title.replace(/</g, '&lt;')} — ${article.siteName.replace(/</g, '&lt;')}</a>. ` +
      `Análisis elaborado por Invest Oil LLC a partir de la información publicada por ${article.siteName.replace(/</g, '&lt;')}.</p>`;

    return NextResponse.json({
      success: true,
      title: note.title,
      excerpt: note.excerpt,
      contentHtml: note.html + sourceLine,
      tags: note.tags,
      imageUrl,
      imageNeedsCompression,
      sourceName: article.siteName,
      sourceUrl: article.url,
      publishedAt: article.publishedTime,
      aiUsed: note.aiUsed,
      warnings,
    });
  } catch (err) {
    console.error('[news-agent/compose] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al preparar la noticia' },
      { status: 500 }
    );
  }
}
