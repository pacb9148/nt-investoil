'use client';

import React, { useState, useTransition, useRef } from 'react';
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
  Upload,
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

  // Estados de la tarjeta hero (sincronizados exactamente con el Hero)
  const [cardBg, setCardBg] = useState<string>(
    defaultValues.hero_card?.card_bg_color || '#0e1e3d'
  );
  const [cardBorder, setCardBorder] = useState<string>(
    defaultValues.hero_card?.card_border_color || '#1a3264'
  );
  const [cardGlow, setCardGlow] = useState<number>(
    defaultValues.hero_card?.card_glow_opacity ?? 50
  );
  const [logoUrl, setLogoUrl] = useState<string>(
    defaultValues.hero_card?.logo_url || '/uploads/1790262200243-2026-09-24_at_17.02.08.jpeg'
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

  // Textos y métricas de la tarjeta
  const [badgeText, setBadgeText] = useState<string>(
    defaultValues.hero_card?.badge_text || 'VERIFICACIÓN SGS & ASTM D1655'
  );
  const [metric1Label, setMetric1Label] = useState<string>(
    defaultValues.hero_card?.metric1_label || 'Despachos Mensuales:'
  );
  const [metric1Value, setMetric1Value] = useState<string>(
    defaultValues.hero_card?.metric1_value || '12.5M BBLS'
  );
  const [metric2Label, setMetric2Label] = useState<string>(
    defaultValues.hero_card?.metric2_label || 'Terminales Marítimas:'
  );
  const [metric2Value, setMetric2Value] = useState<string>(
    defaultValues.hero_card?.metric2_value || 'Houston / Rotterdam'
  );
  const [metric3Label, setMetric3Label] = useState<string>(
    defaultValues.hero_card?.metric3_label || 'Estatus Operativo:'
  );
  const [metric3Value, setMetric3Value] = useState<string>(
    defaultValues.hero_card?.metric3_value || 'ACTIVO 100%'
  );

  // Estados para subida de la imagen corporativa / sello
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setLogoError(null);
    setLogoMessage(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fallo en la subida del logotipo');
      }

      setLogoUrl(data.url);
      setLogoMessage(`Imagen corporativa subida con éxito (${file.name})`);
      setTimeout(() => setLogoMessage(null), 5000);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Error al subir imagen corporativa');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleColorChange = (secId: string, value: string) => {
    setSectionColors((prev) => ({ ...prev, [secId]: value }));
  };

  const resetSectionColor = (secId: string, defColor: string) => {
    setSectionColors((prev) => ({ ...prev, [secId]: defColor }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('hero_logo_url', logoUrl);
    formData.set('hero_card_bg', cardBg);
    formData.set('hero_card_border', cardBorder);
    formData.set('hero_card_glow_opacity', String(cardGlow));
    formData.set('hero_logo_hue', String(logoHue));
    formData.set('hero_logo_brightness', String(logoBrightness));
    formData.set('hero_logo_saturation', String(logoSaturation));
    formData.set('hero_logo_shadow_color', logoShadowColor);
    formData.set('hero_logo_shadow_blur', String(logoShadowBlur));
    formData.set('hero_badge_text', badgeText);
    formData.set('hero_metric1_label', metric1Label);
    formData.set('hero_metric1_value', metric1Value);
    formData.set('hero_metric2_label', metric2Label);
    formData.set('hero_metric2_value', metric2Value);
    formData.set('hero_metric3_label', metric3Label);
    formData.set('hero_metric3_value', metric3Value);

    startTransition(async () => {
      // 1. Guardar vía API REST directa para actualización instantánea
      try {
        const payload = {
          ...defaultValues,
          section_bg_colors: sectionColors,
          hero_card: {
            card_bg_color: cardBg,
            card_border_color: cardBorder,
            card_glow_opacity: cardGlow,
            logo_url: logoUrl,
            logo_hue: logoHue,
            logo_brightness: logoBrightness,
            logo_saturation: logoSaturation,
            logo_shadow_color: logoShadowColor,
            logo_shadow_blur: logoShadowBlur,
            badge_text: badgeText,
            metric1_label: metric1Label,
            metric1_value: metric1Value,
            metric2_label: metric2Label,
            metric2_value: metric2Value,
            metric3_label: metric3Label,
            metric3_value: metric3Value,
          },
        };

        await fetch('/api/content/appearance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Sincronizar simultáneamente con el Hero
        await fetch('/api/content/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hero_card: payload.hero_card }),
        });
      } catch (err) {
        console.error('Error al sincronizar apariencia:', err);
      }

      // 2. Ejecutar Server Action
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

            {/* Imagen Corporativa Central (Sello o Logotipo de la Tarjeta) */}
            <div className="p-4 rounded-lg bg-card/60 border border-border space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className={LABEL_STYLE}>
                  Imagen Corporativa Central (Sello o Logotipo de la Tarjeta)
                </label>

                {/* Input de archivo nativo oculto para el logo */}
                <input
                  type="file"
                  ref={logoFileInputRef}
                  onChange={handleLogoFileSelect}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                {/* Botón para examinar y subir archivo local de imagen */}
                <button
                  type="button"
                  onClick={() => logoFileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Subiendo imagen...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Buscar y Seleccionar Archivo...</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="hero_logo_url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/images/branding/seal-transparent.png o /uploads/..."
                  className={INPUT_STYLE}
                />
              </div>

              {/* Botones de selección rápida de logos corporativos */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-text-subtle">Plantillas:</span>
                <button
                  type="button"
                  onClick={() => setLogoUrl('/uploads/1790262200243-2026-09-24_at_17.02.08.jpeg')}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-card border border-border hover:border-accent/50 text-text-muted hover:text-text transition-colors"
                >
                  Sello Gota Petróleo (Actual)
                </button>
                <button
                  type="button"
                  onClick={() => setLogoUrl('/images/branding/seal-transparent.png')}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-card border border-border hover:border-accent/50 text-text-muted hover:text-text transition-colors"
                >
                  Sello Oficial Dorado
                </button>
                <button
                  type="button"
                  onClick={() => setLogoUrl('/images/branding/logo.png')}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-card border border-border hover:border-accent/50 text-text-muted hover:text-text transition-colors"
                >
                  Logotipo Corporativo
                </button>
              </div>

              {logoMessage && (
                <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{logoMessage}</span>
                </div>
              )}
              {logoError && (
                <div className="flex items-center gap-2 p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{logoError}</span>
                </div>
              )}
            </div>

            {/* Textos y Métricas de la Tarjeta Hero */}
            <div className="p-4 rounded-lg bg-card/60 border border-border space-y-3">
              <span className="text-[11px] font-mono text-accent font-semibold block">
                Textos y Métricas de la Tarjeta:
              </span>

              <div>
                <label className={LABEL_STYLE}>Insignia Superior</label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  className={INPUT_STYLE}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_STYLE}>Métrica 1 Etiqueta</label>
                  <input
                    type="text"
                    value={metric1Label}
                    onChange={(e) => setMetric1Label(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Métrica 1 Valor</label>
                  <input
                    type="text"
                    value={metric1Value}
                    onChange={(e) => setMetric1Value(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_STYLE}>Métrica 2 Etiqueta</label>
                  <input
                    type="text"
                    value={metric2Label}
                    onChange={(e) => setMetric2Label(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Métrica 2 Valor</label>
                  <input
                    type="text"
                    value={metric2Value}
                    onChange={(e) => setMetric2Value(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_STYLE}>Métrica 3 Etiqueta</label>
                  <input
                    type="text"
                    value={metric3Label}
                    onChange={(e) => setMetric3Label(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Métrica 3 Valor</label>
                  <input
                    type="text"
                    value={metric3Value}
                    onChange={(e) => setMetric3Value(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa en vivo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-border/80 sticky top-4">
            <span className="text-[10px] font-mono text-text-subtle uppercase tracking-wider mb-3">
              Vista previa sincronizada en tiempo real
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
                    <span>{badgeText}</span>
                  </span>
                </div>

                <div className="flex justify-center py-1">
                  <img
                    src={logoUrl || '/uploads/1790262200243-2026-09-24_at_17.02.08.jpeg'}
                    alt="Sello Oficial Invest Oil LLC"
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
                    <span>{metric1Label}</span>
                    <span className="font-bold text-white">{metric1Value}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{metric2Label}</span>
                    <span className="font-bold text-white">{metric2Value}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>{metric3Label}</span>
                    <span className="font-bold text-emerald-400">{metric3Value}</span>
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
