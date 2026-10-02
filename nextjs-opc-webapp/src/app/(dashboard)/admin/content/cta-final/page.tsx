'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';
import { translations } from '@/lib/i18n/translations';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

export default function CtaFinalPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [langTab, setLangTab] = useState<EditLang>('es');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/cta-final')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') setValues(data);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/content/cta-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
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

  const sfx = langTab === 'en' ? '_en' : '';
  const dict = translations[langTab].cta;
  const field = (key: string, label: string, placeholder: string, long = false) => (
    <div>
      <label className={LABEL}>{label}</label>
      {long ? (
        <textarea
          rows={2}
          value={values[key + sfx] || ''}
          onChange={(e) => setValues((p) => ({ ...p, [key + sfx]: e.target.value }))}
          placeholder={placeholder}
          className={INPUT}
        />
      ) : (
        <input
          value={values[key + sfx] || ''}
          onChange={(e) => setValues((p) => ({ ...p, [key + sfx]: e.target.value }))}
          placeholder={placeholder}
          className={INPUT}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        error={error}
        saveLabel="Guardar CTA Final"
      />

      <div className="pb-4 border-b border-border">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">CTA Final de Cierre</h1>
        <p className="mt-1 text-xs text-text-muted">
          Bloque de cierre comercial antes del formulario de contacto: etiqueta, titular, mensaje, botón y línea de
          garantías. Lo vacío muestra el texto original (sugerencia gris).
        </p>
      </div>

      <SectionDesignBar sectionId="cta_final" sectionName="CTA Final de Cierre" />

      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        {field('kicker', 'Etiqueta Superior (Kicker)', dict.tag)}
        {field('heading', 'Titular Principal', dict.title)}
        {field('subheading', 'Subtítulo / Mensaje de Cooperación', dict.subtitle, true)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('button_text', 'Texto del Botón Principal', dict.button)}
          <div>
            <label className={LABEL}>Destino del Botón (ancla, ruta o URL) — igual en ambos idiomas</label>
            <input
              value={values.button_url || ''}
              onChange={(e) => setValues((p) => ({ ...p, button_url: e.target.value }))}
              placeholder="#contact"
              className={INPUT}
            />
          </div>
        </div>
        {field('guarantee_line', 'Línea de Garantías y Certificación', dict.guarantee)}
      </div>
    </div>
  );
}
