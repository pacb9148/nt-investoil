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

const METRICS = [1, 2, 3, 4] as const;

export default function EstadisticasPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [langTab, setLangTab] = useState<EditLang>('es');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/content/estadisticas')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === 'object') setValues(data);
      })
      .catch(() => {});
  }, []);

  const set = (key: string, val: string) => setValues((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch('/api/content/estadisticas', {
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

  const defaults = translations[langTab].stats;
  const labelKey = (n: number) => (langTab === 'en' ? `stat${n}_label_en` : `stat${n}_label`);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        error={error}
        saveLabel="Guardar Estadísticas"
      />

      <div className="pb-4 border-b border-border">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">Estadísticas y Números de Impacto</h1>
        <p className="mt-1 text-xs text-text-muted">
          Franja de 4 cifras bajo la marquesina de la landing. Lo que dejes vacío muestra el texto original (aparece
          como sugerencia gris). Se puede ocultar con el interruptor de «Estadísticas de Impacto» en el resumen de módulos.
        </p>
      </div>

      <SectionDesignBar sectionId="estadisticas" sectionName="Estadísticas de Impacto" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {METRICS.map((n) => (
          <div key={n} className="p-4 rounded-xl border border-border bg-surf/50 space-y-3">
            <span className="text-[11px] font-mono text-accent font-semibold">MÉTRICA {n}</span>
            <div>
              <label className={LABEL}>Valor Numérico</label>
              <input
                value={values[`stat${n}_value`] || ''}
                onChange={(e) => set(`stat${n}_value`, e.target.value)}
                placeholder={defaults[`metric${n}Value`]}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Descripción ({langTab === 'en' ? 'English' : 'Español'})</label>
              <input
                value={values[labelKey(n)] || ''}
                onChange={(e) => set(labelKey(n), e.target.value)}
                placeholder={defaults[`metric${n}Label`]}
                className={INPUT}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
