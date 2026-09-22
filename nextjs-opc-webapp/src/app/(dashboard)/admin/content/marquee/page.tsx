'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, RefreshCw, Plus, Trash2, ExternalLink, TrendingUp } from 'lucide-react';
import { CommodityPrice } from '@/app/api/market-prices/route';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function MarqueePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [enabled, setEnabled] = useState(true);
  const [showLivePrices, setShowLivePrices] = useState(true);
  const [speedSeconds, setSpeedSeconds] = useState(30);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [customItems, setCustomItems] = useState<string[]>([
    'TERMINALES ACTIVAS: HOUSTON · ROTTERDAM · FUJAIRAH · JURONG SINGAPUR',
    'INSPECCIÓN Y CONTROL DE CALIDAD: SGS · INTERTEK · SAYBOLT CERTIFIED',
    'CUMPLIMIENTO NORMATIVO: ASTM D1655 · EN590 · ISO 8217 MARPOL ANNEX VI',
  ]);
  const [newItem, setNewItem] = useState('');

  // Vista previa de commodities
  const [commodities, setCommodities] = useState<CommodityPrice[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [configRes, priceRes] = await Promise.all([
          fetch('/api/content/marquee'),
          fetch('/api/market-prices'),
        ]);

        if (configRes.ok) {
          const cfg = await configRes.json();
          setEnabled(cfg.enabled ?? true);
          setShowLivePrices(cfg.showLivePrices ?? true);
          setSpeedSeconds(cfg.speedSeconds ?? 30);
          setPauseOnHover(cfg.pauseOnHover ?? true);
          if (Array.isArray(cfg.customItems)) {
            setCustomItems(cfg.customItems);
          }
        }

        if (priceRes.ok) {
          const pJson = await priceRes.json();
          if (pJson.commodities) {
            setCommodities(pJson.commodities);
          }
        }
      } catch (e) {
        console.error('Error cargando marquee:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setCustomItems([...customItems, newItem.trim().toUpperCase()]);
    setNewItem('');
  };

  const handleRemoveItem = (idx: number) => {
    setCustomItems(customItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      enabled,
      showLivePrices,
      speedSeconds: Number(speedSeconds),
      pauseOnHover,
      customItems,
    };

    try {
      const res = await fetch('/api/content/marquee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        window.dispatchEvent(new CustomEvent('investoil_marquee_updated'));
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Error guardando marquee:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-text-muted text-sm font-mono">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Cargando configuración de Marquee...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Contenido</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Marquee de Cotizaciones & Commodities Energéticos
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura el cintillo animado que corre horizontalmente en la landing con cotizaciones en vivo (Petróleo, Gas, Derivados) y sellos normativos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interruptores principales */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h2 className="text-sm font-bold text-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>Control de Transmisión de Mercados</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60 cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <div>
                <span className="text-xs text-text font-bold block">Marquee Activo</span>
                <span className="text-[11px] text-text-subtle block">
                  Mostrar cintillo en la parte superior de la landing
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/60 cursor-pointer hover:border-accent/40 transition-colors">
              <input
                type="checkbox"
                checked={showLivePrices}
                onChange={(e) => setShowLivePrices(e.target.checked)}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <div>
                <span className="text-xs text-text font-bold block">Precios en Vivo de Hidrocarburos</span>
                <span className="text-[11px] text-text-subtle block">
                  Brent, WTI, Gas Natural, Diesel EN590, Jet A-1, Pet Coke
                </span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className={LABEL}>Velocidad del Ciclo (Segundos)</label>
              <input
                type="number"
                value={speedSeconds}
                onChange={(e) => setSpeedSeconds(Number(e.target.value))}
                min={10}
                max={120}
                className={INPUT}
              />
              <p className="text-[10px] text-text-subtle mt-1">
                Menor valor = más rápido; recomendado entre 25s y 45s.
              </p>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pauseOnHover}
                  onChange={(e) => setPauseOnHover(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500"
                />
                <span className="text-xs text-text font-semibold">Pausar animación al posar el cursor</span>
              </label>
            </div>
          </div>
        </div>

        {/* Panel informativo de cotizaciones activas de mercado */}
        {showLivePrices && (
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cotizaciones de Mercado en Vivo</span>
              </h3>
              <a
                href="https://www.oilpriceapi.com/es/precio-petroleo-hoy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-text-subtle hover:text-accent transition-colors"
              >
                <span>Fuente: oilpriceapi.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
              {commodities.map((item) => (
                <div key={item.symbol} className="p-2.5 rounded-lg border border-border bg-card/80">
                  <div className="text-[10px] font-mono text-text-muted">{item.name}</div>
                  <div className="text-xs font-mono font-bold text-text mt-0.5">
                    ${item.price.toFixed(2)} <span className="text-[10px] text-text-subtle">{item.unit}</span>
                  </div>
                  <div
                    className={`text-[10px] font-mono font-semibold mt-1 ${
                      item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.changePercent >= 0 ? '+' : ''}
                    {item.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Elementos y Certificaciones Personalizadas */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-text">Mensajes & Sellos Institucionales Adicionales</h2>
              <p className="text-[11px] text-text-muted">
                Terminales activas, puertos de despacho, acreditaciones ASTM y certificaciones que se alternarán en el cintillo.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {customItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-card/60 text-xs font-mono text-text"
              >
                <span className="truncate">{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 rounded text-text-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Eliminar elemento"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Ej: TERMINAL ROTTERDAM: DISPONIBILIDAD INMEDIATA CIF / FOB"
              className={INPUT}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border hover:border-accent text-text text-xs font-bold transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Configuración de Marquee guardada y transmitida en vivo</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar y Publicar Marquee'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
