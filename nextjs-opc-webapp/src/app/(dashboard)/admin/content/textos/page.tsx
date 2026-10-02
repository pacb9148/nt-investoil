'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';
import { TEXT_CATALOG, defaultText, type TextOverrides } from '@/lib/i18n/text-overrides';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TextosPage() {
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

  const groups = Array.from(new Set(TEXT_CATALOG.map((t) => t.group)));
  const current = overrides[langTab] || {};

  const setValue = (path: string, val: string) =>
    setOverrides((prev) => ({ ...prev, [langTab]: { ...(prev[langTab] || {}), [path]: val } }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    // Solo se envían las claves de este catálogo (vacías incluidas, para poder restablecerlas).
    const payload: TextOverrides = { es: {}, en: {} };
    for (const lang of ['es', 'en'] as const) {
      for (const item of TEXT_CATALOG) payload[lang]![item.path] = overrides[lang]?.[item.path] || '';
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={saving}
        saved={saved}
        error={error}
        saveLabel="Guardar Textos"
      />

      <div className="pb-4 border-b border-border">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">Textos Bilingües de la Landing</h1>
        <p className="mt-1 text-xs text-text-muted">
          Solo aparecen los textos que la web lee de aquí (portafolio de productos y formulario de contacto). Los
          titulares de Hero, Actualidad, Servicios, Equipo, FAQ y el resto se editan en el módulo de cada sección.
          Lo que dejes vacío muestra el texto original (sugerencia gris).
        </p>
      </div>

      {groups.map((group) => (
        <div key={group} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold">{group}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEXT_CATALOG.filter((t) => t.group === group).map((item) => {
              const val = current[item.path] || '';
              const placeholder = defaultText(langTab, item.path);
              return (
                <div key={item.path} className={item.long ? 'md:col-span-2' : ''}>
                  <div className="flex items-center justify-between mb-1">
                    <label className={LABEL}>{item.label}</label>
                    {val && (
                      <button
                        type="button"
                        onClick={() => setValue(item.path, '')}
                        className="text-[10px] text-text-subtle hover:text-accent font-mono flex items-center gap-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Restablecer</span>
                      </button>
                    )}
                  </div>
                  {item.long ? (
                    <textarea
                      rows={2}
                      value={val}
                      onChange={(e) => setValue(item.path, e.target.value)}
                      placeholder={placeholder}
                      className={cn(INPUT, 'resize-y')}
                    />
                  ) : (
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => setValue(item.path, e.target.value)}
                      placeholder={placeholder}
                      className={INPUT}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
