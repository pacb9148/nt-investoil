'use client';

import React, { useState, useTransition, useRef } from 'react';
import { updateHeroAction } from '@/lib/services/content-actions';
import type { LandingHeroConfig, ContentActionResponse } from '@/types/content';
import { SectionDesignBar } from './section-design-bar';
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
  Info,
  X,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

const INITIAL_STATE: ContentActionResponse = {
  success: false,
  error: null,
};

const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

function hexOrRgbToRgba(color: string, opacityPercent: number): string {
  if (opacityPercent <= 0) return 'transparent';
  const alpha = Math.max(0, Math.min(1, opacityPercent / 100));
  if (!color || color === 'transparent') return `rgba(14, 30, 61, ${alpha})`;
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  if (color.startsWith('rgb')) {
    const nums = color.match(/\d+/g);
    if (nums && nums.length >= 3) {
      return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
    }
  }
  return color;
}

export function HeroForm({ defaultValues }: { defaultValues: LandingHeroConfig }) {
  const [state, setState] = useState<ContentActionResponse>(INITIAL_STATE);
  const [isPending, startTransition] = useTransition();
  const [bgType, setBgType] = useState<string>(defaultValues.hero_bg_type || 'gradient');
  const [bgUrl, setBgUrl] = useState<string>(defaultValues.hero_bg_url || '');
  const [showMediaInfo, setShowMediaInfo] = useState<boolean>(false);
  const [previewMediaType, setPreviewMediaType] = useState<'video' | 'image' | null>(() => {
    if (defaultValues.hero_bg_type === 'video') return 'video';
    if (defaultValues.hero_bg_type === 'image') return 'image';
    if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(defaultValues.hero_bg_url || '')) return 'video';
    if (/\.(jpg|jpeg|png|webp|svg|gif|avif)(\?|$)/i.test(defaultValues.hero_bg_url || '')) return 'image';
    return null;
  });
  const [opacity, setOpacity] = useState<number>(defaultValues.hero_bg_opacity ?? 20);
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');

  // Estados para personalización de la Tarjeta Hero Señalada y Logotipo
  const [cardBg, setCardBg] = useState<string>(defaultValues.hero_card?.card_bg_color || '#0e1e3d');
  const [cardBorder, setCardBorder] = useState<string>(defaultValues.hero_card?.card_border_color || '#1a3264');
  const [cardGlow, setCardGlow] = useState<number>(defaultValues.hero_card?.card_glow_opacity ?? 50);
  const [cardOpacity, setCardOpacity] = useState<number>(defaultValues.hero_card?.card_opacity ?? 90);
  const [logoUrl, setLogoUrl] = useState<string>(
    defaultValues.hero_card?.logo_url || '/images/branding/corporate-card-logo.jpeg'
  );
  const [logoHue, setLogoHue] = useState<number>(defaultValues.hero_card?.logo_hue ?? 0);
  const [logoBrightness, setLogoBrightness] = useState<number>(defaultValues.hero_card?.logo_brightness ?? 100);
  const [logoSaturation, setLogoSaturation] = useState<number>(defaultValues.hero_card?.logo_saturation ?? 100);
  const [logoShadowColor, setLogoShadowColor] = useState<string>(defaultValues.hero_card?.logo_shadow_color || '#f59e0b');
  const [logoShadowBlur, setLogoShadowBlur] = useState<number>(defaultValues.hero_card?.logo_shadow_blur ?? 20);

  // Estados de textos métricos de la tarjeta
  const [badgeText, setBadgeText] = useState<string>(
    defaultValues.hero_card?.badge_text || 'VERIFICACIÓN SGS & ASTM D1655'
  );
  const [badgeTextEn, setBadgeTextEn] = useState<string>(
    defaultValues.hero_card?.badge_text_en || 'SGS & ASTM D1655 VERIFICATION'
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

  // Estados para subida de archivos del fondo
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para subida de la imagen corporativa / sello
  const [uploadingLogo, setUploadingLogo] = useState<boolean>(false);
  const [deletingLogo, setDeletingLogo] = useState<boolean>(false);
  const [logoMessage, setLogoMessage] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Estados para selector de biblioteca de medios
  const [openHeroPicker, setOpenHeroPicker] = useState(false);
  const [heroPickerAccept, setHeroPickerAccept] = useState<'image' | 'video'>('video');
  const [heroPickerTarget, setHeroPickerTarget] = useState<'bg' | 'logo'>('bg');

  // Manejador de subida de archivo de fondo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const isVid = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov', '.ogg'].includes(ext);
    const isImg = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'].includes(ext);

    if (!isVid && !isImg) {
      setUploadError(`Formato "${ext}" no permitido. Formatos válidos: Videos (MP4, WebM, MOV) e Imágenes (JPG, PNG, WebP, SVG, GIF, AVIF).`);
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (isImg && fileSizeMB > 2) {
      setUploadError(`La imagen pesa ${fileSizeMB.toFixed(1)} MB y supera el tamaño máximo permitido de 2 MB.`);
      return;
    }
    if (isVid && fileSizeMB > 100) {
      setUploadError(`El video pesa ${fileSizeMB.toFixed(1)} MB y supera el tamaño máximo permitido de 100 MB.`);
      return;
    }

    // Previsualización instantánea local (0ms de latencia)
    try {
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      const objUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(objUrl);
    } catch {}

    if (isVid) {
      setBgType('video');
      setPreviewMediaType('video');
    } else {
      setBgType('image');
      setPreviewMediaType('image');
    }

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
        setPreviewMediaType('video');
      } else {
        setBgType('image');
        setPreviewMediaType('image');
      }

      setUploadMessage(`✓ Archivo "${file.name}" guardado exitosamente en base de datos como ${data.mediaType === 'video' ? 'video' : 'imagen'}.`);
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

  // Manejador de subida de imagen corporativa / logo
  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setLogoError(null);
    setLogoMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir imagen corporativa');
      }

      setLogoUrl(data.url);
      setLogoMessage(`✓ Imagen corporativa "${file.name}" cargada correctamente.`);
      setTimeout(() => setLogoMessage(null), 5000);
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Error al subir imagen corporativa');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveHeroLogo = () => {
    setLogoUrl('');
    setLogoMessage('Sello corporativo quitado de la tarjeta central.');
    setTimeout(() => setLogoMessage(null), 3500);
  };

  const handleDeleteHeroLogoFile = async () => {
    if (!logoUrl) return;
    if (!window.confirm('¿Deseas eliminar permanentemente este archivo del servidor y la base de datos?')) return;
    setDeletingLogo(true);
    try {
      const res = await fetch(`/api/upload?url=${encodeURIComponent(logoUrl)}`, { method: 'DELETE' });
      const resData = await res.json();
      if (res.ok) {
        setLogoUrl('');
        setLogoMessage('✓ Archivo eliminado del almacén y desvinculado del hero.');
        setTimeout(() => setLogoMessage(null), 4000);
      } else {
        setLogoError(resData.error || 'Error al eliminar archivo');
      }
    } catch {
      setLogoError('Error de red al comunicar con el servidor para eliminar el archivo');
    } finally {
      setDeletingLogo(false);
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

  // Enviar formulario con persistencia dual
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('hero_bg_url', bgUrl);
    formData.set('hero_bg_type', bgType);
    formData.set('hero_logo_url', logoUrl);
    formData.set('hero_card_bg', cardBg);
    formData.set('hero_card_border', cardBorder);
    formData.set('hero_card_glow_opacity', String(cardGlow));
    formData.set('hero_card_opacity', String(cardOpacity));
    formData.set('hero_logo_hue', String(logoHue));
    formData.set('hero_logo_brightness', String(logoBrightness));
    formData.set('hero_logo_saturation', String(logoSaturation));
    formData.set('hero_logo_shadow_color', logoShadowColor);
    formData.set('hero_logo_shadow_blur', String(logoShadowBlur));
    formData.set('hero_badge_text', badgeText);
    formData.set('hero_badge_text_en', badgeTextEn);
    formData.set('hero_metric1_label', metric1Label);
    formData.set('hero_metric1_value', metric1Value);
    formData.set('hero_metric2_label', metric2Label);
    formData.set('hero_metric2_value', metric2Value);
    formData.set('hero_metric3_label', metric3Label);
    formData.set('hero_metric3_value', metric3Value);

    startTransition(async () => {
      // 1. Guardar vía API REST directa
      try {
        const payload: Partial<LandingHeroConfig> = {
          ...defaultValues,
          eyebrow_text: formData.get('eyebrow_text') as string,
          eyebrow_text_en: formData.get('eyebrow_text_en') as string,
          heading_line_1: formData.get('heading_line_1') as string,
          heading_line_1_en: formData.get('heading_line_1_en') as string,
          heading_line_2: formData.get('heading_line_2') as string,
          heading_line_2_en: formData.get('heading_line_2_en') as string,
          heading_accent: formData.get('heading_accent') as string,
          heading_accent_en: formData.get('heading_accent_en') as string,
          subtitle: formData.get('subtitle') as string,
          subtitle_en: formData.get('subtitle_en') as string,
          cta_primary_text: formData.get('cta_primary_text') as string,
          cta_primary_text_en: formData.get('cta_primary_text_en') as string,
          cta_primary_url: formData.get('cta_primary_url') as string,
          cta_secondary_text: formData.get('cta_secondary_text') as string,
          cta_secondary_text_en: formData.get('cta_secondary_text_en') as string,
          cta_secondary_url: formData.get('cta_secondary_url') as string,
          hero_bg_type: bgType as any,
          hero_bg_url: bgUrl,
          hero_bg_opacity: opacity,
          hero_bg_fit: (formData.get('hero_bg_fit') || 'cover') as any,
          hero_visual_tipo: (formData.get('hero_visual_tipo') || 'mockup') as any,
          market_ticker: formData.get('market_ticker') as string,
          hero_card: {
            card_bg_color: cardBg,
            card_border_color: cardBorder,
            card_glow_opacity: cardGlow,
            card_opacity: cardOpacity,
            logo_url: logoUrl,
            logo_hue: logoHue,
            logo_brightness: logoBrightness,
            logo_saturation: logoSaturation,
            logo_shadow_color: logoShadowColor,
            logo_shadow_blur: logoShadowBlur,
            badge_text: badgeText,
            badge_text_en: badgeTextEn,
            metric1_label: metric1Label,
            metric1_value: metric1Value,
            metric2_label: metric2Label,
            metric2_value: metric2Value,
            metric3_label: metric3Label,
            metric3_value: metric3Value,
          },
        };

        await fetch('/api/content/hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        try {
          localStorage.setItem('investoil_hero_config', JSON.stringify(payload));
        } catch {}

        window.dispatchEvent(new CustomEvent('investoil_hero_updated', { detail: payload }));
      } catch (err) {
        console.error('Error al guardar en /api/content/hero:', err);
      }

      // 2. Ejecutar Server Action para revalidar SSR
      const res = await updateHeroAction(INITIAL_STATE, formData);
      setState(res);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Barra de ColorPicker integrada para el fondo de la sección Hero */}
      <SectionDesignBar
        sectionId="hero"
        sectionName="Hero Principal"
        defaultBgColor="#07090e"
      />
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

      {/* Barra de Acciones Superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2">
          {state.success && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{state.message || 'Configuración del Hero guardada con éxito'}</span>
            </span>
          )}
          {state.error && (
            <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </span>
          )}
          {!state.success && !state.error && (
            <span className="text-xs text-text-muted">
              Personaliza titulares, imagen/video de fondo y visual lateral:
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all duration-200 disabled:opacity-50 shrink-0"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
              <span>03.</span> Fondo Multimedia (Imagen / Video / Gradiente)
            </h3>
            {/* Icono de Información interactivo */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowMediaInfo(!showMediaInfo)}
                className={cn(
                  'p-1 rounded-full transition-colors',
                  showMediaInfo
                    ? 'bg-accent/20 text-accent'
                    : 'text-text-subtle hover:text-accent hover:bg-card'
                )}
                title="Ver especificaciones técnicas y formatos"
              >
                <Info className="w-3.5 h-3.5" />
              </button>

              {showMediaInfo && (
                <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-72 sm:w-80 p-3.5 rounded-xl bg-card border border-border shadow-2xl z-30 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-border/70 pb-2">
                    <span className="text-[11px] font-bold text-text flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span>Especificaciones y Límites</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowMediaInfo(false)}
                      className="text-text-subtle hover:text-text p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[10px] text-text-muted font-mono">
                    <li><strong className="text-text">Videos de fondo:</strong> MP4, WebM, MOV (Máx. <span className="text-amber-400">100 MB</span>)</li>
                    <li><strong className="text-text">Imágenes de fondo:</strong> JPG, JPEG, PNG, WebP, SVG, AVIF (Máx. <span className="text-amber-400">2 MB</span>)</li>
                    <li className="font-sans text-text-subtle pt-1">Los archivos locales subidos se almacenan en base de datos PostgreSQL para persistir entre despliegues.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {bgUrl && (
            <button
              type="button"
              onClick={() => {
                setBgUrl('');
                setLocalPreviewUrl(null);
                setPreviewMediaType(null);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              title="Quitar fondo actual"
            >
              <X className="w-3 h-3" />
              <span>Quitar fondo</span>
            </button>
          )}
        </div>

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
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setBgType(opt.id);
                      if (opt.id === 'image') setPreviewMediaType('image');
                      else if (opt.id === 'video') setPreviewMediaType('video');
                      else setPreviewMediaType(null);
                    }}
                    className={cn(
                      'flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all text-left w-full',
                      isSelected
                        ? 'border-accent bg-accent/15 text-accent font-semibold shadow-sm'
                        : 'border-border/70 bg-card/40 text-text-muted hover:text-text'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            {/* Input oculto para formData */}
            <input type="hidden" name="hero_bg_type" value={bgType} />
          </div>

          {/* Panel Condicional según Tipo de Fondo */}
          {bgType === 'video' && (
            <div className="p-4 rounded-lg bg-card/60 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className={LABEL_STYLE}>Archivo o URL del Video (MP4 / WebM / MOV)</label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPickerAccept('video');
                      setHeroPickerTarget('bg');
                      setOpenHeroPicker(true);
                    }}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-text-muted hover:text-accent text-xs font-semibold transition-all shadow-sm"
                    title="Seleccionar video existente de la biblioteca"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Elegir de Biblioteca...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo video...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Seleccionar archivo (Video)...</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="hero_bg_url"
                  value={bgUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBgUrl(val);
                    setPreviewMediaType('video');
                  }}
                  className={INPUT_STYLE}
                  placeholder="https://... o /videos/hero-background.mp4 o /uploads/..."
                />
                {bgUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setBgUrl('');
                      setLocalPreviewUrl(null);
                    }}
                    className="p-2.5 rounded-lg border border-border bg-card text-text-subtle hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Limpiar URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isLocalDiskPath && (
                  <button
                    type="button"
                    onClick={handleImportLocalPath}
                    disabled={uploading}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
                    title="Copiar archivo local al servidor web"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Importar</span>
                  </button>
                )}
              </div>

              {/* Videos Rápidos Disponibles y Funcionando */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-text-subtle">Videos verificados:</span>
                <button
                  type="button"
                  onClick={() => {
                    setBgType('video');
                    setPreviewMediaType('video');
                    setLocalPreviewUrl(null);
                    setBgUrl('/videos/hero-background.mp4');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1',
                    bgUrl === '/videos/hero-background.mp4'
                      ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  <FileVideo className="w-3 h-3 text-amber-400" />
                  <span>Video Refinería (Oficial)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBgType('video');
                    setPreviewMediaType('video');
                    setLocalPreviewUrl(null);
                    setBgUrl('/uploads/1790117420791-307348_large.mp4');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1',
                    bgUrl === '/uploads/1790117420791-307348_large.mp4'
                      ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  <FileVideo className="w-3 h-3 text-teal-400" />
                  <span>Video Operaciones Industriales</span>
                </button>
              </div>
            </div>
          )}

          {bgType === 'image' && (
            <div className="p-4 rounded-lg bg-card/60 border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <label className={LABEL_STYLE}>Archivo o URL de la Imagen de Fondo</label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPickerAccept('image');
                      setHeroPickerTarget('bg');
                      setOpenHeroPicker(true);
                    }}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-text-muted hover:text-accent text-xs font-semibold transition-all shadow-sm"
                    title="Seleccionar imagen existente de la biblioteca"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Elegir de Biblioteca...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo imagen...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Seleccionar archivo (Imagen)...</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="hero_bg_url"
                  value={bgUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBgUrl(val);
                    setPreviewMediaType('image');
                  }}
                  className={INPUT_STYLE}
                  placeholder="https://... o /uploads/... o seleccione un archivo local"
                />
                {bgUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setBgUrl('');
                      setLocalPreviewUrl(null);
                    }}
                    className="p-2.5 rounded-lg border border-border bg-card text-text-subtle hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                    title="Limpiar URL"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {isLocalDiskPath && (
                  <button
                    type="button"
                    onClick={handleImportLocalPath}
                    disabled={uploading}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
                    title="Copiar archivo local al servidor web"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Importar</span>
                  </button>
                )}
              </div>

              {/* Imágenes Reales de la Industria Petrolera */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-text-subtle">Fondos petroleros reales:</span>
                <button
                  type="button"
                  onClick={() => {
                    setBgType('image');
                    setPreviewMediaType('image');
                    setLocalPreviewUrl(null);
                    setBgUrl('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1',
                    bgUrl.includes('photo-1518709268805')
                      ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  <FileImage className="w-3 h-3 text-amber-400" />
                  <span>Refinería Atardecer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBgType('image');
                    setPreviewMediaType('image');
                    setLocalPreviewUrl(null);
                    setBgUrl('https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1920&q=80');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1',
                    bgUrl.includes('photo-1559136555')
                      ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  <FileImage className="w-3 h-3 text-sky-400" />
                  <span>Buque Petrolero Marítimo</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBgType('image');
                    setPreviewMediaType('image');
                    setLocalPreviewUrl(null);
                    setBgUrl('https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1920&q=80');
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1',
                    bgUrl.includes('photo-1581094288')
                      ? 'bg-accent/20 border-accent text-accent font-semibold shadow-sm'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  <FileImage className="w-3 h-3 text-emerald-400" />
                  <span>Terminal de Almacenamiento & Tanques</span>
                </button>
              </div>
            </div>
          )}

          {bgType === 'gradient' && (
            <div className="p-4 rounded-lg bg-card/60 border border-border/80 text-xs text-text-muted space-y-1">
              <div className="font-semibold text-text flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Modo Gradiente Dark Obsidian Activo</span>
              </div>
              <p className="text-[11px] text-text-subtle">
                El fondo del Hero exhibe un degradado radial oscuro con resplandores ámbar y petróleo de alto contraste, ideal para lectura nítida de métricas y titulares.
              </p>
            </div>
          )}

          {bgType === 'none' && (
            <div className="p-4 rounded-lg bg-card/60 border border-border/80 text-xs text-text-muted space-y-1">
              <div className="font-semibold text-text flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Modo Sin Fondo (Liso) Activo</span>
              </div>
              <p className="text-[11px] text-text-subtle">
                El Hero se presentará sobre el color de lienzo base (#020617) sin imágenes ni videos de fondo.
              </p>
            </div>
          )}

          {uploadMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Previsualización en Vivo Permanente y Estable */}
          <div className="p-4 rounded-xl border border-border/80 bg-card/70 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
              <span className="flex items-center gap-1.5 text-accent font-semibold">
                {bgType === 'video' ? (
                  <FileVideo className="w-3.5 h-3.5 text-amber-400" />
                ) : bgType === 'image' ? (
                  <FileImage className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                )}
                <span>
                  Vista previa en vivo (
                  {bgType === 'video'
                    ? 'Video de Fondo'
                    : bgType === 'image'
                    ? 'Imagen de Fondo'
                    : bgType === 'gradient'
                    ? 'Gradiente Dark'
                    : 'Fondo Liso'}
                  ):
                </span>
              </span>
              {(localPreviewUrl || bgUrl) && (
                <span className="text-[10px] text-text-subtle truncate max-w-xs">
                  {localPreviewUrl || bgUrl}
                </span>
              )}
            </div>

            <div className="relative w-full h-64 max-h-64 rounded-lg overflow-hidden border border-border/70 bg-[#070b14] flex items-center justify-center">
              {bgType === 'video' && (localPreviewUrl || bgUrl) ? (
                <video
                  key={localPreviewUrl || bgUrl}
                  src={localPreviewUrl || bgUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className={cn(
                    'w-full h-full',
                    defaultValues.hero_bg_fit === 'contain' ? 'object-contain' : 'object-cover'
                  )}
                  style={{ opacity: opacity / 100 }}
                />
              ) : bgType === 'image' && (localPreviewUrl || bgUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={localPreviewUrl || bgUrl}
                  src={localPreviewUrl || bgUrl}
                  alt="Previsualización de fondo"
                  className={cn(
                    'w-full h-full',
                    defaultValues.hero_bg_fit === 'contain' ? 'object-contain' : 'object-cover'
                  )}
                  style={{ opacity: opacity / 100 }}
                  onError={() => {
                    console.warn('Error al cargar imagen en vista previa');
                  }}
                />
              ) : bgType === 'gradient' ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_100%_80%_at_50%_0%,rgba(245,158,11,0.18),rgba(14,165,233,0.12),rgba(2,6,23,0.98))]">
                  <span className="text-xs font-mono font-bold text-accent tracking-wider mb-1">
                    INVEST OIL LLC
                  </span>
                  <span className="text-sm font-bold text-text text-center max-w-sm">
                    {defaultValues.heading_line_1 || 'Soluciones Estratégicas en el Mercado Global'}
                  </span>
                </div>
              ) : bgType === 'none' ? (
                <div className="w-full h-full flex items-center justify-center p-6 bg-[#020617] text-text-subtle text-xs font-mono">
                  Fondo Obsidian Liso (#020617)
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-text-subtle text-xs space-y-1">
                  <ImageIcon className="w-8 h-8 text-text-subtle/50 mb-1" />
                  <span className="font-semibold text-text-muted">Sin archivo multimedia asignado</span>
                  <span className="text-[11px]">
                    Selecciona un archivo local o escoge uno de los fondos recomendados arriba.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Controles de Opacidad y Ajuste */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

      {/* 4. Personalización de la Tarjeta Hero Señalada & Logotipo */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Personalización de Tarjeta Hero & Logotipo (Filtros, Sombra y Luminosidad)</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Vista Previa Activa
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controles de Personalización */}
          <div className="lg:col-span-7 space-y-4">
            {/* Color de Fondo y Borde de la Tarjeta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Color de Fondo de la Tarjeta</label>
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

            {/* Opacidad del resplandor glow */}
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
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Opacidad / Transparencia de la Tarjeta */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className={LABEL_STYLE}>Opacidad / Transparencia de la Tarjeta</label>
                <span className="text-xs font-mono text-accent font-bold">
                  {cardOpacity}% {cardOpacity === 0 ? '(100% Transparente)' : cardOpacity < 40 ? '(Muy transparente)' : cardOpacity < 90 ? '(Translúcido)' : '(Sólido)'}
                </span>
              </div>
              <input
                type="range"
                name="hero_card_opacity"
                min="0"
                max="100"
                value={cardOpacity}
                onChange={(e) => setCardOpacity(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <p className="text-[10px] text-text-subtle mt-1 font-mono">
                Regula el nivel de transparencia para dejar ver el fondo multimedia del hero a través de la tarjeta.
              </p>
            </div>

            {/* Filtros del Logotipo (Matiz, Luminosidad, Saturación) */}
            <div className="pt-2 border-t border-border/40 space-y-3">
              <div className="text-[11px] font-mono text-accent font-semibold">
                Efectos del Logotipo / Sello Oficial:
              </div>

              {/* Matiz / Hue Rotate */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-text-muted">Color / Matiz (Hue Rotate)</span>
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

              {/* Luminosidad / Brightness */}
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

              {/* Saturación */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-mono text-text-muted">Saturación de Color</span>
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
            </div>

            {/* Imagen Corporativa / Sello Oficial */}
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

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroPickerAccept('image');
                      setHeroPickerTarget('logo');
                      setOpenHeroPicker(true);
                    }}
                    disabled={uploadingLogo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent text-text-muted hover:text-accent text-xs font-semibold transition-all shadow-sm"
                    title="Seleccionar un logotipo o sello existente de la biblioteca"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-accent" />
                    <span>Elegir de Biblioteca...</span>
                  </button>

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
                        <span>Subir Archivo...</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="hero_logo_url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/images/branding/seal-transparent.png o https://..."
                  className={INPUT_STYLE}
                />
              </div>

              {/* Botones de selección rápida de logos corporativos y gestión */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-text-subtle">Plantillas:</span>
                <button
                  type="button"
                  onClick={() => setLogoUrl('/uploads/1790262200243-2026-09-24_at_17.02.08.jpeg')}
                  className={cn(
                    'px-2 py-1 rounded text-[10px] font-mono border transition-all',
                    logoUrl.includes('1790262200243')
                      ? 'bg-accent/20 border-accent text-accent font-semibold'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
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

                {logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveHeroLogo}
                    disabled={uploadingLogo || deletingLogo}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-card border border-border hover:border-accent/50 text-text-muted hover:text-text transition-colors"
                    title="Quitar la imagen o sello de la tarjeta"
                  >
                    ✕ Quitar Sello
                  </button>
                )}

                {logoUrl && logoUrl.startsWith('/uploads/') && (
                  <button
                    type="button"
                    onClick={handleDeleteHeroLogoFile}
                    disabled={uploadingLogo || deletingLogo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-semibold transition-all disabled:opacity-50"
                    title="Eliminar archivo del servidor y la base de datos"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{deletingLogo ? 'Eliminando...' : 'Eliminar Archivo'}</span>
                  </button>
                )}
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
                Textos y Métricas Editables de la Tarjeta:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_STYLE}>Insignia Superior (ES)</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Insignia Superior (EN)</label>
                  <input
                    type="text"
                    value={badgeTextEn}
                    onChange={(e) => setBadgeTextEn(e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
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

            {/* Sombra del Logotipo (Color y Difuminado) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <span className="text-[11px] font-mono text-text-muted block mb-1">Color de Sombra del Logo</span>
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
                  <span className="text-[11px] font-mono text-text-muted">Intensidad / Blur Sombra</span>
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

          {/* Vista previa en vivo del componente */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-black/40 border border-border/80 sticky top-4">
            <span className="text-[10px] font-mono text-text-subtle uppercase tracking-wider mb-3">
              Vista previa interactiva en tiempo real
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
                  backgroundColor: hexOrRgbToRgba(cardBg, cardOpacity),
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
                    src={logoUrl || '/images/branding/corporate-card-logo.jpeg'}
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
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{state.message || 'Hero actualizado correctamente'}</span>
        </div>
      )}

      {/* Barra de Guardado Inferior en Flujo Normal */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {state.success && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{state.message || 'Configuración del Hero guardada con éxito'}</span>
            </span>
          )}
          {state.error && (
            <span className="text-xs text-red-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all duration-200 disabled:opacity-50 shrink-0"
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

      {/* Modal Selector de Biblioteca de Medios para Hero */}
      <MediaPickerModal
        open={openHeroPicker}
        onOpenChange={setOpenHeroPicker}
        onSelect={(item) => {
          if (heroPickerTarget === 'logo') {
            setLogoUrl(item.url);
          } else {
            setLocalPreviewUrl(null);
            setBgUrl(item.url);
            if (heroPickerAccept === 'video' || item.type === 'video') {
              setBgType('video');
              setPreviewMediaType('video');
            } else {
              setBgType('image');
              setPreviewMediaType('image');
            }
          }
        }}
        accept={heroPickerAccept}
        title={
          heroPickerTarget === 'logo'
            ? 'Biblioteca de Medios — Seleccionar Logotipo / Sello Central'
            : heroPickerAccept === 'video'
            ? 'Biblioteca de Medios — Seleccionar Video de Fondo'
            : 'Biblioteca de Medios — Seleccionar Imagen de Fondo'
        }
        initialSearch={heroPickerTarget === 'logo' ? 'logo' : ''}
      />
    </form>
  );
}
