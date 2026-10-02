import { getSectionContent } from '@/lib/services/content-service';
import type { CommodityPrice, ManualCommodity, MarketPricesConfig } from './prices-types';

export const MARKET_CONFIG_SECTION = 'market_prices_config';

interface PriceSeries {
  symbol: string;
  name: string;
  unit: string;
  /** Contrato de futuros cotizado casi en tiempo real (Yahoo Finance). */
  live?: string;
  /** Serie oficial diaria de la EIA (ruta bajo https://api.eia.gov/v2/ + ID de serie). */
  eia?: { route: string; series: string };
}

// Orden de aparición en el cintillo. Primero se intenta la cotización en vivo; si no responde, el cierre
// oficial diario de la EIA. IDs de la EIA verificados contra /facet/series; unidades tal como las publica
// cada fuente, sin conversiones inventadas.
export const PRICE_SERIES: PriceSeries[] = [
  { symbol: 'BRENT', name: 'Petróleo Brent', unit: '/bbl', live: 'BZ=F', eia: { route: 'petroleum/pri/spt', series: 'RBRTE' } },
  { symbol: 'WTI', name: 'Petróleo WTI', unit: '/bbl', live: 'CL=F', eia: { route: 'petroleum/pri/spt', series: 'RWTC' } },
  { symbol: 'HEATING-OIL', name: 'Heating Oil / Gasóleo (NYMEX)', unit: '/gal', live: 'HO=F' },
  { symbol: 'ULSD', name: 'Diésel ULSD (Costa del Golfo EE. UU.)', unit: '/gal', eia: { route: 'petroleum/pri/spt', series: 'EER_EPD2DXL0_PF4_RGC_DPG' } },
  { symbol: 'JET-A1', name: 'Jet Fuel tipo queroseno (Costa del Golfo)', unit: '/gal', eia: { route: 'petroleum/pri/spt', series: 'EER_EPJK_PF4_RGC_DPG' } },
  { symbol: 'GASOLINA', name: 'Gasolina RBOB (NYMEX)', unit: '/gal', live: 'RB=F' },
  { symbol: 'NATGAS', name: 'Gas Natural Henry Hub', unit: '/MMBtu', live: 'NG=F', eia: { route: 'natural-gas/pri/fut', series: 'RNGWHHD' } },
];

// Productos sin cotización gratuita: se muestran con el valor que ponga el admin (y salen marcados
// como «manual» en el backoffice) en vez de presentarse como un precio de mercado.
export const DEFAULT_MANUAL: ManualCommodity[] = [
  { symbol: 'IFO-380', name: 'Fuel Oil 380 CST', unit: '/MT', price: 465, changePercent: 0 },
  { symbol: 'MGO 0.1%', name: 'Gasóleo Marino MGO', unit: '/MT', price: 795, changePercent: 0 },
  { symbol: 'MEREY-16', name: 'Crudo Merey 16', unit: '/bbl', price: 69.8, changePercent: 0 },
  { symbol: 'DUBAI', name: 'Crudo Dubai', unit: '/bbl', price: 80.15, changePercent: 0 },
  { symbol: 'PETCOKE', name: 'Pet Coke Verde', unit: '/MT', price: 118.5, changePercent: 0 },
  { symbol: 'CPC-ANODE', name: 'Pet Coke Calcinado', unit: '/MT', price: 385, changePercent: 0 },
  { symbol: 'LNG-DES', name: 'GNL Criogénico DES', unit: '/MMBtu', price: 13.85, changePercent: 0 },
];

const LIVE_CACHE_MS = 60 * 1000; // cotización en vivo: como mucho 1 minuto de antigüedad
const EIA_CACHE_MS = 15 * 60 * 1000; // la EIA publica una vez al día; la clave gratuita tiene límite de consultas
const FAILURE_CACHE_MS = 2 * 60 * 1000; // un fallo se recuerda un rato para no frenar cada visita

let liveCache: { at: number; ok: boolean; data: Map<string, CommodityPrice> } | null = null;
let eiaCache: { at: number; key: string; ok: boolean; data: Map<string, CommodityPrice> } | null = null;

export function clearMarketPricesCache() {
  liveCache = null;
  eiaCache = null;
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

// ---------------------------------------------------------------------------------------------
// Cotización en vivo (futuros) — endpoint público de gráficos de Yahoo Finance
// ---------------------------------------------------------------------------------------------
async function fetchLiveQuote(series: PriceSeries): Promise<CommodityPrice | null> {
  if (!series.live) return null;
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(series.live)}?interval=1m&range=1d`,
      { cache: 'no-store', signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; chartPreviousClose?: number; regularMarketTime?: number } }> };
    };
    const meta = json.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== 'number' || !Number.isFinite(price)) return null;
    const prev = meta?.chartPreviousClose;
    const asOf = meta?.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString();
    return {
      name: series.name,
      symbol: series.symbol,
      price,
      currency: 'USD',
      unit: series.unit,
      changePercent: prev ? ((price - prev) / prev) * 100 : 0,
      updatedAt: new Date().toISOString(),
      source: 'live',
      asOf,
    };
  } catch (e) {
    console.warn(`[market-prices] cotización en vivo ${series.live}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function getLiveQuotes(force: boolean): Promise<Map<string, CommodityPrice>> {
  if (!force && liveCache && Date.now() - liveCache.at < (liveCache.ok ? LIVE_CACHE_MS : FAILURE_CACHE_MS)) {
    return liveCache.data;
  }
  const results = await Promise.all(PRICE_SERIES.map((s) => fetchLiveQuote(s)));
  const data = new Map<string, CommodityPrice>();
  results.forEach((r) => r && data.set(r.symbol, r));
  // Si todo falla se conserva lo último bueno (mejor un precio de hace unos minutos que ninguno).
  if (data.size === 0 && liveCache) {
    liveCache = { at: Date.now(), ok: false, data: liveCache.data };
    return liveCache.data;
  }
  liveCache = { at: Date.now(), ok: data.size > 0, data };
  return data;
}

// ---------------------------------------------------------------------------------------------
// Cierres diarios oficiales — API de la EIA
// ---------------------------------------------------------------------------------------------
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

async function getEiaPrices(wanted: PriceSeries[], apiKey: string, force: boolean): Promise<Map<string, CommodityPrice>> {
  const cacheKey = `${apiKey}|${wanted.map((s) => s.symbol).join(',')}`;
  if (!force && eiaCache && eiaCache.key === cacheKey && Date.now() - eiaCache.at < (eiaCache.ok ? EIA_CACHE_MS : FAILURE_CACHE_MS)) {
    return eiaCache.data;
  }

  const byRoute = new Map<string, PriceSeries[]>();
  for (const s of wanted) if (s.eia) byRoute.set(s.eia.route, [...(byRoute.get(s.eia.route) || []), s]);

  const rows: Array<{ period: string; series: string; value: string | number | null }> = [];
  for (const [route, list] of Array.from(byRoute.entries())) {
    try {
      rows.push(...(await fetchEiaGroup(route, list.map((s) => s.eia!.series), apiKey)));
    } catch (e) {
      console.warn(`[market-prices] EIA ${route}:`, e instanceof Error ? e.message : e);
    }
  }

  const data = new Map<string, CommodityPrice>();
  for (const s of wanted) {
    const points = rows
      .filter((r) => r.series === s.eia!.series && r.value !== null && r.value !== '' && !Number.isNaN(Number(r.value)))
      .sort((a, b) => b.period.localeCompare(a.period));
    if (points.length === 0) continue;
    const latest = Number(points[0].value);
    const prev = points[1] ? Number(points[1].value) : latest;
    data.set(s.symbol, {
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
  eiaCache = { at: Date.now(), key: cacheKey, ok: data.size > 0, data };
  return data;
}

export function effectiveManual(config: MarketPricesConfig): ManualCommodity[] {
  return config.manual && config.manual.length > 0 ? config.manual : DEFAULT_MANUAL;
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

export async function getMarketPrices(opts: { force?: boolean } = {}): Promise<CommodityPrice[]> {
  const config = await getMarketConfig();
  const { key } = resolveEiaKey(config);
  const hidden = config.hiddenEia || [];
  const force = Boolean(opts.force);

  const visible = PRICE_SERIES.filter((s) => !hidden.includes(s.symbol));
  const live = await getLiveQuotes(force);
  // La EIA solo se consulta para lo que la cotización en vivo no cubre (o cuando falló).
  const needEia = visible.filter((s) => s.eia && !live.has(s.symbol));
  const eia = needEia.length > 0 ? await getEiaPrices(needEia, key, force) : new Map<string, CommodityPrice>();

  const market: CommodityPrice[] = [];
  for (const s of visible) {
    const p = live.get(s.symbol) || eia.get(s.symbol);
    if (p) market.push(p);
  }
  return [...market, ...manualList(config)];
}
