'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, Upload, Loader2, Sparkles, AlertCircle, Share2, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function SeoEditorPage() {
  const [formData, setFormData] = useState({
    meta_title: 'Invest Oil LLC — Soluciones Globales en Comercio y Logística de Petróleo',
    meta_description: 'Conexiones estratégicas en el mercado petrolero global. Comercialización de crudo, Jet Fuel A1, EN590, almacenamiento y financiamiento estructurado.',
    keywords: 'trading de petroleo, brent, wti, jet fuel a1, diesel en590, fletamento maritimo, houston oil, pet coke',
    og_image: '/images/branding/corporate-card-logo.jpeg',
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/content/seo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFormData((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const resData = await res.json();
      if (!res.ok || resData.error) {
        throw new Error(resData.error || 'Error al subir imagen social');
      }

      setFormData((prev) => ({ ...prev, og_image: resData.url }));
      setStatusMessage(`✓ Imagen "${file.name}" cargada para Open Graph.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al subir imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/content/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error al guardar datos de SEO');

      setStatusMessage('✓ Metadatos SEO y tarjeta social Open Graph actualizados correctamente.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar metadatos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            SEO, Open Graph y Metadatos
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configura los metadatos de posicionamiento en motores de búsqueda, título, descripción y tarjeta social que se comparte en WhatsApp, LinkedIn y Twitter.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div>
            <label className={LABEL}>Título Meta (Title Tag)</label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              className={INPUT}
              required
            />
          </div>

          <div>
            <label className={LABEL}>Meta Descripción</label>
            <textarea
              rows={2}
              value={formData.meta_description}
              onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
              className={INPUT}
              required
            />
          </div>

          <div>
            <label className={LABEL}>Palabras Clave (Keywords separadas por coma)</label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className={INPUT}
            />
          </div>
        </div>

        {/* Sección de Imagen Open Graph y Previsualización */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            <span>Tarjeta Social Open Graph (Vista Previa en Redes Sociales)</span>
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-3">
              <label className={LABEL}>URL o Archivo de Imagen Open Graph (Recomendado 1200x630)</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={formData.og_image}
                  onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                  className={INPUT}
                  placeholder="/images/branding/corporate-card-logo.jpeg"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-accent text-bg hover:bg-accent-400 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{uploading ? 'Subiendo...' : 'Subir Imagen...'}</span>
                </button>
              </div>

              {/* Accesos rápidos a imágenes de marca */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-mono text-text-subtle">Fondos disponibles:</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, og_image: '/images/branding/corporate-card-logo.jpeg' })}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                    formData.og_image === '/images/branding/corporate-card-logo.jpeg'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-semibold'
                      : 'bg-card border-border hover:border-amber-500/50 text-text-muted hover:text-text'
                  )}
                >
                  Sello Ámbar Corporativo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, og_image: '/images/branding/seal-transparent.png' })}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                    formData.og_image === '/images/branding/seal-transparent.png'
                      ? 'bg-accent/20 border-accent text-accent font-semibold'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  Sello Oficial
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, og_image: '/images/branding/logo.png' })}
                  className={cn(
                    'px-2.5 py-1 rounded text-[10px] font-mono border transition-all',
                    formData.og_image === '/images/branding/logo.png'
                      ? 'bg-accent/20 border-accent text-accent font-semibold'
                      : 'bg-card border-border hover:border-accent/50 text-text-muted hover:text-text'
                  )}
                >
                  Logotipo Horizontal
                </button>
              </div>
            </div>

            {/* Simulación en Vivo de Tarjeta Social (Twitter / WhatsApp / LinkedIn) */}
            <div className="lg:col-span-5 flex flex-col p-4 rounded-xl border border-border bg-black/50">
              <span className="text-[10px] font-mono text-text-subtle uppercase mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3 text-accent" />
                <span>Simulación de enlace compartido en redes</span>
              </span>

              <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-lg">
                <div className="w-full h-32 bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={formData.og_image || '/images/branding/corporate-card-logo.jpeg'}
                    alt="Previsualización Open Graph"
                    className="w-full h-full object-contain filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3 space-y-1">
                  <span className="text-[10px] font-mono text-text-subtle uppercase tracking-wider block">
                    investoil.es
                  </span>
                  <p className="text-xs font-bold text-text truncate">
                    {formData.meta_title}
                  </p>
                  <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                    {formData.meta_description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar Metadatos SEO'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
