'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Globe,
  Sliders,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface HeaderMenuItem {
  id: string;
  href: string;
  label: string;
  label_en: string;
  is_active?: boolean;
}

export interface HeaderData {
  logo_url: string;
  logo_text: string;
  logo_tagline: string;
  menu_items: HeaderMenuItem[];
  action_button: {
    text: string;
    text_en: string;
    url: string;
    is_visible: boolean;
  };
  backoffice_button: {
    text: string;
    text_en: string;
    is_visible: boolean;
  };
}

const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export function HeaderForm({ initialData }: { initialData: HeaderData }) {
  const [data, setData] = useState<HeaderData>(initialData);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo file upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPEG, WebP, SVG).');
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (res.ok && resData.url) {
        setData((prev) => ({ ...prev, logo_url: resData.url }));
      } else {
        setError(resData.error || 'Error al subir la imagen del logotipo.');
      }
    } catch {
      setError('Error de conexión al subir la imagen del logotipo.');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const handleAddMenuItem = () => {
    const newId = `m-${Date.now()}`;
    const newItem: HeaderMenuItem = {
      id: newId,
      href: '/#nueva-seccion',
      label: 'Nuevo Enlace',
      label_en: 'New Link',
      is_active: true,
    };
    setData((prev) => ({
      ...prev,
      menu_items: [...prev.menu_items, newItem],
    }));
  };

  const handleRemoveMenuItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      menu_items: prev.menu_items.filter((item) => item.id !== id),
    }));
  };

  const handleUpdateMenuItem = (id: string, field: keyof HeaderMenuItem, value: string | boolean) => {
    setData((prev) => ({
      ...prev,
      menu_items: prev.menu_items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/content/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        const errJson = await res.json();
        setError(errJson.error || 'Error al guardar los cambios de la cabecera');
      }
    } catch {
      setError('Error de comunicación con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24">
      {/* Mensajes de feedback */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración de cabecera y menú guardada exitosamente. Se refleja de inmediato en toda la plataforma.</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Vista Previa en Vivo de la Cabecera */}
      <div className="rounded-xl border border-border bg-surf/80 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Vista Previa Interactiva de la Cabecera</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            En vivo
          </span>
        </div>

        {/* Mockup del Header */}
        <div className="rounded-xl border border-border/80 bg-bg/95 p-3.5 backdrop-blur-md shadow-lg flex items-center justify-between gap-4 overflow-x-auto">
          {/* Logo y Marca */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src={data.logo_url || '/images/branding/logo.png'}
              alt="Logo Header"
              className="w-10 h-10 object-contain rounded drop-shadow"
            />
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm tracking-tight text-text">
                {data.logo_text || 'INVEST OIL'}
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-text-muted -mt-0.5">
                {data.logo_tagline || 'Trading Company'}
              </span>
            </div>
          </div>

          {/* Menú de Enlaces */}
          <nav className="hidden lg:flex items-center gap-5">
            {data.menu_items
              .filter((item) => item.is_active !== false)
              .map((item) => (
                <span
                  key={item.id}
                  className="text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-text cursor-pointer py-1"
                >
                  {item.label}
                </span>
              ))}
          </nav>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2.5 shrink-0">
            {data.backoffice_button.is_visible && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/70 text-[11px] font-medium text-text-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>{data.backoffice_button.text}</span>
              </span>
            )}
            {data.action_button.is_visible && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-bg text-[11px] font-bold shadow-glow-accent">
                <span>{data.action_button.text}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Logotipo e Identidad de la Cabecera */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2 border-b border-border/60 pb-3">
          <Sliders className="w-4 h-4" />
          <span>Logotipo e Identidad de Marca</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Subida y Previsualización de Logo */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card/60 text-center space-y-3">
            <input
              type="file"
              ref={logoFileInputRef}
              onChange={handleLogoFileSelect}
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
            />
            <div className="w-20 h-20 rounded-xl border border-border/80 bg-black/40 flex items-center justify-center p-2 overflow-hidden shadow-inner">
              <img
                src={data.logo_url || '/images/branding/logo.png'}
                alt="Logo Actual"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
            >
              {uploadingLogo ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Nuevo Logo...</span>
                </>
              )}
            </button>
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
              <button
                type="button"
                onClick={() => setData((p) => ({ ...p, logo_url: '/images/branding/logo.png' }))}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border hover:border-accent/50 text-text-muted"
              >
                Logo Estándar
              </button>
              <button
                type="button"
                onClick={() => setData((p) => ({ ...p, logo_url: '/images/branding/corporate-card-logo.jpeg' }))}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border hover:border-accent/50 text-text-muted"
              >
                Gota Ámbar
              </button>
            </div>
          </div>

          {/* Textos de Marca */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <label className={LABEL_STYLE}>URL / Ruta del Logotipo</label>
              <input
                type="text"
                value={data.logo_url}
                onChange={(e) => setData({ ...data, logo_url: e.target.value })}
                className={INPUT_STYLE}
                placeholder="/images/branding/logo.png o /uploads/..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_STYLE}>Nombre de la Empresa (Logo)</label>
                <input
                  type="text"
                  value={data.logo_text}
                  onChange={(e) => setData({ ...data, logo_text: e.target.value })}
                  className={INPUT_STYLE}
                  placeholder="INVEST OIL"
                />
              </div>
              <div>
                <label className={LABEL_STYLE}>Eslogan / Tagline Bajo el Logo</label>
                <input
                  type="text"
                  value={data.logo_tagline}
                  onChange={(e) => setData({ ...data, logo_tagline: e.target.value })}
                  className={INPUT_STYLE}
                  placeholder="Trading Company"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Menú de Navegación Principal */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Menu className="w-4 h-4" />
            <span>Enlaces del Menú Principal</span>
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMenuItem}
            className="text-xs gap-1.5 border-border hover:border-accent/40"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>Agregar Enlace</span>
          </Button>
        </div>

        <div className="space-y-3">
          {data.menu_items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-accent">
                  #{idx + 1} {item.label}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.is_active !== false}
                      onChange={(e) => handleUpdateMenuItem(item.id, 'is_active', e.target.checked)}
                      className="rounded border-border text-accent focus:ring-accent"
                    />
                    <span>Visible</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveMenuItem(item.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Eliminar este enlace"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_STYLE}>Etiqueta (Español)</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateMenuItem(item.id, 'label', e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Etiqueta (Inglés)</label>
                  <input
                    type="text"
                    value={item.label_en}
                    onChange={(e) => handleUpdateMenuItem(item.id, 'label_en', e.target.value)}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>URL de Destino (href)</label>
                  <input
                    type="text"
                    value={item.href}
                    onChange={(e) => handleUpdateMenuItem(item.id, 'href', e.target.value)}
                    className={INPUT_STYLE}
                    placeholder="/#servicios o /about"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Botones de Acción de la Cabecera */}
      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2 border-b border-border/60 pb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Botones de Acción en Cabecera</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Botón CTA Contacto */}
          <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text font-mono uppercase">
                Botón Principal (CTA)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.action_button.is_visible}
                  onChange={(e) =>
                    setData({
                      ...data,
                      action_button: { ...data.action_button, is_visible: e.target.checked },
                    })
                  }
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>Mostrar</span>
              </label>
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto (Español)</label>
              <input
                type="text"
                value={data.action_button.text}
                onChange={(e) =>
                  setData({
                    ...data,
                    action_button: { ...data.action_button, text: e.target.value },
                  })
                }
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto (Inglés)</label>
              <input
                type="text"
                value={data.action_button.text_en}
                onChange={(e) =>
                  setData({
                    ...data,
                    action_button: { ...data.action_button, text_en: e.target.value },
                  })
                }
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>URL de Destino</label>
              <input
                type="text"
                value={data.action_button.url}
                onChange={(e) =>
                  setData({
                    ...data,
                    action_button: { ...data.action_button, url: e.target.value },
                  })
                }
                className={INPUT_STYLE}
              />
            </div>
          </div>

          {/* Botón Acceso Backoffice */}
          <div className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text font-mono uppercase">
                Botón Acceso Backoffice (Login)
              </span>
              <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.backoffice_button.is_visible}
                  onChange={(e) =>
                    setData({
                      ...data,
                      backoffice_button: { ...data.backoffice_button, is_visible: e.target.checked },
                    })
                  }
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span>Mostrar</span>
              </label>
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto (Español)</label>
              <input
                type="text"
                value={data.backoffice_button.text}
                onChange={(e) =>
                  setData({
                    ...data,
                    backoffice_button: { ...data.backoffice_button, text: e.target.value },
                  })
                }
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto (Inglés)</label>
              <input
                type="text"
                value={data.backoffice_button.text_en}
                onChange={(e) =>
                  setData({
                    ...data,
                    backoffice_button: { ...data.backoffice_button, text_en: e.target.value },
                  })
                }
                className={INPUT_STYLE}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-6 right-8 z-30 flex items-center gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="gap-2 bg-accent text-bg hover:bg-accent-hover font-bold shadow-lg shadow-amber-500/20 px-6 py-2.5"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cabecera & Menú</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
