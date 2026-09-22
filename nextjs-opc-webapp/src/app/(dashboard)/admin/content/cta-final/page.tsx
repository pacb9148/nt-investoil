'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function CtaFinalPage() {
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
            CTA Final de Cierre
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura el bloque final de llamada a la acción, botón principal y garantías contractuales.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div>
            <label className={LABEL}>Etiqueta Superior (Kicker)</label>
            <input defaultValue="OPORTUNIDADES DE COOPERACIÓN" className={INPUT} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Titular Principal (ES)</label>
              <input defaultValue="Impulse sus Operaciones Energéticas con Invest Oil LLC" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Titular Principal (EN)</label>
              <input defaultValue="Advance Your Energy Operations with Invest Oil LLC" className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Subtítulo / Mensaje de Cooperación</label>
            <textarea
              rows={2}
              defaultValue="Establezca una alianza comercial estratégica con acceso preferencial a volúmenes, almacenamiento y financiamiento estructurado."
              className={INPUT}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Texto del Botón Principal</label>
              <input defaultValue="Iniciar Diálogo Comercial" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Destino del Botón (URL o ancla)</label>
              <input defaultValue="#contact" className={INPUT} />
            </div>
          </div>

          <div>
            <label className={LABEL}>Línea de Garantías y Certificación</label>
            <input
              defaultValue="Garantía contractual de suministro · Cumplimiento Incoterms 2020 · Verificación SGS / Intertek"
              className={INPUT}
            />
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Sección CTA Final guardada correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar CTA Final</span>
          </button>
        </div>
      </form>
    </div>
  );
}
