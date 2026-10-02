export interface CommodityPrice {
  name: string;
  symbol: string;
  price: number;
  currency: string;
  unit: string;
  changePercent: number;
  updatedAt: string;
  /** `eia` = dato oficial descargado de la API de la EIA; `manual` = valor puesto a mano en el backoffice. */
  source?: 'eia' | 'manual';
  /** Fecha (YYYY-MM-DD) a la que corresponde el dato oficial. */
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
