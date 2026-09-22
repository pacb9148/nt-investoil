'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function MarqueePage() {
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
            Marquee de Commodities & Certificaciones
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura el cintillo animado que corre horizontalmente en la landing con cotizaciones y sellos de calidad.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div>
            <label className={LABEL}>Elementos del Marquee (separados por coma o barra |)</label>
            <textarea
              rows={3}
              defaultValue="BRENT CRUDE $82.40/bbl | WTI $78.15/bbl | JET FUEL A1 ASTM D1655 | DIESEL EN590 10PPM | ULTRA LOW SULFUR DIESEL | LNG CRIOGÉNICO | VERIFICACIÓN SGS & INTERTEK | MIEMBROS IATA FUEL & EI"
              className={INPUT}
            />
            <p className="mt-1 text-[11px] text-text-subtle">
              Cada elemento se mostrará en bucle continuo con un separador elegante ámbar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Velocidad de Animación (segundos por ciclo)</label>
              <input type="number" defaultValue={28} min={10} max={120} className={INPUT} />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-amber-500" />
                <span className="text-xs text-text font-semibold">Pausar animación al pasar el cursor (Hover)</span>
              </label>
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Marquee actualizado correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Marquee</span>
          </button>
        </div>
      </form>
    </div>
  );
}
