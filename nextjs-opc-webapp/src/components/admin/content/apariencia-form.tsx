'use client';

import React, { useState, useTransition } from 'react';
import { updateAppearanceAction } from '@/lib/services/content-actions';
import type { LandingAppearanceConfig, ContentActionResponse } from '@/types/content';
import { Loader2, Save, Type, Palette, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_STATE: ContentActionResponse = {
  success: false,
  error: null,
};

const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';
const SELECT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';

const FONT_OPTIONS = [
  { id: 'Outfit', name: 'Outfit (Moderna, Geométrica, Petrolera / Tech)' },
  { id: 'Inter', name: 'Inter (Alta Legibilidad, Neutral, Estándar UI)' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Corporativa, Elegante)' },
  { id: 'Syne', name: 'Syne (Vanguardista, Impacto Visual)' },
  { id: 'Montserrat', name: 'Montserrat (Clásica Industrial, Robusta)' },
  { id: 'Cinzel', name: 'Cinzel (Editorial, Prestigio Institucional)' },
];

const COLOR_PALETTES = [
  { id: '#F59E0B', name: 'Ámbar Petróleo (Default)', bgClass: 'bg-amber-500' },
  { id: '#EAB308', name: 'Oro Puro Refinería', bgClass: 'bg-yellow-500' },
  { id: '#14B8A6', name: 'Teal Marítimo / Offshore', bgClass: 'bg-teal-500' },
  { id: '#06B6D4', name: 'Cyan Criogénico GNL', bgClass: 'bg-cyan-500' },
  { id: '#10B981', name: 'Esmeralda Sostenibilidad', bgClass: 'bg-emerald-500' },
  { id: '#3B82F6', name: 'Azul Institucional', bgClass: 'bg-blue-500' },
];

export function AparienciaForm({ defaultValues }: { defaultValues: LandingAppearanceConfig }) {
  const [state, setState] = useState<ContentActionResponse>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateAppearanceAction(INITIAL_STATE, formData);
      setState(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Tipografías */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <Type className="w-4 h-4" />
          <span>Tipografías de la Landing Page</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_STYLE}>Fuente de Titulares (Headings)</label>
            <select
              name="font_heading"
              defaultValue={defaultValues.font_heading || 'Outfit'}
              className={SELECT_STYLE}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-text-subtle">
              Se aplica a todos los encabezados (H1, H2, H3) del sitio.
            </p>
          </div>

          <div>
            <label className={LABEL_STYLE}>Fuente de Textos y Párrafos (Body)</label>
            <select
              name="font_body"
              defaultValue={defaultValues.font_body || 'Inter'}
              className={SELECT_STYLE}
            >
              <option value="Inter">Inter (Excelente legibilidad en párrafos largos)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Outfit">Outfit</option>
            </select>
            <p className="mt-1 text-[11px] text-text-subtle">
              Se aplica a párrafos, tarjetas, especificaciones y navegación.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Paleta de Color de Marca */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span>Color de Acento Principal</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COLOR_PALETTES.map((c) => (
            <label
              key={c.id}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-border/70 bg-card/40 cursor-pointer hover:border-accent/40 transition-all"
            >
              <input
                type="radio"
                name="primary_color"
                value={c.id}
                defaultChecked={defaultValues.primary_color === c.id}
                className="accent-amber-500"
              />
              <span className={cn('w-4 h-4 rounded-full shadow-sm', c.bgClass)} />
              <span className="text-xs text-text font-medium">{c.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Patrones y Resplandor Glow */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Efectos Visuales y Patrón de Fondo</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_STYLE}>Patrón de Cuadrícula de Fondo</label>
            <select
              name="background_pattern"
              defaultValue={defaultValues.background_pattern || 'grid'}
              className={SELECT_STYLE}
            >
              <option value="grid">Cuadrícula Técnica Petrolera (Grid)</option>
              <option value="dots">Puntos Discretos (Dots)</option>
              <option value="radial">Halo Radial Central (Radial)</option>
              <option value="none">Sin Patrón (Obsidiana Limpio)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="accent_glow"
                defaultChecked={defaultValues.accent_glow}
                className="w-4 h-4 rounded accent-amber-500"
              />
              <span className="text-xs text-text font-semibold">
                Activar resplandores luminosos ámbar (Glow Effects)
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Estados y Mensajes */}
      {state.error && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state.success && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{state.message || 'Apariencia actualizada correctamente'}</span>
        </div>
      )}

      {/* Botón de Guardado */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all duration-200 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando cambios...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Configuración de Apariencia</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
