import { executeAiTask } from '@/lib/ai/ai-client';
import { storeUploadedFile } from '@/lib/media/store-upload';

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const NL = String.fromCharCode(10);
const MAX_HTML_BYTES = 3 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // mismo tope que la subida manual
const MAX_SOURCE_CHARS = 7000;

/** Solo se leen direcciones públicas: el radar no debe servir para sondear la red interna. */
export function isPublicHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || h === '[::1]') return false;
    if (/^(127|10|0)[.]/.test(h) || /^192[.]168[.]/.test(h) || /^169[.]254[.]/.test(h) || /^172[.](1[6-9]|2[0-9]|3[01])[.]/.test(h)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function fetchText(url: string, init: RequestInit = {}, timeoutMs = 12000): Promise<{ text: string; finalUrl: string }> {
  const res = await fetch(url, {
    ...init,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html,application/xhtml+xml', ...(init.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`El servidor respondió ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return { text: buf.subarray(0, MAX_HTML_BYTES).toString('utf-8'), finalUrl: res.url || url };
}

/**
 * Los enlaces del RSS de Google News son redirecciones cifradas. Se resuelven pidiendo a Google la
 * URL real del artículo (el mismo intercambio que hace su página); si falla se devuelve null.
 */
export async function resolveGoogleNewsUrl(link: string): Promise<string | null> {
  let u: URL;
  try {
    u = new URL(link);
  } catch {
    return null;
  }
  if (u.hostname !== 'news.google.com') return link;

  const parts = u.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];
  if (!id || parts[parts.length - 2] !== 'articles') return null;

  try {
    const page = await fetchText(`https://news.google.com/rss/articles/${id}?hl=es&gl=ES`);
    // Algunos enlaces antiguos ya redirigen al medio.
    if (!page.finalUrl.includes('news.google.com')) return page.finalUrl;

    const sg = page.text.match(/data-n-a-sg="([^"]+)"/)?.[1];
    const ts = page.text.match(/data-n-a-ts="([^"]+)"/)?.[1];
    if (!sg || !ts) return null;

    const inner = JSON.stringify([
      'garturlreq',
      [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
      id,
      Number(ts),
      sg,
    ]);
    const freq = JSON.stringify([[['Fbv4je', inner, null, 'generic']]]);
    const res = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': BROWSER_UA },
      body: `f.req=${encodeURIComponent(freq)}`,
      signal: AbortSignal.timeout(12000),
    });
    const body = await res.text();
    const blocks = body.split(NL + NL);
    const data = JSON.parse(blocks[1] || '[]');
    const payload = JSON.parse(data[0][2]);
    const real = payload[1];
    return typeof real === 'string' && isPublicHttpUrl(real) ? real : null;
  } catch (err) {
    console.warn('[news-composer] No se pudo resolver el enlace de Google News:', err instanceof Error ? err.message : err);
    return null;
  }
}

export interface ExtractedArticle {
  url: string;
  title: string;
  description: string;
  siteName: string;
  imageUrl: string | null;
  publishedTime: string | null;
  text: string;
}

function metaContent(html: string, key: string): string | null {
  const tags = html.match(/<meta[^>]+>/gi) || [];
  for (const tag of tags) {
    const k = tag.match(/(?:property|name)=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (k === key.toLowerCase()) {
      const c = tag.match(/content=["']([^"']*)["']/i)?.[1];
      if (c) return decodeEntities(c).trim();
    }
  }
  return null;
}

/** Título, descripción, imagen destacada y texto del artículo en la página de origen. */
export async function extractArticle(url: string): Promise<ExtractedArticle> {
  const { text: html, finalUrl } = await fetchText(url);
  const host = new URL(finalUrl).hostname.replace('www.', '');

  const canonicalRaw =
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || metaContent(html, 'og:url');
  let articleUrl = finalUrl;
  if (canonicalRaw) {
    try {
      const c = new URL(canonicalRaw, finalUrl);
      // Un canonical que apunta a la portada no sirve de enlace profundo.
      if (c.pathname.length > 1 && isPublicHttpUrl(c.toString())) articleUrl = c.toString();
    } catch {
      // se conserva la URL final
    }
  }

  const title = metaContent(html, 'og:title') || decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || host);
  const description = metaContent(html, 'og:description') || metaContent(html, 'description') || '';
  const siteName = metaContent(html, 'og:site_name') || host;
  const imageRaw = metaContent(html, 'og:image') || metaContent(html, 'twitter:image');
  let imageUrl: string | null = null;
  if (imageRaw) {
    try {
      const abs = new URL(imageRaw, finalUrl).toString();
      imageUrl = isPublicHttpUrl(abs) ? abs : null;
    } catch {
      imageUrl = null;
    }
  }

  // Cuerpo: párrafos del <article> (o de la página si no lo hay), sin scripts ni menús.
  const article = html.match(/<article[^>]*>([^]*?)<\/article>/i)?.[1] || html;
  const cleaned = article
    .replace(/<(script|style|nav|footer|aside|header|form|noscript|figure)[^>]*>[^]*?<\/\1>/gi, ' ');
  const paragraphs = (cleaned.match(/<p[^>]*>[^]*?<\/p>/gi) || [])
    .map((p) => decodeEntities(p.replace(/<[^>]+>/g, ' ')).replace(/ +/g, ' ').trim())
    .filter((p) => p.length >= 50);
  const text = paragraphs.join(NL + NL).slice(0, MAX_SOURCE_CHARS);

  return {
    url: articleUrl,
    title: title.trim(),
    description: description || paragraphs[0]?.slice(0, 220) || '',
    siteName,
    imageUrl,
    publishedTime: metaContent(html, 'article:published_time'),
    text,
  };
}

/** Descarga la imagen destacada y la guarda en la biblioteca; devuelve la URL local o null. */
export async function importFeaturedImage(imageUrl: string): Promise<{ url: string | null; tooLarge: boolean }> {
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': BROWSER_UA, Accept: 'image/*' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { url: null, tooLarge: false };
    const mime = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const ext = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' } as Record<string, string>)[mime];
    if (!ext) return { url: null, tooLarge: false };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_IMAGE_BYTES) return { url: null, tooLarge: true };
    const stored = await storeUploadedFile(buf, `noticia-${Date.now()}.${ext}`, mime, false);
    return { url: stored.publicUrl, tooLarge: false };
  } catch {
    return { url: null, tooLarge: false };
  }
}

export interface ComposedNote {
  title: string;
  excerpt: string;
  html: string;
  tags: string[];
  aiUsed: boolean;
}

const SYSTEM_PROMPT = [
  'Eres analista senior de mercados energéticos de Invest Oil LLC (Delaware, con oficinas en Houston, Madrid y Bogotá),',
  'empresa facilitadora del comercio de crudo y derivados (EN590, Jet A-1, Merey 16, coque de petróleo).',
  'Redactas notas de análisis originales a partir de una noticia publicada por otro medio.',
  'Reglas: 1) Escribe con tus propias palabras; no copies frases del texto fuente (como mucho una cita de menos de 15 palabras entre comillas).',
  '2) Usa solo los hechos, cifras y nombres que aparezcan en el texto fuente; no inventes datos ni fechas.',
  '3) Explica qué significa para compradores, vendedores, refinerías y logística del sector. No des recomendaciones de inversión.',
  '4) Tono ejecutivo, claro y riguroso, en español neutro. Entre 350 y 550 palabras.',
  '5) Estructura: entradilla breve y 3 o 4 secciones con subtítulo <h2> y párrafos <p>; termina con una sección "Lectura para el mercado".',
  '6) No menciones que eres una IA ni incluyas la fuente (se añade aparte).',
  'Responde SOLO con un objeto JSON válido con las claves: "title" (titular propio, máx. 110 caracteres),',
  '"excerpt" (resumen de 1 o 2 frases, máx. 220 caracteres), "html" (cuerpo en HTML con <h2> y <p>) y "tags" (de 4 a 6 etiquetas).',
].join(' ');

function parseJsonObject(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

/** Parafrasea la noticia como análisis de Invest Oil con la IA configurada; sin IA deja un esqueleto honesto. */
export async function composeAnalysis(article: ExtractedArticle): Promise<ComposedNote> {
  const source = article.text || article.description;
  if (source.length >= 120) {
    const reply = await executeAiTask(
      SYSTEM_PROMPT,
      `Medio: ${article.siteName}${NL}Titular original: ${article.title}${NL}Fecha: ${article.publishedTime || 'no indicada'}${NL}${NL}Texto de la noticia:${NL}${source}`,
      { maxTokens: 2500, timeoutMs: 60000 }
    );
    const obj = reply ? parseJsonObject(reply) : null;
    if (obj && typeof obj.title === 'string' && typeof obj.html === 'string' && obj.html.length > 200) {
      const tags = Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === 'string').slice(0, 6) : [];
      return {
        title: obj.title.trim().slice(0, 140),
        excerpt: typeof obj.excerpt === 'string' ? obj.excerpt.trim().slice(0, 260) : article.description.slice(0, 220),
        html: obj.html.trim(),
        tags,
        aiUsed: true,
      };
    }
  }

  // Sin IA disponible (o sin texto legible): no se inventa un análisis ni se copia el artículo.
  return {
    title: article.title,
    excerpt: article.description.slice(0, 220),
    html: `<p>${escapeHtml(article.description || article.title)}</p><p>Redacta aquí el análisis de Invest Oil sobre esta noticia.</p>`,
    tags: [],
    aiUsed: false,
  };
}
