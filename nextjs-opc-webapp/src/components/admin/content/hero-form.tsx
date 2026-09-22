'use client';

import React, { useState, useTransition, useRef } from 'react';
import { updateHeroAction } from '@/lib/services/content-actions';
import type { LandingHeroConfig, ContentActionResponse } from '@/types/content';
import {
  Loader2,
  Save,
  Video,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  FolderOpen,
  FileVideo,
  FileImage,
  RefreshCw,
} from 'lucide-react';
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
  const [bgUrl, setBgUrl] = useState<string>(defaultValues.hero_bg_url || '');
  const [opacity, setOpacity] = useState<number>(defaultValues.hero_bg_opacity ?? 20);
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');

  // Estados para subida de archivos
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejador de subida de archivo local
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir el archivo');
      }

      setBgUrl(data.url);
      if (data.mediaType === 'video') {
        setBgType('video');
      } else {
        setBgType('image');
      }

      setUploadMessage(`✓ Archivo "${file.name}" cargado exitosamente como ${data.mediaType === 'video' ? 'video' : 'imagen'}.`);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Manejador para importar ruta local de Windows si el usuario pegó C:\...
  const handleImportLocalPath = async () => {
    if (!bgUrl || !bgUrl.trim()) return;

    setUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    try {
      const res = await fetch('/api/upload/from-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localPath: bgUrl }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo importar la ruta');
      }

      setBgUrl(data.url);
      if (data.mediaType === 'video') {
        setBgType('video');
      } else {
        setBgType('image');
      }

      setUploadMessage(`✓ Archivo local copiado e importado al servidor: ${data.url}`);
      setTimeout(() => setUploadMessage(null), 5000);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al importar archivo local');
    } finally {
      setUploading(false);
    }
  };

  // Detectar si la URL parece una ruta local de Windows
  const isLocalDiskPath = /^[a-zA-Z]:[\\/]/.test(bgUrl.trim());

  // Enviar formulario
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('hero_bg_url', bgUrl);
    formData.set('hero_bg_type', bgType);

    startTransition(async () => {
      const res = await updateHeroAction(INITIAL_STATE, formData);
      setState(res);

      if (res.success && typeof window !== 'undefined') {
        try {
          const heroConfig = {
            ...defaultValues,
            hero_bg_type: bgType,
            hero_bg_url: bgUrl,
            hero_bg_opacity: opacity,
          };
          localStorage.setItem('investoil_hero_config', JSON.stringify(heroConfig));
          window.dispatchEvent(new CustomEvent('investoil_hero_updated', { detail: heroConfig }));
        } catch {}
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1.5">
                  <label className={LABEL_STYLE}>
                    {bgType === 'video' ? 'Archivo o URL del Video (MP4 / WebM)' : 'Archivo o URL de la Imagen de Fondo'}
                  </label>

                  {/* Input de archivo nativo oculto */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="video/mp4,video/webm,image/*"
                    className="hidden"
                  />

                  {/* Botón para examinar y subir archivo local */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo archivo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Seleccionar archivo (Video / Imagen)...</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="hero_bg_url"
                    value={bgUrl}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBgUrl(val);
                      // Auto-detectar si termina en extensión de video
                      if (/\.(mp4|webm|mov)$/i.test(val.trim())) {
                        setBgType('video');
                      } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(val.trim())) {
                        setBgType('image');
                      }
                    }}
                    className={INPUT_STYLE}
                    placeholder="https://... o /uploads/... o seleccione un archivo local"
                  />

                  {/* Si el usuario pegó una ruta de disco local de Windows (C:\...), mostrar botón de importar */}
                  {isLocalDiskPath && (
                    <button
                      type="button"
                      onClick={handleImportLocalPath}
                      disabled={uploading}
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
                      title="Copiar este archivo local al servidor web"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Importar</span>
                    </button>
                  )}
                </div>

                <p className="mt-1 text-[11px] text-text-subtle">
                  Seleccione un archivo de su computadora o ingrese una URL web. Formatos recomendados: MP4 para video, WebP/JPG para imagen.
                </p>

                {uploadMessage && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{uploadMessage}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Previsualización en Vivo de Imagen o Video */}
                {bgUrl && !isLocalDiskPath && (
                  <div className="mt-4 p-3 rounded-xl border border-border/80 bg-black/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                      <span className="flex items-center gap-1.5 text-accent">
                        {bgType === 'video' ? <FileVideo className="w-3.5 h-3.5" /> : <FileImage className="w-3.5 h-3.5" />}
                        <span>Vista previa de {bgType === 'video' ? 'Video' : 'Imagen'} en vivo:</span>
                      </span>
                      <span className="text-[10px] text-text-subtle truncate max-w-xs">{bgUrl}</span>
                    </div>

                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-border/50 bg-black flex items-center justify-center">
                      {bgType === 'video' ? (
                        <video
                          key={bgUrl}
                          src={bgUrl}
                          controls
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={bgUrl}
                          alt="Previsualización de fondo"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
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
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{state.message || 'Hero actualizado correctamente'}</span>
        </div>
      )}

      {/* Botón de Guardado */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending || uploading}
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
