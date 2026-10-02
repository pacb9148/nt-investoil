'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Newspaper, TrendingUp } from 'lucide-react';
import type { CommodityPrice } from '@/lib/market/prices-types';
import { useLanguage } from '@/lib/i18n/language-context';

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

/**
 * Pista de desplazamiento continuo. La animación mueve la pista -50% de SU PROPIO ancho, así que la pista
 * debe medir exactamente dos copias idénticas (w-max) y cada copia llevar su separación como relleno
 * (no como gap entre copias): con el gap suelto y el ancho del contenedor padre, el recorrido no
 * coincidía con el periodo real del contenido y al reiniciar la marquesina daba un salto visible.
 */
/** Repite la lista hasta tener un mínimo de elementos para que una copia siempre cubra el ancho de pantalla. */
function repeatMin<T>(list: T[], min = 12): T[] {
  if (list.length === 0) return list;
  const out: T[] = [];
  while (out.length < min) out.push(...list);
  return out;
}

function MarqueeTrack({ className, render }: { className: string; render: () => React.ReactNode }) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Velocidad constante en píxeles por segundo (no en segundos por vuelta): la vuelta dura lo que mida
  // una copia, así la marquesina va igual de rápida con 5 precios que con 12.
  useEffect(() => {
    const el = groupRef.current;
    if (!el) return;
    const update = () => setDuration(Math.max(10, el.offsetWidth / 45));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className={`flex w-max whitespace-nowrap hover:[animation-play-state:paused] ${className}`}
      style={duration ? { animationDuration: `${duration}s` } : undefined}
    >
      <div ref={groupRef} className="flex shrink-0 gap-8 pr-8">{render()}</div>
      <div className="flex shrink-0 gap-8 pr-8" aria-hidden>
        {render()}
      </div>
    </div>
  );
}

export function MarqueeTicker({
  customBg,
  config,
  initialPrices = [],
}: {
  customBg?: string;
  config?: MarqueeConfig;
  initialPrices?: CommodityPrice[];
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [prices, setPrices] = useState<CommodityPrice[]>(initialPrices);
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
      fetchPrices();
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
        // Se conservan los últimos precios mostrados
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
    repeatMin(prices, 8).map((p, idx) => {
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
    repeatMin(headlines, 6).map((item, idx) => (
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
            href="https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm"
            target="_blank"
            rel="noopener noreferrer"
            title="Fuente: U.S. EIA (cierres diarios oficiales)"
            className="text-text-subtle hover:text-accent transition-colors ml-1"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Marquesina animada: Izquierda a Derecha (marquee-reverse) */}
        <div className="overflow-hidden w-full">
          <MarqueeTrack className="animate-marquee-reverse" render={renderPriceItems} />
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
          <MarqueeTrack className="animate-marquee" render={renderHeadlineItems} />
        </div>
      </div>
    </section>
  );
}
