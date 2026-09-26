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

    // Asegurar que el enlace apunte directamente al artículo y no a una portada genérica
    let deepArticleUrl = url;
    if (canonical && typeof canonical === 'string') {
      try {
        const parsedCanonical = new URL(canonical, url);
        // Si el canonical tiene ruta específica (más allá de la raíz /), es válido
        if (parsedCanonical.pathname && parsedCanonical.pathname.length > 1) {
          deepArticleUrl = parsedCanonical.toString();
        }
      } catch {
        deepArticleUrl = url;
      }
    }

    // Extracción de video desde la fuente (OG, Twitter player, iframe embebido o tag video)
    const ogVideo =
      getMeta('og:video:secure_url') ||
      getMeta('og:video:url') ||
      getMeta('og:video') ||
      getMeta('twitter:player:stream') ||
      getMeta('twitter:player');

    let resolvedVideo: string | null = null;
    if (ogVideo) {
      try {
        resolvedVideo = new URL(ogVideo, url).toString();
      } catch {
        resolvedVideo = ogVideo;
      }
    }

    // Búsqueda secundaria de iframe de video o tag video si no vino en OG
    if (!resolvedVideo) {
      const iframeVideoMatch = html.match(
        /<iframe[^>]+src=["'](https?:\/\/(?:www\.)?(?:youtube\.com\/embed|player\.vimeo\.com|dailymotion\.com\/embed)[^"']+)["']/i
      );
      if (iframeVideoMatch) {
        resolvedVideo = iframeVideoMatch[1];
      } else {
        const videoSrcMatch = html.match(/<video[^>]*>[\s\S]*?<source[^>]+src=["']([^"']+)["']/i);
        if (videoSrcMatch) {
          try {
            resolvedVideo = new URL(videoSrcMatch[1], url).toString();
          } catch {
            resolvedVideo = videoSrcMatch[1];
          }
        }
      }
    }

    // Resolve relative image URLs
    let resolvedImage = ogImage;
    if (ogImage && !ogImage.startsWith('http')) {
      try {
        resolvedImage = new URL(ogImage, url).toString();
      } catch {
        resolvedImage = null;
      }
    }

    // Verificación ligera del tamaño de la imagen original
    let imageSize: number | undefined = undefined;
    let imageNeedsCompression = false;
    const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB

    if (resolvedImage) {
      try {
        const imgHeadRes = await fetch(resolvedImage, {
          method: 'HEAD',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        }).catch(() => null);

        if (imgHeadRes && imgHeadRes.ok) {
          const cl = imgHeadRes.headers.get('content-length');
          if (cl) {
            imageSize = parseInt(cl, 10);
            if (!isNaN(imageSize) && imageSize > MAX_IMAGE_SIZE) {
              imageNeedsCompression = true;
            }
          }
        }
      } catch {
        // Ignorar si el servidor remoto de la imagen bloquea HEAD
      }
    }

    return NextResponse.json({
      sourceUrl: deepArticleUrl,
      sourceName: ogSiteName,
      title: ogTitle ? ogTitle.trim() : 'Noticia sobre Energía y Petróleo',
      excerpt: ogDescription ? ogDescription.trim() : '',
      imageUrl: resolvedImage,
      videoUrl: resolvedVideo || undefined,
      imageSize,
      imageNeedsCompression,
      publishedAt: new Date().toISOString(),
      canonicalUrl: deepArticleUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al procesar metadatos de la noticia' },
      { status: 500 }
    );
  }
}
