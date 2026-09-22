'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function SettingsContentPage() {
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
            Ajustes Generales del Sitio
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Datos corporativos, sedes internacionales (Houston, Madrid, Bogotá) e información del footer.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nombre Comercial de la Empresa</label>
              <input defaultValue="Invest Oil LLC" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Email Principal de Contacto</label>
              <input defaultValue="info@investoil.es" className={INPUT} />
            </div>
          </div>

          {/* Sedes Internacionales estructuradas en 2 filas */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wider font-mono text-accent">
              Sedes Internacionales y Direcciones (Estructura en 2 filas)
            </h2>
            <p className="text-xs text-text-muted">
              Configure cada sede con su Fila 1 (Ciudad y País) y Fila 2 (Detalle corporativo y dirección física completa).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sede Houston */}
              <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Sede Houston</span>
                  <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded">
                    HQ
                  </span>
                </div>
                <div>
                  <label className={LABEL}>Fila 1: Ciudad y País</label>
                  <input defaultValue="Houston, Estados Unidos" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fila 2: Detalle de Sede</label>
                  <input defaultValue="Headquarters · Sede Central" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fila 2: Dirección Física</label>
                  <input defaultValue="1000 Louisiana St, Suite 4000, Houston, TX 77002" className={INPUT} />
                </div>
              </div>

              {/* Sede Madrid */}
              <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Sede Madrid</span>
                  <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded">
                    DESK
                  </span>
                </div>
                <div>
                  <label className={LABEL}>Fila 1: Ciudad y País</label>
                  <input defaultValue="Madrid, España" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fila 2: Detalle de Sede</label>
                  <input defaultValue="European Operations Desk" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fila 2: Dirección Física</label>
                  <input defaultValue="Paseo de la Castellana 95, Planta 15, 28046 Madrid" className={INPUT} />
                </div>
              </div>

              {/* Sede Bogotá */}
              <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text">Sede Bogotá</span>
                  <span className="text-[10px] font-mono bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded">
                    DESK
                  </span>
                </div>
                <div>
                  <label className={LABEL}>Fila 1: Ciudad y País</label>
                  <input defaultValue="Bogotá, Colombia" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fila 2: Detalle de Sede</label>
                  <input defaultValue="Latin America Operations Desk" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Fila 2: Dirección Física</label>
                  <input defaultValue="Carrera 7 # 71-21, Torre B, Bogotá D.C." className={INPUT} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL}>Texto de Copyright (Footer)</label>
            <input defaultValue="© 2026 Invest Oil LLC. Todos los derechos reservados." className={INPUT} />
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Ajustes generales guardados correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Ajustes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
