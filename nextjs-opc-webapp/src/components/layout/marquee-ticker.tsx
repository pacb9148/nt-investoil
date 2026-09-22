'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { CommodityPrice } from '@/app/api/market-prices/route';

interface MarqueeConfig {
  enabled: boolean;
  showLivePrices: boolean;
  speedSeconds: number;
  pauseOnHover: boolean;
  customItems: string[];
}

export function MarqueeTicker() {
  const [config, setConfig] = useState<MarqueeConfig>({
    enabled: true,
    showLivePrices: true,
    speedSeconds: 30,
    pauseOnHover: true,
    customItems: [
      'TERMINALES ACTIVAS: HOUSTON · ROTTERDAM · FUJAIRAH · JURONG SINGAPUR',
      'INSPECCIÓN Y CONTROL DE CALIDAD: SGS · INTERTEK · SAYBOLT CERTIFIED',
      'CUMPLIMIENTO NORMATIVO: ASTM D1655 · EN590 · ISO 8217 MARPOL ANNEX VI',
    ],
  });

  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);

  // Cargar configuración de marquee
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/content/marquee');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch {
      // Fallback a default
    }
  };

  // Cargar precios de mercado
  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/market-prices');
      if (res.ok) {
        const json = await res.json();
        if (json.commodities) {
          setPrices(json.commodities);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchPrices();

    // Actualizar precios de mercado cada 60 segundos
    const priceInterval = setInterval(fetchPrices, 60000);

    const handleUpdate = () => {
      fetchConfig();
    };

    window.addEventListener('investoil_marquee_updated', handleUpdate);
    return () => {
      clearInterval(priceInterval);
      window.removeEventListener('investoil_marquee_updated', handleUpdate);
    };
  }, []);

  if (!config.enabled) return null;

  // Construir la lista de elementos para el ticker
  const tickerItems = (
    <>
      {config.showLivePrices &&
        prices.map((p) => {
          const isPositive = p.changePercent >= 0;
          return (
            <div key={p.symbol} className="inline-flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-text-subtle uppercase tracking-wider">
                {p.symbol}
              </span>
              <span className="text-xs font-mono font-semibold text-text">
                ${p.price.toFixed(2)} {p.unit}
              </span>
              <span
                className={`inline-flex items-center text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isPositive
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
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
              <span className="text-accent text-[10px] opacity-60">◆</span>
            </div>
          );
        })}

      {config.customItems.map((item, idx) => (
        <div key={`custom-${idx}`} className="inline-flex items-center gap-2">
          <span className="text-xs font-mono text-text-muted hover:text-accent transition-colors font-medium">
            {item}
          </span>
          <span className="text-accent text-[10px] opacity-60">◆</span>
        </div>
      ))}
    </>
  );

  return (
    <section className="group relative border-y border-border/80 bg-surf/90 py-2.5 overflow-hidden select-none backdrop-blur-sm">
      <div className="flex items-center">
        {/* Badge lateral indicador de fuente */}
        <div className="shrink-0 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1 bg-card/90 border-r border-border text-[10px] font-mono font-bold uppercase tracking-wider text-accent shadow-md">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Mercado en Vivo</span>
          <a
            href="https://www.oilpriceapi.com/es/precio-petroleo-hoy"
            target="_blank"
            rel="noopener noreferrer"
            title="Fuente: OilPriceAPI"
            className="text-text-subtle hover:text-accent transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Contenedor de marquesina con doble capa para bucle infinito sin parpadeo */}
        <div
          className={`flex gap-6 whitespace-nowrap animate-marquee pl-4 ${
            config.pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''
          }`}
          style={{ animationDuration: `${config.speedSeconds || 30}s` }}
        >
          {tickerItems}
          {tickerItems}
        </div>
      </div>
    </section>
  );
}
