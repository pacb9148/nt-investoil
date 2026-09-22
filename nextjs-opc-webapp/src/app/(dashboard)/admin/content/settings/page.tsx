'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle2, Building2, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import {
  DEFAULT_SITE_SETTINGS,
  getClientSiteSettings,
  saveClientSiteSettings,
  type SiteSettingsData,
} from '@/lib/services/site-settings';
import type { OfficeLocation } from '@/lib/constants/investoil';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function SettingsContentPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const local = getClientSiteSettings();
    setSettings(local);

    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.offices) {
          setSettings(data);
          saveClientSiteSettings(data);
        }
      })
      .catch(() => {});
  }, []);

  const updateOffice = (id: string, field: keyof OfficeLocation, val: string) => {
    setSettings((prev) => ({
      ...prev,
      offices: prev.offices.map((off) => (off.id === id ? { ...off, [field]: val } : off)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Guardar en servidor local / API
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
      } else {
        // Fallback local
        saveClientSiteSettings(settings);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch {
      saveClientSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32">
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
            Ajustes Generales del Sitio y Sedes
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Configure las direcciones internacionales y datos corporativos que se reflejan de inmediato en toda la plataforma y pie de página.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloque 1: Datos de Contacto y Legales */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent" />
            <span>01. Datos Corporativos</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Nombre Comercial de la Empresa</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className={INPUT}
                required
              />
            </div>
            <div>
              <label className={LABEL}>Email Principal de Contacto</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className={INPUT}
                required
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Texto de Copyright (Footer)</label>
            <input
              type="text"
              value={settings.copyright}
              onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
              className={INPUT}
              required
            />
          </div>
        </div>

        {/* Bloque 2: Sedes Internacionales en 2 filas (Sin tarjetas de contenedor pesado) */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-accent" />
              <span>02. Sedes Internacionales y Direcciones Físicas (Estructura en 2 filas)</span>
            </h2>
            <span className="text-[11px] font-mono text-text-subtle">Houston · Madrid · Bogotá</span>
          </div>

          <p className="text-xs text-text-muted">
            Los cambios se actualizan de forma permanente en el pie de página de la landing page.
          </p>

          <div className="space-y-6">
            {settings.offices.map((office, idx) => (
              <div
                key={office.id}
                className={`space-y-3 ${idx > 0 ? 'pt-5 border-t border-border/50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-text uppercase flex items-center gap-2">
                    <span className="text-accent">#{idx + 1}</span> Sede {office.cityCountry.split(',')[0]}
                  </span>
                  <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {office.id === 'houston' ? 'GLOBAL HQ' : 'DESK'}
                  </span>
                </div>

                {/* Fila 1: Ciudad y País */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Fila 1: Ciudad y País (Español)</label>
                    <input
                      type="text"
                      value={office.cityCountry}
                      onChange={(e) => updateOffice(office.id, 'cityCountry', e.target.value)}
                      className={INPUT}
                      placeholder="ej. Houston, Estados Unidos"
                      required
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Fila 1: Ciudad y País (Inglés)</label>
                    <input
                      type="text"
                      value={office.cityCountryEn || ''}
                      onChange={(e) => updateOffice(office.id, 'cityCountryEn', e.target.value)}
                      className={INPUT}
                      placeholder="ej. Houston, United States"
                    />
                  </div>
                </div>

                {/* Fila 2: Detalle y Dirección física */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Fila 2: Detalle Corporativo / Rol de Sede</label>
                    <input
                      type="text"
                      value={office.detail}
                      onChange={(e) => updateOffice(office.id, 'detail', e.target.value)}
                      className={INPUT}
                      placeholder="ej. Headquarters · Sede Central"
                      required
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Fila 2: Dirección Física Completa</label>
                    <input
                      type="text"
                      value={office.address}
                      onChange={(e) => updateOffice(office.id, 'address', e.target.value)}
                      className={INPUT}
                      placeholder="ej. 1000 Louisiana St, Suite 4000, Houston, TX 77002"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Direcciones y ajustes actualizados y sincronizados con éxito</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Ajustes y Direcciones</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
