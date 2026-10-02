import { NextResponse } from 'next/server';
import { getMarketPrices } from '@/lib/market/prices-service';

export type { CommodityPrice } from '@/lib/market/prices-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const commodities = await getMarketPrices();
  return NextResponse.json({
    source: 'U.S. Energy Information Administration (EIA) — datos oficiales; valores marcados «manual» fijados por Invest Oil',
    sourceUrl: 'https://www.eia.gov/opendata/',
    timestamp: new Date().toISOString(),
    commodities,
  });
}
