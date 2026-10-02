'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Inbox } from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';
import { CONTACT_HEADER_PATHS, defaultText, type TextOverrides } from '@/lib/i18n/text-overrides';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

const FIELDS: Array<{ path: string; label: string; long?: boolean }> = [
  { path: 'contact.tag', label: 'Etiqueta Superior' },
  { path: 'contact.title', label: 'Titular del Formulario' },
  { path: 'contact.subtitle', label: 'Subtítulo del Formulario', long: true },
];

export default function ContactContentPage() {
  const [langTab, setLangTab] = useState<EditLang>('es');
  const [overrides, setOverrides] = useState<TextOverrides>({ es: {}, en: {} });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/texts')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: TextOverrides | null) => {
        if (data) setOverrides({ es: data.es || {}, en: data.en || {} });
      })
      .catch(() => {});
  }, []);

  const setValue = (path: string, val: string) =>
    setOverrides((prev) => ({ ...prev, [langTab]: { ...(prev[langTab] || {}), [path]: val } }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    const payload: TextOverrides = { es: {}, en: {} };
    for (const lang of ['es', 'en'] as const) {
      for (const path of CONTACT_HEADER_PATHS) payload[lang]![path] = overrides[lang]?.[path] || '';
    }
    try {
      const res = await fetch('/api/content/texts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo guardar. El cambio no se aplicó.');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const current = overrides[langTab] || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        error={error}
        saveLabel="Guardar Contacto"
      />

      <div className="pb-4 border-b border-border">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">Formulario de Contacto & Leads</h1>
        <p className="mt-1 text-xs text-text-muted">
          Textos de cabecera del formulario de la landing. Lo vacío muestra el texto original (sugerencia gris). El
          correo mostrado en la tarjeta de contacto se cambia en «Pie de Página & Ajustes».
        </p>
      </div>

      <SectionDesignBar sectionId="contact" sectionName="Contacto & Formulario" />

      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.path}>
            <label className={LABEL}>{f.label}</label>
            {f.long ? (
              <textarea
                rows={2}
                value={current[f.path] || ''}
                onChange={(e) => setValue(f.path, e.target.value)}
                placeholder={defaultText(langTab, f.path)}
                className={INPUT}
              />
            ) : (
              <input
                value={current[f.path] || ''}
                onChange={(e) => setValue(f.path, e.target.value)}
                placeholder={defaultText(langTab, f.path)}
                className={INPUT}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 flex items-start gap-3 text-xs text-text-muted">
        <Inbox className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Los mensajes enviados por el formulario se guardan en{' '}
          <Link href="/admin/leads" className="text-accent underline">
            Mensajes de Contacto
          </Link>
          . El aviso por correo de cada nuevo mensaje no está disponible: requiere conectar un servicio de envío de correo.
        </p>
      </div>
    </div>
  );
}
