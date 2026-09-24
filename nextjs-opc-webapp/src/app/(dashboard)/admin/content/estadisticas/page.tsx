'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function EstadisticasPage() {
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
            Estadísticas y Números de Impacto
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Modifica las 4 métricas clave mostradas en la landing (barriles, países, cumplimiento y soporte).
          </p>
        </div>
      </div>

      <SectionDesignBar sectionId="estadisticas" sectionName="Estadísticas de Impacto" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Métrica 1 */}
          <div className="p-4 rounded-xl border border-border bg-surf/50 space-y-3">
            <span className="text-[11px] font-mono text-accent font-semibold">MÉTRICA 1</span>
            <div>
              <label className={LABEL}>Valor Numérico</label>
              <input defaultValue="150M+" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (Español)</label>
              <input defaultValue="Barriles transaccionados anualmente en hubs globales" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (English)</label>
              <input defaultValue="Barrels transacted annually in major trading hubs" className={INPUT} />
            </div>
          </div>

          {/* Métrica 2 */}
          <div className="p-4 rounded-xl border border-border bg-surf/50 space-y-3">
            <span className="text-[11px] font-mono text-accent font-semibold">MÉTRICA 2</span>
            <div>
              <label className={LABEL}>Valor Numérico</label>
              <input defaultValue="38+" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (Español)</label>
              <input defaultValue="Países con conexiones comerciales activas" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (English)</label>
              <input defaultValue="Countries with active trade relationships" className={INPUT} />
            </div>
          </div>

          {/* Métrica 3 */}
          <div className="p-4 rounded-xl border border-border bg-surf/50 space-y-3">
            <span className="text-[11px] font-mono text-accent font-semibold">MÉTRICA 3</span>
            <div>
              <label className={LABEL}>Valor Numérico</label>
              <input defaultValue="99.8%" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (Español)</label>
              <input defaultValue="Índice de cumplimiento contractual y entrega a tiempo" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (English)</label>
              <input defaultValue="Contractual performance and on-time delivery rate" className={INPUT} />
            </div>
          </div>

          {/* Métrica 4 */}
          <div className="p-4 rounded-xl border border-border bg-surf/50 space-y-3">
            <span className="text-[11px] font-mono text-accent font-semibold">MÉTRICA 4</span>
            <div>
              <label className={LABEL}>Valor Numérico</label>
              <input defaultValue="24/7" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (Español)</label>
              <input defaultValue="Monitoreo logístico, marítimo y gestión de riesgo" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Descripción (English)</label>
              <input defaultValue="Maritime logistics monitoring and risk management" className={INPUT} />
            </div>
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Estadísticas guardadas y actualizadas correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Estadísticas</span>
          </button>
        </div>
      </form>
    </div>
  );
}
