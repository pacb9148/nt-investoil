'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ServiceItem } from '@/types';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
  Layers,
} from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function ServicesEditorPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_services');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {}

    fetch('/api/content/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          try {
            localStorage.setItem('investoil_services', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateItem = (index: number, field: keyof ServiceItem, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const addItem = () => {
    const nextNum = items.length + 1;
    const newItem: ServiceItem = {
      code: `S/${nextNum < 10 ? '0' + nextNum : nextNum}`,
      title: '',
      description: '',
      iconName: 'Flame',
      tags: ['Trading', 'Operaciones'],
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Debe permanecer al menos un servicio en el catálogo.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/content/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.services) setItems(data.services);
      }

      try {
        localStorage.setItem('investoil_services', JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('investoil_services_updated', { detail: items }));
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
      try {
        localStorage.setItem('investoil_services', JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('investoil_services_updated', { detail: items }));
      } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Contenido</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Catálogo de Servicios Petroleros
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Gestiona los servicios de trading, logística e infraestructura: añade nuevos servicios o elimina los existentes.
          </p>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Servicio</span>
        </button>
      </div>

      <SectionDesignBar
        sectionId="services"
        sectionName="Servicios Petroleros"
        defaultBgColor="#0a0d14"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>{item.code}:</span> {item.title || 'Nuevo Servicio'}
              </span>

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                title="Eliminar este servicio"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={LABEL}>Código Identificador</label>
                  <input
                    type="text"
                    value={item.code}
                    onChange={(e) => updateItem(idx, 'code', e.target.value)}
                    className={INPUT}
                    placeholder="S/01"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Título del Servicio</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(idx, 'title', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Trading y corretaje de crudos"
                    required
                  />
                </div>
                <div>
                  <label className={LABEL}>Icono (Lucide)</label>
                  <input
                    type="text"
                    value={item.iconName}
                    onChange={(e) => updateItem(idx, 'iconName', e.target.value)}
                    className={INPUT}
                    placeholder="Flame, Ship, Anchor..."
                    required
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Descripción Operativa</label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className={INPUT}
                  placeholder="Detalle del alcance del servicio..."
                  required
                />
              </div>

              <div>
                <label className={LABEL}>Etiquetas / Tags (separados por coma)</label>
                <input
                  type="text"
                  value={Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}
                  onChange={(e) =>
                    updateItem(
                      idx,
                      'tags',
                      e.target.value.split(',').map((t) => t.trim())
                    )
                  }
                  className={INPUT}
                  placeholder="Crudos, Merey 16, Spot, ASTM..."
                />
              </div>
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Catálogo de servicios actualizado correctamente</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>+ Añadir otro servicio</span>
          </button>

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
                <span>Guardar Cambios de Servicios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
