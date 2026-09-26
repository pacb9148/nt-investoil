'use client';

import React, { useState, useRef } from 'react';
import {
  Loader2,
  Save,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Image as ImageIcon,
  Building2,
  Globe,
  ShieldCheck,
  Target,
  FolderOpen,
  Film,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export function AboutForm({ initialData }: { initialData: any }) {
  const [data, setData] = useState(initialData);
  const [langTab, setLangTab] = useState<'es' | 'en'>('es');
  const [uploading, setUploading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [openMediaPicker, setOpenMediaPicker] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || 'Error al subir imagen');
      }

      setData((prev: any) => ({ ...prev, featured_image: resData.url }));
      setStatusMessage(`✓ Imagen "${file.name}" cargada correctamente.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/content/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al guardar datos de la página Nosotros');

      setStatusMessage('✓ Contenido de la página Nosotros actualizado correctamente.');
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Selector de Idioma */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-surf/80">
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

      {/* Bloque 1: Identidad Visual & Imagen/Video Destacado de Nosotros */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          <span>01.</span> Logotipo, Imagen o Video de la Página Nosotros
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <label className={LABEL_STYLE}>Archivo o URL del Elemento Multimedia Central</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={data.featured_image || ''}
                onChange={(e) => setData({ ...data, featured_image: e.target.value })}
                className={cn(INPUT_STYLE, 'flex-1 min-w-[200px]')}
                placeholder="/images/branding/oil-drop-logo.png"
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setOpenMediaPicker(true)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-card border border-border hover:border-accent text-text hover:text-accent text-xs font-semibold transition-all shadow-sm"
                title="Elegir o reutilizar un archivo de la biblioteca de medios"
              >
                <FolderOpen className="w-3.5 h-3.5 text-accent" />
                <span>Biblioteca de Medios...</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent text-bg hover:bg-accent-400 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                <span>{uploading ? 'Subiendo...' : 'Subir Archivo...'}</span>
              </button>
            </div>

            {/* Accesos rápidos a imágenes corporativas oficiales */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-mono text-text-subtle">Fondos y recursos oficiales:</span>
              <button
                type="button"
                onClick={() => setData({ ...data, featured_image: '/images/branding/oil-drop-logo.png' })}
                className={cn(
                  'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                  data.featured_image === '/images/branding/oil-drop-logo.png'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                    : 'bg-card border-border hover:border-amber-500/50 text-text-muted hover:text-text'
                )}
              >
                Gota de Petróleo (Oficial)
              </button>
              {data.featured_image && (
                <button
                  type="button"
                  onClick={() => setData({ ...data, featured_image: '' })}
                  className="px-2.5 py-1 rounded text-[10px] font-mono border border-border bg-card text-rose-400 hover:text-rose-300 hover:border-rose-500/50 transition-colors"
                >
                  ✕ Quitar Imagen (Limpio)
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-black/40">
            <span className="text-[10px] font-mono text-text-subtle uppercase mb-2">Vista previa actual</span>
            <div className="w-48 h-48 rounded-xl border border-amber-500/30 bg-card p-2 flex items-center justify-center shadow-lg overflow-hidden relative">
              {data.featured_image && data.featured_image.match(/\.(mp4|webm|mov)$/i) ? (
                <video
                  src={data.featured_image}
                  controls
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : data.featured_image ? (
                <img
                  src={data.featured_image}
                  alt="Vista previa Nosotros"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-center text-xs text-text-subtle font-mono p-4 italic">
                  (Sin elemento multimedia asignado)
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de selección desde la Biblioteca de Medios */}
        <MediaPickerModal
          open={openMediaPicker}
          onOpenChange={setOpenMediaPicker}
          onSelect={(item) => {
            setData((prev: any) => ({ ...prev, featured_image: item.url }));
            setStatusMessage(`✓ Elemento multimedia "${item.filename}" seleccionado de la biblioteca.`);
            setTimeout(() => setStatusMessage(null), 4000);
          }}
          accept="all"
          title="Biblioteca de Medios — Seleccionar Imagen o Video para Nosotros"
        />
      </div>

      {/* Bloque 2: Titular, Eslogan y Misión */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>02.</span> Titular, Eslogan y Propuesta Institucional ({langTab.toUpperCase()})
        </h3>

        {langTab === 'es' ? (
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Insignia Superior / Badge</label>
              <input
                type="text"
                value={data.badge_text || ''}
                onChange={(e) => setData({ ...data, badge_text: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Título Principal de la Página Nosotros</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Eslogan / Primer Párrafo</label>
              <textarea
                rows={3}
                value={data.slogan || ''}
                onChange={(e) => setData({ ...data, slogan: e.target.value })}
                className={cn(INPUT_STYLE, 'resize-y')}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Misión y Compromiso Normativo</label>
              <textarea
                rows={3}
                value={data.mission || ''}
                onChange={(e) => setData({ ...data, mission: e.target.value })}
                className={cn(INPUT_STYLE, 'resize-y')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Texto del Botón CTA</label>
                <input
                  type="text"
                  value={data.cta_text || ''}
                  onChange={(e) => setData({ ...data, cta_text: e.target.value })}
                  className={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Destino del Botón (URL)</label>
                <input
                  type="text"
                  value={data.cta_url || ''}
                  onChange={(e) => setData({ ...data, cta_url: e.target.value })}
                  className={INPUT_STYLE}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className={LABEL_STYLE}>Badge (English)</label>
              <input
                type="text"
                value={data.badge_text_en || ''}
                onChange={(e) => setData({ ...data, badge_text_en: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Main Title (English)</label>
              <input
                type="text"
                value={data.title_en || ''}
                onChange={(e) => setData({ ...data, title_en: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Slogan / First Paragraph (English)</label>
              <textarea
                rows={3}
                value={data.slogan_en || ''}
                onChange={(e) => setData({ ...data, slogan_en: e.target.value })}
                className={cn(INPUT_STYLE, 'resize-y')}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Mission & Compliance (English)</label>
              <textarea
                rows={3}
                value={data.mission_en || ''}
                onChange={(e) => setData({ ...data, mission_en: e.target.value })}
                className={cn(INPUT_STYLE, 'resize-y')}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>CTA Button Text (English)</label>
              <input
                type="text"
                value={data.cta_text_en || ''}
                onChange={(e) => setData({ ...data, cta_text_en: e.target.value })}
                className={INPUT_STYLE}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bloque 3: Pilares y Valores */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>03.</span> Pilares y Valores Fundamentales
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.pillars?.map((pillar: any, idx: number) => (
            <div key={pillar.id || idx} className="p-4 rounded-xl border border-border bg-card/60 space-y-3">
              <span className="text-[10px] font-mono text-accent font-bold">Pilar #{idx + 1}</span>
              <div>
                <label className={LABEL_STYLE}>Título ({langTab.toUpperCase()})</label>
                <input
                  type="text"
                  value={langTab === 'es' ? pillar.title : (pillar.title_en || '')}
                  onChange={(e) => {
                    const newPillars = [...data.pillars];
                    if (langTab === 'es') newPillars[idx].title = e.target.value;
                    else newPillars[idx].title_en = e.target.value;
                    setData({ ...data, pillars: newPillars });
                  }}
                  className={INPUT_STYLE}
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Descripción ({langTab.toUpperCase()})</label>
                <textarea
                  rows={3}
                  value={langTab === 'es' ? pillar.desc : (pillar.desc_en || '')}
                  onChange={(e) => {
                    const newPillars = [...data.pillars];
                    if (langTab === 'es') newPillars[idx].desc = e.target.value;
                    else newPillars[idx].desc_en = e.target.value;
                    setData({ ...data, pillars: newPillars });
                  }}
                  className={cn(INPUT_STYLE, 'resize-y')}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notificaciones de Estado */}
      {statusMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Botón de Guardar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all duration-200 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'Guardando...' : 'Guardar Configuración de Nosotros'}</span>
        </button>
      </div>
    </form>
  );
}
