'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const INITIAL_TESTIMONIALS = [
  {
    id: '1',
    author: 'Carlos E. Mendoza',
    role: 'Director de Suministro',
    company: 'Refinería del Pacífico S.A.',
    quote: 'La consistencia en la calidad del crudo y la puntualidad en los fletamentos de Invest Oil LLC han sido determinantes para mantener nuestra capacidad de refinación al máximo rendimiento.',
  },
  {
    id: '2',
    author: 'James R. Thornton',
    role: 'Head of Global Energy Trading',
    company: 'Meridian Commodities Ltd. (Londres)',
    quote: 'Un socio comercial transparente, con solvencia operativa en contratos CIF y capacidad inmediata de mitigación ante la volatilidad de los precios en el Mar del Norte y el Golfo de México.',
  },
];

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TestimonialsEditorPage() {
  const [items, setItems] = useState(INITIAL_TESTIMONIALS);
  const [saved, setSaved] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        author: 'Nuevo Testimonio',
        role: 'Cargo Directivo',
        company: 'Empresa / Refinería',
        quote: 'Comentario sobre la experiencia comercial...',
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: string, field: string, value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            Testimonios y Prueba Social
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Administra las recomendaciones de directores de suministro, refinerías y socios comerciales.
          </p>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>Añadir Testimonio</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-border bg-surf/50 p-5 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-accent font-semibold">TESTIMONIO #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-text-subtle hover:text-red-400 p-1 transition-colors"
                title="Eliminar testimonio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={LABEL}>Nombre del Directivo</label>
                <input
                  type="text"
                  value={item.author}
                  onChange={(e) => updateItem(item.id, 'author', e.target.value)}
                  className={INPUT}
                  required
                />
              </div>
              <div>
                <label className={LABEL}>Cargo</label>
                <input
                  type="text"
                  value={item.role}
                  onChange={(e) => updateItem(item.id, 'role', e.target.value)}
                  className={INPUT}
                  required
                />
              </div>
              <div>
                <label className={LABEL}>Empresa</label>
                <input
                  type="text"
                  value={item.company}
                  onChange={(e) => updateItem(item.id, 'company', e.target.value)}
                  className={INPUT}
                  required
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Cita / Testimonio</label>
              <textarea
                rows={3}
                value={item.quote}
                onChange={(e) => updateItem(item.id, 'quote', e.target.value)}
                className={INPUT}
                required
              />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Testimonios actualizados correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Testimonios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
