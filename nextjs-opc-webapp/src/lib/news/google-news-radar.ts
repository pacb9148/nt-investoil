import type { MarketNewsItem } from '@/app/api/news-agent/route';

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { at: number; items: MarketNewsItem[] }>();

export interface RadarCategory {
  id: string;
  label: string;
  /** Términos de búsqueda en español para Google News (frases entre comillas si tienen más de una palabra). */
  terms: string[];
}

/** Las 10 categorías del negocio de Invest Oil que ofrece el selector del radar. */
export const RADAR_CATEGORIES: RadarCategory[] = [
  { id: 'mercado', label: 'Mercado Petrolero & Precios', terms: ['Brent', 'WTI', 'precio del petróleo', 'OPEP', 'barril de crudo'] },
  { id: 'crudos', label: 'Crudos Pesados & Merey', terms: ['Merey 16', 'crudo pesado', 'crudo Venezuela', 'gravedad API'] },
  { id: 'refinacion', label: 'Refinación & Derivados', terms: ['refinería', 'refino de petróleo', 'gasolina', 'nafta'] },
  { id: 'diesel', label: 'Diésel & Combustibles de Transporte', terms: ['diésel', 'EN590', 'gasoil', 'combustible de transporte'] },
  { id: 'aviacion', label: 'Combustibles de Aviación', terms: ['Jet Fuel', 'Jet A-1', 'queroseno de aviación', 'combustible de aviación'] },
  { id: 'petcoke', label: 'Pet Coke & Commodities Sólidos', terms: ['coque de petróleo', 'pet coke', 'coque verde'] },
  { id: 'logistica', label: 'Logística Marítima & Fletes', terms: ['tanquero petrolero', 'VLCC', 'flete marítimo', 'canal de Suez', 'estrecho de Ormuz'] },
  { id: 'gas', label: 'Gas Natural & GNL', terms: ['gas natural', 'GNL', 'gas natural licuado'] },
  { id: 'compliance', label: 'Cumplimiento & Sanciones', terms: ['sanciones petroleras', 'OFAC', 'embargo petrolero'] },
  { id: 'transicion', label: 'Transición Energética & Sostenibilidad', terms: ['transición energética', 'energías renovables', 'descarbonización'] },
];

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

function quoteTerm(t: string): string {
  return t.includes(' ') ? `"${t}"` : t;
}

/**
 * Consulta de Google News para un conjunto de términos. Cada consulta se mantiene corta a
 * propósito: con ~20 términos combinados Google ignora `after:`/`before:` y devuelve siempre las
 * noticias de hoy, sea cual sea la fecha pedida.
 */
export function buildRadarQuery(terms: string[]): string {
  return `(${terms.map(quoteTerm).join(' OR ')})`;
}

/** Término libre («Otros»): sin comillas ni saltos de línea, para no romper la consulta. */
function cleanFreeText(raw: string): string {
  return raw.replace(/["\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
}

// Día natural del editor (España): el RSS trae marcas UTC y Google deja pasar noticias vecinas.
const RADAR_TIMEZONE = 'Europe/Madrid';
const MAX_RADAR_ITEMS = 40;

function dayInRadarZone(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: RADAR_TIMEZONE });
}

async function fetchFeedItems(
  query: string,
  date: string,
  label: string | undefined
): Promise<MarketNewsItem[]> {
  const q = `${query} after:${date} before:${nextDay(date)}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=es&gl=ES&ceid=ES:es`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InvestOilRadar/1.0)' },
    signal: AbortSignal.timeout(12000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Google News respondió ${res.status}`);
  const xml = await res.text();

  const items: MarketNewsItem[] = [];
  for (const block of xml.match(/<item>[\s\S]*?<\/item>/g) || []) {
    const rawTitle = tagContent(block, 'title');
    const link = tagContent(block, 'link');
    const source = tagContent(block, 'source') || 'Google News';
    const published = new Date(tagContent(block, 'pubDate'));
    if (!rawTitle || !/^https?:\/\//.test(link) || Number.isNaN(published.getTime())) continue;
    // La fecha pedida manda: lo publicado otro día se descarta aunque Google lo devuelva.
    if (dayInRadarZone(published) !== date) continue;

    const title = rawTitle.endsWith(` - ${source}`) ? rawTitle.slice(0, -(source.length + 3)) : rawTitle;
    const topic = TOPICS.find((t) => t.re.test(title));
    items.push({
      id: `gn-${date}-${Buffer.from(link).toString('base64url').slice(-14)}`,
      title,
      source,
      sourceUrl: link,
      publishedAt: published.toISOString(),
      // Con categoría conocida prevalece su etiqueta oficial sobre la adivinada por palabras clave.
      category: label || topic?.category || 'Mercado Petrolero & Precios',
      summary: `Titular publicado por ${source}. Abre el artículo original para leer el contenido completo antes de redactar la nota.`,
      content: `<p>${escapeHtml(title)}</p><p>Noticia publicada por ${escapeHtml(source)} el ${date}. Redacta aquí el análisis de Invest Oil y enlaza el artículo original.</p>`,
      tags: ['Google News', source, ...(topic ? [topic.tag] : [])],
    });
  }
  return items;
}

/**
 * Noticias reales de Google News (RSS) publicadas en la fecha indicada. «Todas las categorías» lanza
 * una consulta por categoría (en paralelo) y las une sin duplicados; una categoría o un término libre
 * («Otros») lanza una sola. El feed solo trae titular, fuente y enlace: el cuerpo se redacta en el
 * editor, no se copia del medio.
 */
export async function fetchRadarNewsForDate(
  date: string,
  categoryId?: string,
  freeText?: string
): Promise<MarketNewsItem[]> {
  const custom = freeText ? cleanFreeText(freeText) : '';
  const cacheKey = `${date}::${categoryId || 'all'}::${custom.toLowerCase()}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.items;

  const cat = categoryId ? RADAR_CATEGORIES.find((c) => c.id === categoryId) : undefined;
  const jobs: Array<{ query: string; label?: string }> = custom
    ? [{ query: custom }]
    : (cat ? [cat] : RADAR_CATEGORIES).map((c) => ({ query: buildRadarQuery(c.terms), label: c.label }));

  const settled = await Promise.allSettled(jobs.map((j) => fetchFeedItems(j.query, date, j.label)));
  const ok = settled.filter((r): r is PromiseFulfilledResult<MarketNewsItem[]> => r.status === 'fulfilled');
  // Solo es un fallo si no respondió ninguna consulta; con respuestas parciales se muestra lo que hay.
  if (ok.length === 0) {
    const reason = (settled[0] as PromiseRejectedResult).reason;
    throw reason instanceof Error ? reason : new Error('Google News no respondió');
  }

  const byLink = new Map<string, MarketNewsItem>();
  for (const r of ok) for (const item of r.value) if (!byLink.has(item.sourceUrl)) byLink.set(item.sourceUrl, item);
  const items = [...byLink.values()]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_RADAR_ITEMS);

  cache.set(cacheKey, { at: Date.now(), items });
  return items;
}
