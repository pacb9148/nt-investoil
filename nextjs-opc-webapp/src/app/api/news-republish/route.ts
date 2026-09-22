import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    const parsedUrl = new URL(url);

    // Fetch URL HTML content with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    }).catch((err) => {
      throw new Error('No se pudo acceder a la URL: ' + err.message);
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `El servidor remoto respondió con código ${res.status}` },
        { status: 400 }
      );
    }

    const html = await res.text();

    // Regex extraction for OG and meta tags
    const getMeta = (property: string) => {
      const match =
        html.match(new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i')) ||
        html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'));
      return match ? match[1] : null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const ogTitle = getMeta('og:title') || (titleMatch ? titleMatch[1] : parsedUrl.hostname);
    const ogDescription = getMeta('og:description') || getMeta('description') || '';
    const ogImage = getMeta('og:image') || getMeta('twitter:image') || null;
    const ogSiteName = getMeta('og:site_name') || parsedUrl.hostname.replace('www.', '');

    let canonical = getMeta('og:url');
    if (!canonical) {
      const canonMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
      canonical = canonMatch ? canonMatch[1] : url;
    }

    // Resolve relative image URLs
    let resolvedImage = ogImage;
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        resolvedImage = new URL(ogImage, url).toString();
      } catch (e) {
        resolvedImage = null;
      }
    }

    return NextResponse.json({
      sourceUrl: url,
      sourceName: ogSiteName,
      title: ogTitle ? ogTitle.trim() : 'Noticia sobre Energía y Petróleo',
      excerpt: ogDescription ? ogDescription.trim() : '',
      imageUrl: resolvedImage,
      publishedAt: new Date().toISOString(),
      canonicalUrl: canonical,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al procesar metadatos de la noticia' },
      { status: 500 }
    );
  }
}
