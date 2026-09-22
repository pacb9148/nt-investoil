'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { TEAM_MEMBERS } from '@/lib/constants/investoil';
import type { TeamMember } from '@/types';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TeamEditorPage() {
  const [team] = useState<TeamMember[]>(TEAM_MEMBERS);
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
            Consejo Directivo y Dirección Ejecutiva
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Edita los nombres, cargos y ubicaciones de los miembros del equipo de Invest Oil LLC.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {team.map((m: TeamMember, idx: number) => (
          <div key={m.id} className="rounded-xl border border-border bg-surf/50 p-5 space-y-3">
            <span className="text-xs font-mono text-accent font-semibold">
              DIRECTIVO #{idx + 1}: {m.name} ({m.number})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Nombre Completo</label>
                <input defaultValue={m.name} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Cargo Directivo</label>
                <input defaultValue={m.role} className={INPUT} />
              </div>
            </div>
            <div>
              <label className={LABEL}>Sede / Ubicación</label>
              <input defaultValue={m.location} className={INPUT} />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Perfiles del equipo actualizados correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Equipo</span>
          </button>
        </div>
      </form>
    </div>
  );
}
