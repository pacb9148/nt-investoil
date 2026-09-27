'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';
import { TiptapEditor } from '@/components/admin/tiptap-editor';
import type { ProblemItem } from '@/types';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function ProblemaPage() {
  const [items, setItems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<EditLang>('es');

  useEffect(() => {
    fetch('/api/content/problem')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  const updateItem = (index: number, field: keyof ProblemItem, val: any) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };

  const addItem = () => {
    const nextNum = items.length + 1;
    const newItem: ProblemItem = {
      id: `prob-${Date.now().toString().slice(-4)}`,
      num: nextNum < 10 ? `0${nextNum}` : `${nextNum}`,
      title: '',
      desc: '',
      solution: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Debe permanecer al menos un reto en la sección.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content/problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudieron guardar los retos.');
      if (data.problems) setItems(data.problems);

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const titleField = langTab === 'es' ? 'title' : 'title_en';
  const descField = langTab === 'es' ? 'desc' : 'desc_en';
  const solutionField = langTab === 'es' ? 'solution' : 'solution_en';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={loading}
        saved={saved}
        error={error}
        saveLabel="Guardar Cambios de Retos"
        extraActions={
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Reto</span>
          </button>
        }
      />

      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-text">Retos del Sector Energético (El Problema)</h1>
        <p className="mt-1 text-xs text-text-muted">
          Configura los desafíos y puntos de dolor que experimentan refinerías, fondos y distribuidores, y cómo Invest Oil
          los resuelve. En la web pública se muestra un fragmento de 128 caracteres con «ver más» para el detalle completo.
        </p>
      </div>

      <SectionDesignBar sectionId="problema" sectionName="Retos del Sector Petrolero" defaultBgColor="#07090e" />

      <div className="space-y-5">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>PUNTO DE DOLOR #{item.num}:</span> {item.title || 'Nuevo Desafío'}
              </span>

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                title="Eliminar este reto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={LABEL}>Número Identificador</label>
                  <input
                    type="text"
                    value={item.num}
                    onChange={(e) => updateItem(idx, 'num', e.target.value)}
                    className={INPUT}
                    placeholder="01, 02..."
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className={LABEL}>Titular del Desafío / Punto de Dolor ({langTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(item[titleField] as string) || ''}
                    onChange={(e) => updateItem(idx, titleField, e.target.value)}
                    className={INPUT}
                    placeholder={langTab === 'es' ? 'ej. Intermediación Ineficiente...' : 'e.g. Inefficient Intermediation...'}
                    required={langTab === 'es'}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Descripción del Problema en el Mercado ({langTab.toUpperCase()})</label>
                <TiptapEditor
                  content={item[descField] || ''}
                  onChange={(json) => updateItem(idx, descField, json)}
                  placeholder={
                    langTab === 'es'
                      ? 'Detalla el problema que sufren los actores del sector...'
                      : 'Detail the problem industry players face...'
                  }
                />
              </div>

              <div>
                <label className={LABEL}>Solución Aportada por Invest Oil LLC ({langTab.toUpperCase()})</label>
                <TiptapEditor
                  content={item[solutionField] || ''}
                  onChange={(json) => updateItem(idx, solutionField, json)}
                  placeholder={
                    langTab === 'es'
                      ? 'Cómo resolvemos este desafío con seguridad y trazabilidad...'
                      : 'How we solve this challenge with security and traceability...'
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Retos del sector petrolero actualizados correctamente</span>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>+ Añadir otro reto</span>
        </button>
      </div>
    </div>
  );
}
