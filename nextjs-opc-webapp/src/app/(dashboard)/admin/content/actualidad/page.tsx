'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, LayoutGrid } from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';
import { DEFAULT_ACTUALIDAD, type ActualidadConfig } from '@/lib/constants/actualidad-defaults';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function ActualidadPage() {
  const [data, setData] = useState<ActualidadConfig>(DEFAULT_ACTUALIDAD);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<EditLang>('es');

  useEffect(() => {
    fetch('/api/content/actualidad')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (d) setData((prev) => ({ ...prev, ...d }));
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content/actualidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(resData?.error || 'No se pudo guardar la configuración de Actualidad.');
      if (resData.data) setData(resData.data);

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const badgeField = langTab === 'es' ? 'badgeText' : 'badgeTextEn';
  const titleField = langTab === 'es' ? 'title' : 'titleEn';
  const subtitleField = langTab === 'es' ? 'subtitle' : 'subtitleEn';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={loading}
        saved={saved}
        error={error}
        saveLabel="Guardar Cambios de Actualidad"
      />

      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">Actualidad (Últimas Publicaciones del Blog)</h1>
        <p className="mt-1 text-xs text-text-muted">
          Sección independiente que muestra en la portada las publicaciones más recientes del blog. El contenido de las
          tarjetas se gestiona en «Gestión de Posts / Blog»; aquí solo se configura cómo se presenta la sección.
        </p>
      </div>

      <SectionDesignBar sectionId="actualidad" sectionName="Actualidad" defaultBgColor="#0a0d14" />

      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" />
          <span>Textos de la Sección ({langTab.toUpperCase()})</span>
        </h3>

        <div>
          <label className={LABEL}>Insignia Superior / Badge</label>
          <input
            type="text"
            value={data[badgeField] || ''}
            onChange={(e) => setData({ ...data, [badgeField]: e.target.value })}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Título de la Sección</label>
          <input
            type="text"
            value={data[titleField] || ''}
            onChange={(e) => setData({ ...data, [titleField]: e.target.value })}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Subtítulo / Descripción</label>
          <textarea
            rows={2}
            value={data[subtitleField] || ''}
            onChange={(e) => setData({ ...data, [subtitleField]: e.target.value })}
            className={INPUT}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" />
          <span>Control de Despliegue</span>
        </h3>
        <div className="max-w-xs">
          <label className={LABEL}>Número de Tarjetas a Mostrar (1 a 12)</label>
          <input
            type="number"
            min={1}
            max={12}
            value={data.cardCount}
            onChange={(e) =>
              setData({ ...data, cardCount: Math.min(12, Math.max(1, Number(e.target.value) || 1)) })
            }
            className={INPUT}
          />
          <p className="mt-1.5 text-[11px] text-text-subtle leading-relaxed">
            La distribución se ajusta sola para que la última fila quede centrada y equilibrada, aunque no se complete
            (por ejemplo, 5 tarjetas: 3 en la primera fila y 2 centradas en la segunda).
          </p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>✓ Configuración de Actualidad actualizada correctamente</span>
        </div>
      )}
    </div>
  );
}
