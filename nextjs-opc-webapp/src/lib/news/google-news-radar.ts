import type { MarketNewsItem } from '@/app/api/news-agent/route';

const RADAR_QUERY =
  '(petróleo OR crudo OR Brent OR WTI OR hidrocarburos OR refinería OR combustibles OR "gas natural" OR OPEP OR "coque de petróleo")';

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; items: MarketNewsItem[] }>();

const TOPICS: Array<{ category: string; tag: string; re: RegExp }> = [
  { category: 'Mercado Petrolero & Precios', tag: 'Brent', re: /brent|wti|barril|precio del (petr|crudo)|opep|opec/i },
  { category: 'Logística & Fletes Marítimos', tag: 'Fletes', re: /petrolero|tanquero|buque|flete|naviera|estrecho|canal de suez|vlcc/i },
  { category: 'Refinación & Derivados', tag: 'Refinación', re: /refiner|diésel|diesel|gasolina|combustible|jet a-?1|queroseno/i },
  { category: 'Pet Coke & Commodities Sólidos', tag: 'Pet Coke', re: /coque|pet ?coke|carbón/i },
  { category: 'Compliance & Regulaciones', tag: 'Regulación', re: /sanci|regulaci|norma|arancel|embargo|ofac/i },
];

/** Solo fechas reales con formato AAAA-MM-DD; cualquier otra cosa se rechaza. */
export function parseRadarDate(raw: string | null): string | null {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== raw) return null;
  return raw;
}

function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function tagContent(block: string, tag: string): string {
  // `[^]` casa cualquier carácter (incluye saltos de línea) sin necesitar barras invertidas.
  const m = block.match(new RegExp(`<${tag}(?: [^>]*)?>([^]*?)</${tag}>`, 'i'));
  return m ? decodeEntities(m[1]).trim() : '';
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Noticias reales de Google News (RSS) publicadas en la fecha indicada. El feed solo trae titular,
 * fuente y enlace: el cuerpo se redacta en el editor, no se copia del medio.
 */
export async function fetchRadarNewsForDate(date: string): Promise<MarketNewsItem[]> {
  const hit = cache.get(date);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.items;

  const q = `${RADAR_QUERY} after:${date} before:${nextDay(date)}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es&gl=ES&ceid=ES:es`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InvestOilRadar/1.0)' },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google News respondió ${res.status}`);
  const xml = await res.text();

  const items: MarketNewsItem[] = [];
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  for (const block of blocks.slice(0, 25)) {
    const rawTitle = tagContent(block, 'title');
    const link = tagContent(block, 'link');
    const pubDate = tagContent(block, 'pubDate');
    const source = tagContent(block, 'source') || 'Google News';
    if (!rawTitle || !/^https?:\/\//.test(link)) continue;

    const title = rawTitle.endsWith(` - ${source}`) ? rawTitle.slice(0, -(source.length + 3)) : rawTitle;
    const published = new Date(pubDate);
    const topic = TOPICS.find((t) => t.re.test(title));
    const tags = ['Google News', source, ...(topic ? [topic.tag] : [])];

    items.push({
      id: `gn-${date}-${items.length}-${Buffer.from(link).toString('base64url').slice(-12)}`,
      title,
      source,
      sourceUrl: link,
      publishedAt: Number.isNaN(published.getTime()) ? `${date}T12:00:00.000Z` : published.toISOString(),
      category: topic?.category || 'Mercado Petrolero & Precios',
      summary: `Titular publicado por ${source}. Abre el artículo original para leer el contenido completo antes de redactar la nota.`,
      content: `<p>${escapeHtml(title)}</p><p>Noticia publicada por ${escapeHtml(source)} el ${date}. Redacta aquí el análisis de Invest Oil y enlaza el artículo original.</p>`,
      tags,
    });
  }

  cache.set(date, { at: Date.now(), items });
  return items;
}
