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
 * Construye la consulta de Google News para la categoría elegida. «Todas las categorías» combina
 * los términos más representativos de las 10 categorías del negocio (no todos, para no generar una
 * consulta demasiado larga). Un término libre («Otros») sustituye la búsqueda por categoría.
 */
export function buildRadarQuery(categoryId: string | undefined, freeText?: string): string {
  const custom = freeText?.trim();
  if (custom) {
    // Búsqueda puntual: sin comillas ni operadores del usuario, para no romper la consulta a Google News.
    const clean = custom.replace(/["\r\n\t]/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
    return clean;
  }

  const cat = categoryId ? RADAR_CATEGORIES.find((c) => c.id === categoryId) : undefined;
  if (cat) {
    return `(${cat.terms.map(quoteTerm).join(' OR ')})`;
  }

  // «Todas las categorías»: los dos primeros términos de cada una de las 10 categorías listadas.
  const seen = new Set<string>();
  const picked: string[] = [];
  for (const c of RADAR_CATEGORIES) {
    for (const t of c.terms.slice(0, 2)) {
      const key = t.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        picked.push(t);
      }
    }
  }
  return `(${picked.map(quoteTerm).join(' OR ')})`;
}

/**
 * Noticias reales de Google News (RSS) publicadas en la fecha indicada, dentro de la categoría o
 * búsqueda libre indicada. El feed solo trae titular, fuente y enlace: el cuerpo se redacta en el
 * editor, no se copia del medio.
 */
export async function fetchRadarNewsForDate(
  date: string,
  categoryId?: string,
  freeText?: string
): Promise<MarketNewsItem[]> {
  const cacheKey = `${date}::${categoryId || 'all'}::${freeText?.trim().toLowerCase() || ''}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.items;

  const categoryLabel = categoryId ? RADAR_CATEGORIES.find((c) => c.id === categoryId)?.label : undefined;
  const query = buildRadarQuery(categoryId, freeText);
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
      // Con categoría elegida, prevalece su etiqueta oficial sobre la adivinada por palabras clave.
      category: categoryLabel || topic?.category || 'Mercado Petrolero & Precios',
      summary: `Titular publicado por ${source}. Abre el artículo original para leer el contenido completo antes de redactar la nota.`,
      content: `<p>${escapeHtml(title)}</p><p>Noticia publicada por ${escapeHtml(source)} el ${date}. Redacta aquí el análisis de Invest Oil y enlaza el artículo original.</p>`,
      tags,
    });
  }

  cache.set(cacheKey, { at: Date.now(), items });
  return items;
}
