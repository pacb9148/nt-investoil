export interface CommodityPrice {
  name: string;
  symbol: string;
  price: number;
  currency: string;
  unit: string;
  changePercent: number;
  updatedAt: string;
  /** `live` = cotización de futuros casi en tiempo real; `eia` = cierre diario oficial de la EIA; `manual` = valor puesto a mano. */
  source?: 'live' | 'eia' | 'manual';
  /** Momento (ISO) de la cotización en vivo, o fecha (YYYY-MM-DD) del cierre oficial. */
  asOf?: string;
}

export interface ManualCommodity {
  symbol: string;
  name: string;
  unit: string;
  price: number;
  changePercent: number;
  hidden?: boolean;
}

/** Se guarda en `landing_sections` (id `market_prices_config`); la clave nunca sale por una ruta pública. */
export interface MarketPricesConfig {
  eiaApiKey?: string;
  manual?: ManualCommodity[];
  /** Símbolos de series EIA que el admin quiere ocultar del cintillo. */
  hiddenEia?: string[];
}
