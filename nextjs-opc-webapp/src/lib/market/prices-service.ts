import { getSectionContent } from '@/lib/services/content-service';
import type { CommodityPrice, ManualCommodity, MarketPricesConfig } from './prices-types';

export const MARKET_CONFIG_SECTION = 'market_prices_config';

interface EiaSeries {
  symbol: string;
  name: string;
  /** Endpoint de la EIA donde vive la serie (ruta bajo https://api.eia.gov/v2/). */
  route: string;
  series: string;
  unit: string;
}

// Series oficiales de la EIA (fuente gubernamental de EE. UU.). Los IDs se verificaron contra
// /facet/series de la propia API; las unidades son las que publica la EIA, sin conversiones.
export const EIA_SERIES: EiaSeries[] = [
  { symbol: 'BRENT', name: 'Petróleo Brent (spot Europa)', route: 'petroleum/pri/spt', series: 'RBRTE', unit: '/bbl' },
  { symbol: 'WTI', name: 'Petróleo WTI (Cushing, OK)', route: 'petroleum/pri/spt', series: 'RWTC', unit: '/bbl' },
  { symbol: 'NATGAS', name: 'Gas Natural Henry Hub', route: 'natural-gas/pri/fut', series: 'RNGWHHD', unit: '/MMBtu' },
  { symbol: 'ULSD', name: 'Diésel ULSD (Costa del Golfo EE. UU.)', route: 'petroleum/pri/spt', series: 'EER_EPD2DXL0_PF4_RGC_DPG', unit: '/gal' },
  { symbol: 'JET-A1', name: 'Jet Fuel tipo queroseno (Costa del Golfo)', route: 'petroleum/pri/spt', series: 'EER_EPJK_PF4_RGC_DPG', unit: '/gal' },
];

// Productos sin serie gratuita oficial: se muestran con el valor que ponga el admin (y salen marcados
// como «manual» en el backoffice) en vez de presentarse como un precio de mercado en vivo.
export const DEFAULT_MANUAL: ManualCommodity[] = [
  { symbol: 'MEREY-16', name: 'Crudo Merey 16', unit: '/bbl', price: 69.8, changePercent: 0 },
  { symbol: 'PETCOKE', name: 'Pet Coke Verde', unit: '/MT', price: 118.5, changePercent: 0 },
  { symbol: 'CPC-ANODE', name: 'Pet Coke Calcinado', unit: '/MT', price: 385, changePercent: 0 },
  { symbol: 'IFO-380', name: 'Fuel Oil 380 CST', unit: '/MT', price: 465, changePercent: 0 },
  { symbol: 'MGO 0.1%', name: 'Gasóleo Marino MGO', unit: '/MT', price: 795, changePercent: 0 },
  { symbol: 'LNG-DES', name: 'GNL Criogénico DES', unit: '/MMBtu', price: 13.85, changePercent: 0 },
  { symbol: 'DUBAI', name: 'Crudo Dubai', unit: '/bbl', price: 80.15, changePercent: 0 },
];

const CACHE_MS = 15 * 60 * 1000;
// Si la EIA falla (límite de consultas, clave inválida, caída) se recuerda el fallo un rato para no
// reintentar —y retrasar la página— en cada visita.
const FAILURE_CACHE_MS = 2 * 60 * 1000;
let cache: { at: number; key: string; data: CommodityPrice[]; failed?: boolean } | null = null;

export function clearMarketPricesCache() {
  cache = null;
}

export async function getMarketConfig(): Promise<MarketPricesConfig> {
  return getSectionContent<MarketPricesConfig>(MARKET_CONFIG_SECTION, {});
}

/** Clave de la EIA: la del backoffice, luego la variable de entorno; DEMO_KEY (limitada) como último recurso. */
export function resolveEiaKey(config: MarketPricesConfig): { key: string; origin: 'panel' | 'env' | 'demo' } {
  const fromPanel = (config.eiaApiKey || '').trim();
  if (fromPanel) return { key: fromPanel, origin: 'panel' };
  const fromEnv = (process.env.EIA_API_KEY || '').trim();
  if (fromEnv) return { key: fromEnv, origin: 'env' };
  return { key: 'DEMO_KEY', origin: 'demo' };
}

async function fetchEiaGroup(route: string, seriesIds: string[], apiKey: string) {
  const qs = new URLSearchParams();
  qs.set('api_key', apiKey);
  qs.set('frequency', 'daily');
  qs.append('data[0]', 'value');
  for (const s of seriesIds) qs.append('facets[series][]', s);
  qs.set('sort[0][column]', 'period');
  qs.set('sort[0][direction]', 'desc');
  qs.set('length', String(seriesIds.length * 6));
  const res = await fetch(`https://api.eia.gov/v2/${route}/data/?${qs.toString()}`, { cache: 'no-store', signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`EIA respondió ${res.status}`);
  const json = (await res.json()) as {
    response?: { data?: Array<{ period: string; series: string; value: string | number | null }> };
  };
  return json.response?.data ?? [];
}

async function fetchEiaPrices(apiKey: string, hidden: string[]): Promise<CommodityPrice[]> {
  const wanted = EIA_SERIES.filter((s) => !hidden.includes(s.symbol));
  const byRoute = new Map<string, EiaSeries[]>();
  for (const s of wanted) byRoute.set(s.route, [...(byRoute.get(s.route) || []), s]);

  const rows: Array<{ period: string; series: string; value: string | number | null }> = [];
  for (const [route, list] of Array.from(byRoute.entries())) {
    try {
      rows.push(...(await fetchEiaGroup(route, list.map((s) => s.series), apiKey)));
    } catch (e) {
      console.warn(`[market-prices] EIA ${route}:`, e instanceof Error ? e.message : e);
    }
  }

  const out: CommodityPrice[] = [];
  for (const s of wanted) {
    const points = rows
      .filter((r) => r.series === s.series && r.value !== null && r.value !== '' && !Number.isNaN(Number(r.value)))
      .sort((a, b) => b.period.localeCompare(a.period));
    if (points.length === 0) continue;
    const latest = Number(points[0].value);
    const prev = points[1] ? Number(points[1].value) : latest;
    out.push({
      name: s.name,
      symbol: s.symbol,
      price: latest,
      currency: 'USD',
      unit: s.unit,
      changePercent: prev ? ((latest - prev) / prev) * 100 : 0,
      updatedAt: new Date().toISOString(),
      source: 'eia',
      asOf: points[0].period,
    });
  }
  return out;
}

export function effectiveManual(config: MarketPricesConfig): ManualCommodity[] {
  return config.manual && config.manual.length > 0 ? config.manual : DEFAULT_MANUAL;
}

export async function getMarketPrices(opts: { force?: boolean } = {}): Promise<CommodityPrice[]> {
  const config = await getMarketConfig();
  const { key } = resolveEiaKey(config);
  const hidden = config.hiddenEia || [];
  const cacheKey = `${key}|${hidden.join(',')}`;

  if (!opts.force && cache && cache.key === cacheKey && Date.now() - cache.at < (cache.failed ? FAILURE_CACHE_MS : CACHE_MS)) {
    return cache.data;
  }

  let eia: CommodityPrice[] = [];
  try {
    eia = await fetchEiaPrices(key, hidden);
  } catch (e) {
    console.warn('[market-prices] fallo consultando EIA:', e);
  }

  // Si la EIA no responde, se conserva el último dato bueno en memoria antes que mostrar números inventados.
  if (eia.length === 0) {
    const lastGood = cache ? cache.data.filter((c) => c.source === 'eia') : [];
    const data = [...lastGood, ...manualList(config)];
    cache = { at: Date.now(), key: cacheKey, data, failed: true };
    return data;
  }

  const data = [...eia, ...manualList(config)];
  cache = { at: Date.now(), key: cacheKey, data };
  return data;
}

function manualList(config: MarketPricesConfig): CommodityPrice[] {
  const now = new Date().toISOString();
  return effectiveManual(config)
    .filter((m) => !m.hidden)
    .map((m) => ({
      name: m.name,
      symbol: m.symbol,
      price: Number(m.price) || 0,
      currency: 'USD',
      unit: m.unit,
      changePercent: Number(m.changePercent) || 0,
      updatedAt: now,
      source: 'manual' as const,
    }));
}
