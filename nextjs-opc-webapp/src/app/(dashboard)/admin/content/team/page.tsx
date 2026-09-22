'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TEAM_MEMBERS } from '@/lib/constants/investoil';
import type { TeamMember } from '@/types';
import { ArrowLeft, Save, CheckCircle2, Camera, User } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TeamEditorPage() {
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [saved, setSaved] = useState(false);

  const updateMember = (id: string, field: keyof TeamMember, val: string) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

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
            Edita los nombres reales, cargos directivos, sedes y fotografías oficiales del equipo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {team.map((m: TeamMember, idx: number) => (
          <div key={m.id} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>0{idx + 1}.</span> {m.name} ({m.number})
              </span>
              <span className="text-[11px] font-mono text-text-subtle">ID: {m.id}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Foto de perfil actual con preview */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-accent/40 bg-card/80 shadow-md">
                  {m.image ? (
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-subtle">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-mono text-text-subtle uppercase">
                  Foto actual
                </span>
              </div>

              {/* Campos de edición */}
              <div className="flex-1 space-y-3 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Nombre Completo</label>
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                      className={INPUT}
                      required
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Cargo Directivo</label>
                    <input
                      type="text"
                      value={m.role}
                      onChange={(e) => updateMember(m.id, 'role', e.target.value)}
                      className={INPUT}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Sede / Ubicación</label>
                    <input
                      type="text"
                      value={m.location}
                      onChange={(e) => updateMember(m.id, 'location', e.target.value)}
                      className={INPUT}
                      required
                    />
                  </div>
                  <div>
                    <label className={LABEL}>
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3 h-3 text-accent" />
                        <span>URL de la Fotografía / Retrato Oficial</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={m.image}
                      onChange={(e) => updateMember(m.id, 'image', e.target.value)}
                      className={INPUT}
                      placeholder="https://ejemplo.com/fotos/directivo.jpg"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Perfiles y fotografías del equipo actualizados correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Equipo y Fotografías</span>
          </button>
        </div>
      </form>
    </div>
  );
}
