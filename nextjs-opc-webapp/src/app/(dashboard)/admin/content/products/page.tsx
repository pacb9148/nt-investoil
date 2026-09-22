'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS_LIST } from '@/lib/constants/investoil';
import type { ProductItem } from '@/types';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function ProductsEditorPage() {
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_LIST);
  const [saved, setSaved] = useState(false);

  const updateProduct = (sku: string, field: keyof ProductItem, val: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.sku === sku ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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
            Catálogo de Productos de Hidrocarburos
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Edita los nombres, descripciones y normas técnicas de los 8 productos (Crudos, Jet Fuel A1, EN590, D2, GNL).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {products.map((p: ProductItem, idx: number) => (
          <div key={p.sku} className="rounded-xl border border-border bg-surf/50 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-accent font-semibold">
                PRODUCTO #{idx + 1}: {p.title}
              </span>
              <span className="text-[11px] font-mono text-text-subtle">SKU: {p.sku}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Nombre Comercial</label>
                <input
                  type="text"
                  value={p.title}
                  onChange={(e) => updateProduct(p.sku, 'title', e.target.value)}
                  className={INPUT}
                  required
                />
              </div>
              <div>
                <label className={LABEL}>Especificación / Estándar</label>
                <input
                  type="text"
                  value={p.specs}
                  onChange={(e) => updateProduct(p.sku, 'specs', e.target.value)}
                  className={INPUT}
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Descripción y Usos Industriales</label>
              <textarea
                rows={2}
                value={p.description}
                onChange={(e) => updateProduct(p.sku, 'description', e.target.value)}
                className={INPUT}
                required
              />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Catálogo de productos actualizado correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Productos</span>
          </button>
        </div>
      </form>
    </div>
  );
}
