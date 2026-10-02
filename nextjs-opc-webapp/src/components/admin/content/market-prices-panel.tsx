'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, KeyRound, Loader2, RefreshCw, Save } from 'lucide-react';
import type { CommodityPrice, ManualCommodity } from '@/lib/market/prices-types';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';

interface PanelData {
  keyOrigin: 'panel' | 'env' | 'demo';
  keyHint: string | null;
  hiddenEia: string[];
  manual: ManualCommodity[];
  eiaSeries: Array<{ symbol: string; name: string }>;
  live: CommodityPrice[];
}

const ORIGIN_TEXT: Record<PanelData['keyOrigin'], string> = {
  panel: 'Usando la clave guardada en este panel.',
  env: 'Usando la clave de la variable de entorno EIA_API_KEY del servidor.',
  demo: 'Sin clave propia: se usa la clave de demostración pública de la EIA, que tiene un límite bajo de consultas. Registra una clave gratuita y pégala aquí.',
};

export function MarketPricesPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [manual, setManual] = useState<ManualCommodity[]>([]);
  const [hiddenEia, setHiddenEia] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/market-prices');
      if (!res.ok) throw new Error('No se pudo leer la configuración de precios.');
      const json = (await res.json()) as PanelData;
      setData(json);
      setManual(json.manual);
      setHiddenEia(json.hiddenEia);
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Error cargando precios.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (opts: { clearKey?: boolean } = {}) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/market-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eiaApiKey: keyInput, clearKey: opts.clearKey, manual, hiddenEia }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudo guardar. El cambio no se aplicó.');
      setKeyInput('');
      setMessage({ ok: true, text: 'Guardado. El cintillo de la landing usa estos datos desde ya.' });
      window.dispatchEvent(new CustomEvent('investoil_marquee_updated'));
      await load();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : 'Error de conexión al guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const updateManual = (idx: number, patch: Partial<ManualCommodity>) =>
    setManual((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));

  const toggleEia = (symbol: string) =>
    setHiddenEia((prev) => (prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]));

  const liveEia = (data?.live || []).filter((c) => c.source !== 'manual');

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cotizaciones del cintillo — mercado en vivo + EIA</span>
        </h3>
        <a
          href="https://www.eia.gov/opendata/register.php"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-mono text-text-subtle hover:text-accent transition-colors"
        >
          <span>Obtener clave gratuita (EIA)</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
          <Loader2 className="w-4 h-4 animate-spin" /> Consultando la EIA...
        </div>
      ) : (
        <>
          {/* Clave de API */}
          <div className="rounded-lg border border-border bg-card/60 p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-text">
              <KeyRound className="w-4 h-4 text-accent" /> Clave de API de la EIA
            </div>
            <input
              type="password"
              autoComplete="off"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={data?.keyHint ? `Clave guardada (${data.keyHint}) — pega otra para reemplazarla` : 'Pega aquí tu API key de EIA (api.eia.gov)'}
              className={INPUT}
            />
            <p className="text-[11px] text-text-muted leading-relaxed">
              {data ? ORIGIN_TEXT[data.keyOrigin] : ''} La clave se guarda en la base de datos del servidor y no se
              muestra en la web pública.
            </p>
            {data?.keyHint && (
              <button
                type="button"
                onClick={() => save({ clearKey: true })}
                disabled={saving}
                className="text-[11px] font-mono text-rose-400 hover:underline disabled:opacity-50"
              >
                Quitar la clave guardada
              </button>
            )}
          </div>

          {/* Precios oficiales en vivo */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
              Precios de mercado (se refrescan solos cada minuto; si la cotización en vivo falla se usa el cierre oficial de la EIA)
            </div>
            {liveEia.length === 0 && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                No hay precios de mercado ahora mismo (sin respuesta de la cotización en vivo ni de la EIA). Revisa la clave de la EIA.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {(data?.eiaSeries || []).map((s) => {
                const item = liveEia.find((c) => c.symbol === s.symbol);
                const hidden = hiddenEia.includes(s.symbol);
                return (
                  <div key={s.symbol} className={`p-2.5 rounded-lg border border-border bg-card/80 ${hidden ? 'opacity-50' : ''}`}>
                    <div className="text-[10px] font-mono text-text-muted">{s.name}</div>
                    <div className="text-xs font-mono font-bold text-text mt-0.5">
                      {item ? `$${item.price.toFixed(2)}` : '—'}{' '}
                      <span className="text-[10px] text-text-subtle">{item?.unit}</span>
                    </div>
                    <div className="text-[10px] font-mono text-text-subtle mt-0.5">
                      {item?.source === 'live' ? 'En vivo' : item?.asOf ? `Cierre EIA ${item.asOf}` : ''}
                    </div>
                    <label className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono text-text-muted cursor-pointer">
                      <input type="checkbox" checked={!hidden} onChange={() => toggleEia(s.symbol)} />
                      Mostrar en el cintillo
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Valores manuales */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-text-muted uppercase tracking-wider">
              Productos sin serie oficial gratuita — valor manual (edítalos tú)
            </div>
            <div className="space-y-2">
              {manual.map((m, idx) => (
                <div key={m.symbol} className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg border border-border bg-card/60">
                  <div className="col-span-12 sm:col-span-4 text-xs font-mono text-text">
                    <span className="font-bold text-amber-400">{m.symbol}</span>
                    <span className="text-text-muted"> · {m.name}</span>
                  </div>
                  <div className="col-span-5 sm:col-span-3 flex items-center gap-1">
                    <span className="text-text-muted text-xs">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={m.price}
                      onChange={(e) => updateManual(idx, { price: Number(e.target.value) })}
                      className={INPUT}
                      aria-label={`Precio de ${m.name}`}
                    />
                    <span className="text-[10px] text-text-subtle">{m.unit}</span>
                  </div>
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      value={m.changePercent}
                      onChange={(e) => updateManual(idx, { changePercent: Number(e.target.value) })}
                      className={INPUT}
                      aria-label={`Variación de ${m.name}`}
                    />
                    <span className="text-[10px] text-text-subtle">%</span>
                  </div>
                  <label className="col-span-3 sm:col-span-2 flex items-center gap-1.5 text-[10px] font-mono text-text-muted cursor-pointer">
                    <input type="checkbox" checked={!m.hidden} onChange={(e) => updateManual(idx, { hidden: !e.target.checked })} />
                    Mostrar
                  </label>
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-semibold ${
                message.ok
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {message.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-text text-xs font-bold hover:border-accent transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Actualizar ahora
            </button>
            <button
              type="button"
              onClick={() => save()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-bg text-xs font-bold disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Guardar precios
            </button>
          </div>
        </>
      )}
    </div>
  );
}
