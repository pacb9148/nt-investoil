'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function ProblemaPage() {
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
            Retos del Sector Energético (El Problema)
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura las 3 tarjetas de puntos de dolor que experimentan los actores petroleros y cómo Invest Oil los resuelve.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { num: '01', title: 'Intermediación Ineficiente y Falta de Trazabilidad', desc: 'Cadenas de intermediarios sin capacidad real de fletamento que encarecen el barril y dilatan las ventanas de carga.' },
          { num: '02', title: 'Volatilidad Extrema y Exposición Financiera', desc: 'Fluctuaciones drásticas de precios sin instrumentos de cobertura ni estructuras de pago seguras.' },
          { num: '03', title: 'Restricciones de Cuello de Botella Logístico', desc: 'Déficit de almacenamiento en terminales estratégicas y demoras en inspecciones SGS/Intertek.' },
        ].map((item, idx) => (
          <div key={item.num} className="rounded-xl border border-border bg-surf/50 p-5 space-y-3">
            <span className="text-xs font-mono text-accent font-semibold">PUNTO DE DOLOR #{item.num}</span>
            <div>
              <label className={LABEL}>Titular del Desafío</label>
              <input defaultValue={item.title} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción del Problema y Solución Invest Oil</label>
              <textarea rows={2} defaultValue={item.desc} className={INPUT} />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Sección actualizada correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
