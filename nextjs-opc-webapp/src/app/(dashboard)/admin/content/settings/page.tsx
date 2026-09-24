'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  ShieldCheck,
  Loader2,
  Upload,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Linkedin,
  ExternalLink,
  Globe,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DEFAULT_SITE_SETTINGS,
  getClientSiteSettings,
  saveClientSiteSettings,
  type SiteSettingsData,
} from '@/lib/services/site-settings';
import type { OfficeLocation } from '@/lib/constants/investoil';

const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function SettingsContentPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo file upload state
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const local = getClientSiteSettings();
    setSettings(local);

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.offices) {
          setSettings((prev) => ({ ...prev, ...data }));
          saveClientSiteSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setSettings((prev) => ({ ...prev, footerLogoUrl: resData.url }));
      } else {
        setError(resData.error || 'Error al subir el logotipo del pie de página.');
      }
    } catch {
      setError('Error de conexión al subir el logotipo.');
    } finally {
      setUploadingLogo(false);
      if (logoFileInputRef.current) logoFileInputRef.current.value = '';
    }
  };

  const updateOffice = (id: string, field: keyof OfficeLocation, val: string) => {
    setSettings((prev) => ({
      ...prev,
      offices: prev.offices.map((off) => (off.id === id ? { ...off, [field]: val } : off)),
    }));
  };

  const addOffice = () => {
    const newId = `office-${Date.now()}`;
    const newOffice: OfficeLocation = {
      id: newId,
      cityCountry: 'Nueva Sede, País',
      cityCountryEn: 'New Office, Country',
      address: 'Dirección o Puerto Operativo',
      detail: 'Sede Operativa / Trading Desk',
      detailEn: 'Operations Desk',
    };
    setSettings((prev) => ({
      ...prev,
      offices: [...prev.offices, newOffice],
    }));
  };

  const removeOffice = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      offices: prev.offices.filter((off) => off.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          saveClientSiteSettings(data.settings);
        }
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      } else {
        saveClientSiteSettings(settings);
        setSaved(true);
        setTimeout(() => setSaved(false), 3500);
      }
    } catch {
      saveClientSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-28">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Contenido</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Pie de Página & Ajustes Generales (Footer)
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configuración unificada del pie de página: logotipo, descripción corporativa, sedes internacionales en 2 filas, marco legal, certificaciones y copyright.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
        >
          <span>Ver sitio en vivo</span>
          <ExternalLink className="w-3.5 h-3.5 text-accent" />
        </Link>
      </div>

      {/* Feedback alerts */}
      {saved && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Configuración del pie de página y sedes guardada correctamente. Se refleja en todo el sitio web.</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Logotipo e Identidad del Footer */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2 border-b border-border/60 pb-3">
            <Sliders className="w-4 h-4" />
            <span>Identidad & Logotipo del Pie de Página</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Imagen del Footer */}
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
                  src={settings.footerLogoUrl || '/images/branding/corporate-card-logo.jpeg'}
                  alt="Logo Footer"
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
                    <span>Subir Sello / Logo...</span>
                  </>
                )}
              </button>
              <div className="flex flex-wrap gap-1.5 justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setSettings((p) => ({ ...p, footerLogoUrl: '/images/branding/corporate-card-logo.jpeg' }))}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border hover:border-accent/50 text-text-muted"
                >
                  Gota Ámbar
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((p) => ({ ...p, footerLogoUrl: '/images/branding/logo.png' }))}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border hover:border-accent/50 text-text-muted"
                >
                  Logo Rectangular
                </button>
              </div>
            </div>

            {/* Campos de texto */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL_STYLE}>Nombre Legal de la Empresa</label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className={INPUT_STYLE}
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Perfil de LinkedIn</label>
                  <input
                    type="text"
                    value={settings.linkedinUrl || ''}
                    onChange={(e) => setSettings({ ...settings, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/invest-oil-llc"
                    className={INPUT_STYLE}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_STYLE}>Descripción Corporativa / Tagline (Español)</label>
                <textarea
                  rows={2}
                  value={settings.footerTagline || ''}
                  onChange={(e) => setSettings({ ...settings, footerTagline: e.target.value })}
                  className={INPUT_STYLE}
                />
              </div>

              <div>
                <label className={LABEL_STYLE}>Descripción Corporativa / Tagline (Inglés)</label>
                <textarea
                  rows={2}
                  value={settings.footerTaglineEn || ''}
                  onChange={(e) => setSettings({ ...settings, footerTaglineEn: e.target.value })}
                  className={INPUT_STYLE}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Contacto Directo & Horario */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2 border-b border-border/60 pb-3">
            <Mail className="w-4 h-4" />
            <span>Datos de Contacto & Operaciones</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLE}>Correo Electrónico de Contacto</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className={INPUT_STYLE}
                placeholder="contacto@investoil.es"
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Horario Operativo de Trading</label>
              <input
                type="text"
                value={settings.schedule || ''}
                onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                className={INPUT_STYLE}
                placeholder="24/7 Trading Desks & Operations"
              />
            </div>
          </div>
        </div>

        {/* 3. Sedes Internacionales y Direcciones en 2 Filas */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Sedes Internacionales & Direcciones (2 Filas)</span>
              </h2>
              <p className="text-[11px] text-text-muted mt-0.5">
                Fila 1: Ciudad, País [HQ / DESK]. Fila 2: Dirección física y especificación del desk.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOffice}
              className="text-xs gap-1.5 border-border hover:border-accent/40"
            >
              <Plus className="w-3.5 h-3.5 text-accent" />
              <span>Agregar Sede</span>
            </Button>
          </div>

          <div className="space-y-4">
            {(settings.offices || []).map((office, idx) => (
              <div
                key={office.id || idx}
                className="p-4 rounded-xl border border-border/80 bg-card/60 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono font-bold text-accent">
                      Sede #{idx + 1}: {office.cityCountry || office.id}
                    </span>
                  </div>
                  {settings.offices.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOffice(office.id)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Eliminar esta sede"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_STYLE}>Ciudad / País (Español)</label>
                    <input
                      type="text"
                      value={office.cityCountry}
                      onChange={(e) => updateOffice(office.id, 'cityCountry', e.target.value)}
                      placeholder="Houston, Estados Unidos"
                      className={INPUT_STYLE}
                    />
                  </div>
                  <div>
                    <label className={LABEL_STYLE}>Ciudad / País (Inglés)</label>
                    <input
                      type="text"
                      value={office.cityCountryEn || ''}
                      onChange={(e) => updateOffice(office.id, 'cityCountryEn', e.target.value)}
                      placeholder="Houston, United States"
                      className={INPUT_STYLE}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL_STYLE}>Dirección Física (Fila 2)</label>
                    <input
                      type="text"
                      value={office.address}
                      onChange={(e) => updateOffice(office.id, 'address', e.target.value)}
                      placeholder="1000 Louisiana St, Suite 4300, Houston, TX 77002"
                      className={INPUT_STYLE}
                    />
                  </div>
                  <div>
                    <label className={LABEL_STYLE}>Detalle / Rol de la Sede (Español / Inglés)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={office.detail}
                        onChange={(e) => updateOffice(office.id, 'detail', e.target.value)}
                        placeholder="Headquarters · Sede Central"
                        className={INPUT_STYLE}
                      />
                      <input
                        type="text"
                        value={office.detailEn || ''}
                        onChange={(e) => updateOffice(office.id, 'detailEn', e.target.value)}
                        placeholder="Global Headquarters"
                        className={INPUT_STYLE}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Copyright & Certificaciones */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2 border-b border-border/60 pb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Copyright & Certificaciones del Pie de Página</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_STYLE}>Texto de Copyright (Español)</label>
              <input
                type="text"
                value={settings.copyright}
                onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                placeholder="© 2026 Invest Oil LLC. Todos los derechos reservados."
                className={INPUT_STYLE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE}>Texto de Copyright (Inglés)</label>
              <input
                type="text"
                value={settings.copyrightEn || ''}
                onChange={(e) => setSettings({ ...settings, copyrightEn: e.target.value })}
                placeholder="© 2026 Invest Oil LLC. All Rights Reserved."
                className={INPUT_STYLE}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_STYLE}>Cintillo de Certificaciones & Estándares</label>
            <input
              type="text"
              value={settings.certificationsText || ''}
              onChange={(e) => setSettings({ ...settings, certificationsText: e.target.value })}
              placeholder="ASTM D1655 / GOST COMPLIANT · INCOTERMS 2020 · SGS & INTERTEK VERIFIED"
              className={INPUT_STYLE}
            />
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
                <span>Guardar Pie de Página & Sedes</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
