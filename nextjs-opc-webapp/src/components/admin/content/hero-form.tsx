'use client';

import React, { useState, useTransition } from 'react';
import { updateHeroAction } from '@/lib/services/content-actions';
import type { LandingHeroConfig, ContentActionResponse } from '@/types/content';
import { Loader2, Save, Video, Image as ImageIcon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_STATE: ContentActionResponse = {
  success: false,
  error: null,
};

const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export function HeroForm({ defaultValues }: { defaultValues: LandingHeroConfig }) {
  const [state, setState] = useState<ContentActionResponse>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();
  const [bgType, setBgType] = useState<string>(defaultValues.hero_bg_type || 'gradient');
  const [opacity, setOpacity] = useState<number>(defaultValues.hero_bg_opacity ?? 20);
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateHeroAction(INITIAL_STATE, formData);
      setState(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Selector de idioma para la edición de textos */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-surf/80">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-text">Idioma de edición de contenidos:</span>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-1 text-xs font-mono">
          <button
            type="button"
            onClick={() => setLangTab('es')}
            className={cn(
              'px-3 py-1 rounded font-semibold transition-all',
              langTab === 'es' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            Español (ES)
          </button>
          <button
            type="button"
            onClick={() => setLangTab('en')}
            className={cn(
              'px-3 py-1 rounded font-semibold transition-all',
              langTab === 'en' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            English (EN)
          </button>
        </div>
      </div>

      {/* Bloque 1: Titulares y Textos */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <span>01.</span> Titulares y Mensaje Principal ({langTab.toUpperCase()})
        </h3>

        {langTab === 'es' ? (
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Kicker / Eyebrow (Texto superior pequeño)</label>
              <input
                type="text"
                name="eyebrow_text"
                defaultValue={defaultValues.eyebrow_text}
                className={INPUT_STYLE}
                placeholder="INFRAESTRUCTURA Y TRADING ENERGÉTICO GLOBAL"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Línea 1 del Titular</label>
                <input
                  type="text"
                  name="heading_line_1"
                  defaultValue={defaultValues.heading_line_1}
                  className={INPUT_STYLE}
                  required
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Línea 2 del Titular</label>
                <input
                  type="text"
                  name="heading_line_2"
                  defaultValue={defaultValues.heading_line_2}
                  className={INPUT_STYLE}
                  required
                />
              </div>
            </div>

            <div>
              <label className={LABEL_STYLE}>Palabra o Frase con Acento (Color Ámbar Oro)</label>
              <input
                type="text"
                name="heading_accent"
                defaultValue={defaultValues.heading_accent}
                className={INPUT_STYLE}
                required
              />
            </div>

            <div>
              <label className={LABEL_STYLE}>Subtítulo / Propuesta de Valor</label>
              <textarea
                name="subtitle"
                defaultValue={defaultValues.subtitle}
                rows={3}
                className={cn(INPUT_STYLE, 'resize-y')}
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Eyebrow (English)</label>
              <input
                type="text"
                name="eyebrow_text_en"
                defaultValue={defaultValues.eyebrow_text_en || ''}
                className={INPUT_STYLE}
                placeholder="GLOBAL ENERGY TRADING & INFRASTRUCTURE"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Headline Line 1 (English)</label>
                <input
                  type="text"
                  name="heading_line_1_en"
                  defaultValue={defaultValues.heading_line_1_en || ''}
                  className={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Headline Line 2 (English)</label>
                <input
                  type="text"
                  name="heading_line_2_en"
                  defaultValue={defaultValues.heading_line_2_en || ''}
                  className={INPUT_STYLE}
                />
              </div>
            </div>

            <div>
              <label className={LABEL_STYLE}>Accent Highlight (English)</label>
              <input
                type="text"
                name="heading_accent_en"
                defaultValue={defaultValues.heading_accent_en || ''}
                className={INPUT_STYLE}
              />
            </div>

            <div>
              <label className={LABEL_STYLE}>Subtitle / Value Proposition (English)</label>
              <textarea
                name="subtitle_en"
                defaultValue={defaultValues.subtitle_en || ''}
                rows={3}
                className={cn(INPUT_STYLE, 'resize-y')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bloque 2: Botones de Acción (CTAs) */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <span>02.</span> Botones de Conversión (CTAs)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-card/40 border border-border/70 space-y-3">
            <span className="text-[11px] font-mono text-accent font-semibold">BOTÓN PRINCIPAL</span>
            <div>
              <label className={LABEL_STYLE}>Texto (ES)</label>
              <input
                type="text"
                name="cta_primary_text"
                defaultValue={defaultValues.cta_primary_text}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto (EN)</label>
              <input
                type="text"
                name="cta_primary_text_en"
                defaultValue={defaultValues.cta_primary_text_en || ''}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Destino (URL o #sección)</label>
              <input
                type="text"
                name="cta_primary_url"
                defaultValue={defaultValues.cta_primary_url}
                className={INPUT_STYLE}
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card/40 border border-border/70 space-y-3">
            <span className="text-[11px] font-mono text-text-muted font-semibold">BOTÓN SECUNDARIO</span>
            <div>
              <label className={LABEL_STYLE}>Texto (ES)</label>
              <input
                type="text"
                name="cta_secondary_text"
                defaultValue={defaultValues.cta_secondary_text}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto (EN)</label>
              <input
                type="text"
                name="cta_secondary_text_en"
                defaultValue={defaultValues.cta_secondary_text_en || ''}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Destino (URL o #sección)</label>
              <input
                type="text"
                name="cta_secondary_url"
                defaultValue={defaultValues.cta_secondary_url}
                className={INPUT_STYLE}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 3: Fondo Multimedia y Aspecto Visual */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <span>03.</span> Fondo Multimedia (Imagen / Video / Gradiente)
        </h3>

        <div className="space-y-4">
          <div>
            <label className={LABEL_STYLE}>Tipo de Fondo</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'gradient', label: 'Gradiente Dark', icon: Sparkles },
                { id: 'video', label: 'Video de Fondo', icon: Video },
                { id: 'image', label: 'Imagen de Fondo', icon: ImageIcon },
                { id: 'none', label: 'Sin Fondo (Liso)', icon: AlertCircle },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = bgType === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all',
                      isSelected
                        ? 'border-accent bg-accent/15 text-accent font-semibold shadow-sm'
                        : 'border-border/70 bg-card/40 text-text-muted hover:text-text'
                    )}
                  >
                    <input
                      type="radio"
                      name="hero_bg_type"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setBgType(opt.id)}
                      className="sr-only"
                    />
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs">{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {(bgType === 'video' || bgType === 'image') && (
            <div className="p-4 rounded-lg bg-card/60 border border-border space-y-4">
              <div>
                <label className={LABEL_STYLE}>
                  {bgType === 'video' ? 'URL del Video (MP4 / WebM / YouTube)' : 'URL de la Imagen de Fondo'}
                </label>
                <input
                  type="text"
                  name="hero_bg_url"
                  defaultValue={defaultValues.hero_bg_url || ''}
                  className={INPUT_STYLE}
                  placeholder={
                    bgType === 'video'
                      ? 'https://ejemplo.com/videos/oil-refinery.mp4'
                      : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23'
                  }
                />
                <p className="mt-1 text-[11px] text-text-subtle">
                  Se sugiere un video o imagen de buques tanque, refinerías o terminales marítimas.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={LABEL_STYLE}>Opacidad del Fondo</label>
                    <span className="text-xs font-mono font-bold text-accent">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    name="hero_bg_opacity"
                    min={0}
                    max={100}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div>
                  <label className={LABEL_STYLE}>Ajuste de Medios</label>
                  <select
                    name="hero_bg_fit"
                    defaultValue={defaultValues.hero_bg_fit || 'cover'}
                    className={INPUT_STYLE}
                  >
                    <option value="cover">Cubrir Todo el Hero (Cover - Recomendado)</option>
                    <option value="contain">Contener Proporción (Contain)</option>
                    <option value="fill">Rellenar (Fill)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLE}>Elemento Visual Lateral Derecho</label>
              <select
                name="hero_visual_tipo"
                defaultValue={defaultValues.hero_visual_tipo || 'mockup'}
                className={INPUT_STYLE}
              >
                <option value="mockup">Mockup 3D / Insignia de Certificación</option>
                <option value="graphic">Gráfico de Trading & Commodities</option>
                <option value="stats">Tarjeta Flotante de Métricas Globales</option>
                <option value="video">Reproductor de Video Corporativo</option>
              </select>
            </div>

            <div>
              <label className={LABEL_STYLE}>Ticker de Commodities / Petróleo</label>
              <input
                type="text"
                name="market_ticker"
                defaultValue={defaultValues.market_ticker || 'BRENT: $82.40/bbl (+1.2%) | WTI: $78.15/bbl (+0.9%)'}
                className={INPUT_STYLE}
              />
            </div>
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
          <span>{state.message || 'Hero actualizado correctamente'}</span>
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
              <span>Guardar Configuración del Hero</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
