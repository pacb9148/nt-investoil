'use client';

import React, { useState, useTransition } from 'react';
import { updateAppearanceAction } from '@/lib/services/content-actions';
import type { LandingAppearanceConfig, ContentActionResponse } from '@/types/content';
import {
  Loader2,
  Save,
  Type,
  Palette,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Paintbrush,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_STATE: ContentActionResponse = {
  success: false,
  error: null,
};

const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';
const SELECT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3 py-2 text-xs text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';

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

const SECTIONS_METADATA = [
  { id: 'hero', name: 'Hero Principal', defaultColor: '#07090e' },
  { id: 'marquee', name: 'Marquesina Doble (Precios & Titulares)', defaultColor: '#0b0f19' },
  { id: 'problema', name: 'Retos del Sector (El Problema)', defaultColor: '#07090e' },
  { id: 'services', name: 'Servicios Petroleros', defaultColor: '#0a0d14' },
  { id: 'products', name: 'Portafolio de Hidrocarburos', defaultColor: '#07090e' },
  { id: 'plataforma', name: 'Operaciones & Infraestructura', defaultColor: '#0a0d14' },
  { id: 'team', name: 'Consejo Directivo & Liderazgo', defaultColor: '#07090e' },
  { id: 'testimonials', name: 'Testimonios & Clientes', defaultColor: '#0a0d14' },
  { id: 'faq', name: 'Preguntas Frecuentes (FAQ)', defaultColor: '#07090e' },
  { id: 'contact', name: 'Formulario de Contacto & Leads', defaultColor: '#0a0d14' },
];

export function AparienciaForm({ defaultValues }: { defaultValues: LandingAppearanceConfig }) {
  const [state, setState] = useState<ContentActionResponse>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();

  // Estados de colores de sección con color picker
  const [sectionColors, setSectionColors] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    SECTIONS_METADATA.forEach((sec) => {
      initial[sec.id] =
        defaultValues.section_bg_colors?.[sec.id as keyof typeof defaultValues.section_bg_colors] ||
        sec.defaultColor;
    });
    return initial;
  });

  // Estados de la tarjeta hero
  const [cardBg, setCardBg] = useState<string>(
    defaultValues.hero_card?.card_bg_color || '#0e1e3d'
  );
  const [cardBorder, setCardBorder] = useState<string>(
    defaultValues.hero_card?.card_border_color || '#1a3264'
  );
  const [cardGlow, setCardGlow] = useState<number>(
    defaultValues.hero_card?.card_glow_opacity ?? 50
  );
  const [logoHue, setLogoHue] = useState<number>(
    defaultValues.hero_card?.logo_hue ?? 0
  );
  const [logoBrightness, setLogoBrightness] = useState<number>(
    defaultValues.hero_card?.logo_brightness ?? 100
  );
  const [logoSaturation, setLogoSaturation] = useState<number>(
    defaultValues.hero_card?.logo_saturation ?? 100
  );
  const [logoShadowColor, setLogoShadowColor] = useState<string>(
    defaultValues.hero_card?.logo_shadow_color || '#f59e0b'
  );
  const [logoShadowBlur, setLogoShadowBlur] = useState<number>(
    defaultValues.hero_card?.logo_shadow_blur ?? 20
  );

  const handleColorChange = (secId: string, value: string) => {
    setSectionColors((prev) => ({ ...prev, [secId]: value }));
  };

  const resetSectionColor = (secId: string, defColor: string) => {
    setSectionColors((prev) => ({ ...prev, [secId]: defColor }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateAppearanceAction(INITIAL_STATE, formData);
      setState(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
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

      {/* 4. Selector de Color de Fondo por Sección (Color Picker) */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            <span>Colores de Fondo por Sección (Color Picker Independiente)</span>
          </h3>
          <span className="text-[10px] font-mono text-text-subtle">
            Distingue visualmente cada sección
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SECTIONS_METADATA.map((sec) => {
            const currentColor = sectionColors[sec.id] || sec.defaultColor;
            return (
              <div
                key={sec.id}
                className="p-3.5 rounded-lg border border-border/60 bg-card/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-text">{sec.name}</span>
                  <button
                    type="button"
                    onClick={() => resetSectionColor(sec.id, sec.defaultColor)}
                    className="text-[10px] font-mono text-text-subtle hover:text-accent flex items-center gap-1 transition-colors"
                    title="Restablecer color por defecto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Defecto</span>
                  </button>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={currentColor.startsWith('#') ? currentColor : sec.defaultColor}
                    onChange={(e) => handleColorChange(sec.id, e.target.value)}
                    className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    name={`sec_bg_${sec.id}`}
                    value={currentColor}
                    onChange={(e) => handleColorChange(sec.id, e.target.value)}
                    className={INPUT_STYLE}
                    placeholder={sec.defaultColor}
                  />
                  <div
                    className="w-9 h-9 rounded-lg border border-border/60 shrink-0 shadow-inner"
                    style={{ backgroundColor: currentColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Personalización de Tarjeta Hero Señalada & Logotipo */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>Personalización de Tarjeta Hero & Logotipo (Filtros, Sombra y Luminosidad)</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Sincronizado con Hero
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controles */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Color de Fondo de Tarjeta</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cardBg.startsWith('#') ? cardBg : '#0e1e3d'}
                    onChange={(e) => setCardBg(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    name="hero_card_bg"
                    value={cardBg}
                    onChange={(e) => setCardBg(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_STYLE}>Color de Borde / Resplandor</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cardBorder.startsWith('#') ? cardBorder : '#1a3264'}
                    onChange={(e) => setCardBorder(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    name="hero_card_border"
                    value={cardBorder}
                    onChange={(e) => setCardBorder(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={LABEL_STYLE}>Opacidad del Resplandor Glow</label>
                <span className="text-xs font-mono text-accent">{cardGlow}%</span>
              </div>
              <input
                type="range"
                name="hero_card_glow_opacity"
                min="0"
                max="100"
                value={cardGlow}
                onChange={(e) => setCardGlow(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-border/40 space-y-3">
              <div className="text-[11px] font-mono text-accent font-semibold">
                Filtros del Logotipo / Sello:
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-text-muted">Matiz (Hue Rotate)</span>
                  <span className="text-xs font-mono text-amber-400">{logoHue}°</span>
                </div>
                <input
                  type="range"
                  name="hero_logo_hue"
                  min="0"
                  max="360"
                  value={logoHue}
                  onChange={(e) => setLogoHue(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-text-muted">Luminosidad (Brightness)</span>
                  <span className="text-xs font-mono text-amber-400">{logoBrightness}%</span>
                </div>
                <input
                  type="range"
                  name="hero_logo_brightness"
                  min="50"
                  max="200"
                  value={logoBrightness}
                  onChange={(e) => setLogoBrightness(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-text-muted">Saturación</span>
                  <span className="text-xs font-mono text-amber-400">{logoSaturation}%</span>
                </div>
                <input
                  type="range"
                  name="hero_logo_saturation"
                  min="0"
                  max="200"
                  value={logoSaturation}
                  onChange={(e) => setLogoSaturation(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] font-mono text-text-muted block mb-1">Color de Sombra</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={logoShadowColor.startsWith('#') ? logoShadowColor : '#f59e0b'}
                      onChange={(e) => setLogoShadowColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      name="hero_logo_shadow_color"
                      value={logoShadowColor}
                      onChange={(e) => setLogoShadowColor(e.target.value)}
                      className={INPUT_STYLE}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-mono text-text-muted">Blur Sombra</span>
                    <span className="text-xs font-mono text-accent">{logoShadowBlur}px</span>
                  </div>
                  <input
                    type="range"
                    name="hero_logo_shadow_blur"
                    min="0"
                    max="50"
                    value={logoShadowBlur}
                    onChange={(e) => setLogoShadowBlur(Number(e.target.value))}
                    className="w-full accent-amber-500 mt-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa en vivo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-border/80">
            <span className="text-[10px] font-mono text-text-subtle uppercase tracking-wider mb-3">
              Vista previa
            </span>
            <div className="relative w-full max-w-[280px]">
              <div
                className="absolute -inset-1 rounded-2xl blur-lg transition-all duration-300 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, ${cardBorder}, #f59e0b)`,
                  opacity: cardGlow / 100,
                }}
              />
              <div
                className="relative rounded-xl p-4 shadow-xl space-y-4 transition-all duration-300 backdrop-blur-md"
                style={{
                  backgroundColor: cardBg,
                  border: `1px solid ${cardBorder}`,
                }}
              >
                <div
                  className="flex items-center justify-between pb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200"
                  style={{ borderBottom: `1px solid ${cardBorder}40` }}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                    <span>VERIFICACIÓN SGS</span>
                  </span>
                </div>

                <div className="flex justify-center py-1">
                  <img
                    src="/images/branding/seal-transparent.png"
                    alt="Preview"
                    className="w-28 h-28 object-contain transition-all duration-200"
                    style={{
                      filter: `hue-rotate(${logoHue}deg) brightness(${logoBrightness}%) saturate(${logoSaturation}%) drop-shadow(0 0 ${logoShadowBlur}px ${logoShadowColor})`,
                    }}
                  />
                </div>

                <div
                  className="space-y-1.5 pt-2 text-[10px] font-mono"
                  style={{ borderTop: `1px solid ${cardBorder}40` }}
                >
                  <div className="flex justify-between text-slate-300">
                    <span>Despachos:</span>
                    <span className="font-bold text-white">12.5M BBLS</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Estatus:</span>
                    <span className="font-bold text-emerald-400">ACTIVO 100%</span>
                  </div>
                </div>
              </div>
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
