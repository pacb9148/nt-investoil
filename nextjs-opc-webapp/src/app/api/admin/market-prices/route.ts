import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { saveSectionContent } from '@/lib/services/content-service';
import {
  MARKET_CONFIG_SECTION,
  EIA_SERIES,
  clearMarketPricesCache,
  effectiveManual,
  getMarketConfig,
  getMarketPrices,
  resolveEiaKey,
} from '@/lib/market/prices-service';
import type { ManualCommodity, MarketPricesConfig } from '@/lib/market/prices-types';

export const dynamic = 'force-dynamic';

// /api/admin/* exige sesión en el middleware. La clave completa nunca se devuelve: solo si existe y sus últimos 4 caracteres.
export async function GET() {
  const config = await getMarketConfig();
  const { origin } = resolveEiaKey(config);
  const saved = (config.eiaApiKey || '').trim();
  const live = await getMarketPrices({ force: true });
  return NextResponse.json({
    keyOrigin: origin,
    keyHint: saved ? `…${saved.slice(-4)}` : null,
    hiddenEia: config.hiddenEia || [],
    manual: effectiveManual(config),
    eiaSeries: EIA_SERIES.map((s) => ({ symbol: s.symbol, name: s.name })),
    live,
  });
}

function cleanManual(input: unknown): ManualCommodity[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((m) => m as Partial<ManualCommodity>)
    .filter((m) => typeof m.symbol === 'string' && m.symbol.trim() && typeof m.name === 'string')
    .map((m) => ({
      symbol: String(m.symbol).trim().slice(0, 20),
      name: String(m.name).trim().slice(0, 60),
      unit: String(m.unit || '/bbl').trim().slice(0, 10),
      price: Number(m.price) || 0,
      changePercent: Number(m.changePercent) || 0,
      hidden: Boolean(m.hidden),
    }))
    .slice(0, 30);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      eiaApiKey?: string;
      clearKey?: boolean;
      manual?: unknown;
      hiddenEia?: unknown;
    };
    const current = await getMarketConfig();
    const next: MarketPricesConfig = { ...current };

    if (body.clearKey) next.eiaApiKey = '';
    else if (typeof body.eiaApiKey === 'string' && body.eiaApiKey.trim()) {
      const key = body.eiaApiKey.trim();
      if (!/^[A-Za-z0-9]{20,64}$/.test(key)) {
        return NextResponse.json({ error: 'La clave de la EIA no tiene un formato válido (letras y números, 20 a 64 caracteres).' }, { status: 400 });
      }
      next.eiaApiKey = key;
    }
    if (body.manual !== undefined) next.manual = cleanManual(body.manual);
    if (Array.isArray(body.hiddenEia)) next.hiddenEia = body.hiddenEia.filter((s): s is string => typeof s === 'string');

    await saveSectionContent(MARKET_CONFIG_SECTION, next);
    clearMarketPricesCache();
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error guardando los precios' }, { status: 500 });
  }
}
