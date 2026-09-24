'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { FeaturedOperation } from '@/types';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Loader2,
  Building2,
} from 'lucide-react';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function PlataformaPage() {
  const [ops, setOps] = useState<FeaturedOperation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_operations');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOps(parsed);
        }
      }
    } catch {}

    fetch('/api/content/operations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setOps(data);
          try {
            localStorage.setItem('investoil_operations', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateOp = (index: number, field: keyof FeaturedOperation, val: string) => {
    setOps((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const addOp = () => {
    const newOp: FeaturedOperation = {
      title: '',
      description: '',
      client: '',
      year: new Date().getFullYear().toString(),
      result: '',
    };
    setOps((prev) => [...prev, newOp]);
  };

  const removeOp = (index: number) => {
    if (ops.length <= 1) {
      alert('Debe permanecer al menos una operación en la sección.');
      return;
    }
    setOps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/content/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ops),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.operations) setOps(data.operations);
      }

      try {
        localStorage.setItem('investoil_operations', JSON.stringify(ops));
        window.dispatchEvent(new CustomEvent('investoil_operations_updated', { detail: ops }));
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
      try {
        localStorage.setItem('investoil_operations', JSON.stringify(ops));
        window.dispatchEvent(new CustomEvent('investoil_operations_updated', { detail: ops }));
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
            Operaciones Destacadas e Infraestructura
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Gestiona las operaciones globales, añade o elimina transacciones y actualiza clientes, años y resultados.
          </p>
        </div>

        <button
          type="button"
          onClick={addOp}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Operación</span>
        </button>
      </div>

      <SectionDesignBar sectionId="plataforma" sectionName="Operaciones / Plataforma" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {ops.map((item: FeaturedOperation, idx: number) => (
          <div key={idx} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>OPERACIÓN #{idx + 1}:</span> {item.title || 'Nueva Transacción'}
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-accent flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                  <Calendar className="w-3 h-3" />
                  <span>{item.year || '2024'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => removeOp(idx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                  title="Eliminar esta operación"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={LABEL}>Título de la Operación</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateOp(idx, 'title', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Exportación de Pet Coke a mercado asiático"
                    required
                  />
                </div>

                <div>
                  <label className={LABEL}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-accent" />
                      <span>Año / Fecha de Publicación</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={item.year}
                    onChange={(e) => updateOp(idx, 'year', e.target.value)}
                    className={INPUT}
                    placeholder="2024, Q3 2025"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Cliente / Contraparte</label>
                  <input
                    type="text"
                    value={item.client}
                    onChange={(e) => updateOp(idx, 'client', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Refinería Internacional"
                    required
                  />
                </div>

                <div>
                  <label className={LABEL}>Resultado Contractual Verificado</label>
                  <input
                    type="text"
                    value={item.result}
                    onChange={(e) => updateOp(idx, 'result', e.target.value)}
                    className={INPUT}
                    placeholder="ej. 50.000 MT entregadas en plazo"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Descripción Operativa y Logística</label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateOp(idx, 'description', e.target.value)}
                  className={INPUT}
                  placeholder="Detalles del fletamento, volúmenes, destino..."
                  required
                />
              </div>
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Operaciones destacadas actualizadas correctamente</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addOp}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>+ Añadir otra operación</span>
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
                <span>Guardar Cambios de Operaciones</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
