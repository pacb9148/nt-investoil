'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Newspaper, TrendingUp } from 'lucide-react';
import { CommodityPrice } from '@/app/api/market-prices/route';
import { useLanguage } from '@/lib/i18n/language-context';

const DEFAULT_COMMODITIES: CommodityPrice[] = [
  { name: 'Petróleo Brent', symbol: 'BRENT', price: 82.45, currency: 'USD', unit: '/bbl', changePercent: 1.24, updatedAt: '' },
  { name: 'Petróleo WTI', symbol: 'WTI', price: 78.20, currency: 'USD', unit: '/bbl', changePercent: 0.88, updatedAt: '' },
  { name: 'Crudo Merey 16', symbol: 'MEREY-16', price: 69.80, currency: 'USD', unit: '/bbl', changePercent: 1.45, updatedAt: '' },
  { name: 'Gas Natural Henry Hub', symbol: 'NATGAS', price: 2.48, currency: 'USD', unit: '/MMBtu', changePercent: -0.42, updatedAt: '' },
  { name: 'Diésel EN590 10ppm', symbol: 'EN590', price: 812.50, currency: 'USD', unit: '/MT', changePercent: 0.65, updatedAt: '' },
  { name: 'Jet Fuel A-1 Aviación', symbol: 'JET-A1', price: 2.54, currency: 'USD', unit: '/gal', changePercent: 1.15, updatedAt: '' },
  { name: 'Pet Coke Verde', symbol: 'PETCOKE', price: 118.50, currency: 'USD', unit: '/MT', changePercent: 0.35, updatedAt: '' },
  { name: 'Pet Coke Calcinado', symbol: 'CPC-ANODE', price: 385.00, currency: 'USD', unit: '/MT', changePercent: 0.50, updatedAt: '' },
  { name: 'Fuel Oil 380 CST', symbol: 'IFO-380', price: 465.00, currency: 'USD', unit: '/MT', changePercent: -0.80, updatedAt: '' },
  { name: 'Gasóleo Marino MGO', symbol: 'MGO 0.1%', price: 795.00, currency: 'USD', unit: '/MT', changePercent: 0.40, updatedAt: '' },
  { name: 'GNL Criogénico DES', symbol: 'LNG-DES', price: 13.85, currency: 'USD', unit: '/MMBtu', changePercent: -0.25, updatedAt: '' },
  { name: 'Crudo Dubai', symbol: 'DUBAI', price: 80.15, currency: 'USD', unit: '/bbl', changePercent: 0.95, updatedAt: '' },
];

const HEADLINES_ES = [
  'OPEP+ ratifica cuotas de producción y estabilidad en la oferta de crudo 2026',
  'Invest Oil LLC consolida contratos de suministro spot y term en terminales de Houston y Rotterdam',
  'Aumento sostenido en la demanda de crudo pesado Merey 16 en refinerías de alta conversión en Asia',
  'Inspecciones de calidad y cantidad certificadas bajo protocolos independientes SGS, Intertek y Saybolt',
  'Cumplimiento normativo estricto bajo especificaciones ASTM D1655, EN590 e ISO 8217 Marpol Annex VI',
  'Nuevas operaciones de arbitraje transatlántico en cargamentos de Pet Coke para cementeras y siderurgia',
  'Monitoreo 24/7 y cobertura de riesgo financiero en transacciones marítimas bajo Incoterms CIF, FOB y CFR',
  'Despachos mensuales consolidados superan los 12.5M de barriles equivalentes hacia mercados globales',
  'Acuerdos de fletamento en buques Aframax y Suezmax con ventanas de atraque prioritarias',
  'Compromiso de sostenibilidad: incorporación progresiva de GNL criogénico y biocombustibles marinos',
];

const HEADLINES_EN = [
  'OPEC+ reaffirms production quota targets and crude supply stability for 2026',
  'Invest Oil LLC strengthens spot and term supply contracts across Houston and Rotterdam hub terminals',
  'Robust demand for Merey 16 heavy crude across deep-conversion refineries in Asia',
  'Quality and quantity inspections certified under independent SGS, Intertek, and Saybolt protocols',
  'Strict regulatory compliance under ASTM D1655, EN590, and ISO 8217 Marpol Annex VI standards',
  'New transatlantic arbitrage operations in Pet Coke cargoes for cement and steel manufacturing',
  '24/7 monitoring and financial hedging in maritime trades under CIF, FOB, and CFR Incoterms',
  'Consolidated monthly shipments exceed 12.5M barrel equivalents to global energy markets',
  'Long-term chartering agreements on Aframax and Suezmax tankers with priority berthing windows',
  'Sustainability pledge: progressive adoption of cryogenic LNG and low-carbon marine fuels',
];

export interface MarqueeConfig {
  enabled?: boolean;
  showLivePrices?: boolean;
  speedSeconds?: number;
  pauseOnHover?: boolean;
  pricesBadgeText?: string;
  pricesBadgeTextEn?: string;
  newsBadgeText?: string;
  newsBadgeTextEn?: string;
  customItems?: string[];
}

export function MarqueeTicker({
  customBg,
  config,
}: {
  customBg?: string;
  config?: MarqueeConfig;
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [prices, setPrices] = useState<CommodityPrice[]>(DEFAULT_COMMODITIES);
  const [marqueeConfig, setMarqueeConfig] = useState<MarqueeConfig | undefined>(config);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/content/marquee');
        if (res.ok && isMounted) {
          const data = await res.json();
          setMarqueeConfig(data);
        }
      } catch {}
    };

    if (!config) {
      fetchConfig();
    }

    const handleUpdate = () => {
      fetchConfig();
    };

    window.addEventListener('investoil_marquee_updated', handleUpdate);

    const fetchPrices = async () => {
      try {
        const res = await fetch('/api/market-prices');
        if (res.ok) {
          const json = await res.json();
          if (json.commodities && json.commodities.length > 0 && isMounted) {
            setPrices(json.commodities);
          }
        }
      } catch {
        // Fallback garantizado a DEFAULT_COMMODITIES
      }
    };

    fetchPrices();
    // Actualización cada 120s para optimizar recursos en segundo plano
    const interval = setInterval(fetchPrices, 120000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('investoil_marquee_updated', handleUpdate);
    };
  }, [config]);

  const headlines = isEn ? HEADLINES_EN : HEADLINES_ES;

  // Renderizador de elementos de precios (Fila 1)
  const renderPriceItems = () =>
    prices.map((p, idx) => {
      const isPositive = p.changePercent >= 0;
      return (
        <div key={`${p.symbol}-${idx}`} className="inline-flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
            {p.symbol}
          </span>
          <span className="text-xs font-mono font-semibold text-white">
            ${p.price.toFixed(2)} {p.unit}
          </span>
          <span
            className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              isPositive
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : 'text-rose-400 bg-rose-500/15 border border-rose-500/30'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5 inline" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5 inline" />
            )}
            {isPositive ? '+' : ''}
            {p.changePercent.toFixed(2)}%
          </span>
          <span className="text-amber-500/50 text-[10px] mx-2">◆</span>
        </div>
      );
    });

  // Renderizador de titulares informativos (Fila 2)
  const renderHeadlineItems = () =>
    headlines.map((item, idx) => (
      <div key={`headline-${idx}`} className="inline-flex items-center gap-2.5 shrink-0">
        <span className="text-xs font-mono text-slate-200 hover:text-amber-300 transition-colors font-medium">
          {item}
        </span>
        <span className="text-amber-500 text-[10px] opacity-70 mx-2">●</span>
      </div>
    ));

  return (
    <section
      id="marquee"
      className="group relative border-y border-border/80 overflow-hidden select-none backdrop-blur-md transition-colors duration-300"
      style={{ backgroundColor: customBg || 'rgba(10, 16, 28, 0.95)' }}
    >
      {/* ── FILA 1: Índices Financieros & Precios de Petróleo (Izquierda a Derecha) ── */}
      <div className="flex items-center border-b border-white/10 py-2.5 bg-black/25">
        {/* Badge Indicador de Fila 1 */}
        <div className="shrink-0 z-10 flex items-center gap-1.5 px-3.5 py-1 bg-card/95 border-r border-border text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 shadow-md">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>
            {isEn
              ? (marqueeConfig?.pricesBadgeTextEn || 'Live Energy Prices')
              : (marqueeConfig?.pricesBadgeText || 'Precios de Energía en Vivo')}
          </span>
          <a
            href="https://www.oilpriceapi.com/es/precio-petroleo-hoy"
            target="_blank"
            rel="noopener noreferrer"
            title="Fuente: OilPrice & Platts"
            className="text-text-subtle hover:text-accent transition-colors ml-1"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Marquesina animada: Izquierda a Derecha (marquee-reverse) */}
        <div className="overflow-hidden w-full">
          <div className="flex gap-8 whitespace-nowrap animate-marquee-reverse hover:[animation-play-state:paused] pl-4">
            {renderPriceItems()}
            {renderPriceItems()}
          </div>
        </div>
      </div>

      {/* ── FILA 2: Titulares de Información & Operaciones (Derecha a Izquierda) ── */}
      <div className="flex items-center py-2.5 bg-black/40">
        {/* Badge Indicador de Fila 2 */}
        <div className="shrink-0 z-10 flex items-center gap-1.5 px-3.5 py-1 bg-card/95 border-r border-border text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 shadow-md">
          <Newspaper className="w-3.5 h-3.5 text-teal-400" />
          <span>
            {isEn
              ? (marqueeConfig?.newsBadgeTextEn || 'Market News & Ops')
              : (marqueeConfig?.newsBadgeText || 'Actualidad & Operaciones')}
          </span>
        </div>

        {/* Marquesina animada: Derecha a Izquierda (marquee clásico) */}
        <div className="overflow-hidden w-full">
          <div className="flex gap-8 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] pl-4">
            {renderHeadlineItems()}
            {renderHeadlineItems()}
          </div>
        </div>
      </div>
    </section>
  );
}
