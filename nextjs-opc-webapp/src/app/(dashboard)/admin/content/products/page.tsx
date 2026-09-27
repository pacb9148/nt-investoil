'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ProductItem } from '@/types';
import { ArrowLeft, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { MediaUploadField } from '@/components/admin/media-upload-field';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function ProductsEditorPage() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<EditLang>('es');

  useEffect(() => {
    fetch('/api/content/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  const updateItem = (index: number, field: keyof ProductItem, val: any) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };

  const addItem = () => {
    const newItem: ProductItem = {
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      title: '',
      description: '',
      specs: 'API 30° · Azufre < 1%',
      market: 'Global',
      availability: 'Disponible',
      category: 'Hidrocarburos',
      imageUrl: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Debe permanecer al menos un producto en el catálogo.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar el catálogo de productos.');
      if (data.products) setItems(data.products);

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const titleField = langTab === 'es' ? 'title' : 'title_en';
  const descriptionField = langTab === 'es' ? 'description' : 'description_en';
  const specsField = langTab === 'es' ? 'specs' : 'specs_en';
  const marketField = langTab === 'es' ? 'market' : 'market_en';
  const availabilityField = langTab === 'es' ? 'availability' : 'availability_en';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={loading}
        saved={saved}
        error={error}
        saveLabel="Guardar Cambios de Productos"
        extraActions={
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Producto</span>
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
        <h1 className="text-2xl font-bold tracking-tight text-text">Portafolio de Productos & Commodities</h1>
        <p className="mt-1 text-xs text-text-muted">
          Gestiona crudos, destilados y derivados: añade productos, actualiza fichas técnicas, sube fotografías o elimina productos.
        </p>
      </div>

      <SectionDesignBar sectionId="products" sectionName="Portafolio de Hidrocarburos" defaultBgColor="#07090e" />

      <div className="space-y-5">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>{item.sku}:</span> {item.title || 'Nuevo Producto'}
              </span>

              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                title="Eliminar este producto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL}>SKU / Código Técnico</label>
                  <input
                    type="text"
                    value={item.sku}
                    onChange={(e) => updateItem(idx, 'sku', e.target.value)}
                    className={INPUT}
                    placeholder="ej. MEREY-16, EN590"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Nombre Comercial del Producto ({langTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(item[titleField] as string) || ''}
                    onChange={(e) => updateItem(idx, titleField, e.target.value)}
                    className={INPUT}
                    placeholder={langTab === 'es' ? 'ej. Crudo Merey 16' : 'e.g. Merey 16 Crude'}
                    required={langTab === 'es'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL}>Especificaciones Técnicas ({langTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(item[specsField] as string) || ''}
                    onChange={(e) => updateItem(idx, specsField, e.target.value)}
                    className={INPUT}
                    placeholder="API 16° · Azufre ~2.5%"
                    required={langTab === 'es'}
                  />
                </div>
                <div>
                  <label className={LABEL}>Mercado Principal ({langTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(item[marketField] as string) || ''}
                    onChange={(e) => updateItem(idx, marketField, e.target.value)}
                    className={INPUT}
                    placeholder={langTab === 'es' ? 'Asia, Europa, Global' : 'Asia, Europe, Global'}
                    required={langTab === 'es'}
                  />
                </div>
                <div>
                  <label className={LABEL}>Disponibilidad Contractual ({langTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(item[availabilityField] as string) || ''}
                    onChange={(e) => updateItem(idx, availabilityField, e.target.value)}
                    className={INPUT}
                    placeholder={langTab === 'es' ? 'Spot, Cargamentos mensuales' : 'Spot, Monthly cargoes'}
                    required={langTab === 'es'}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Descripción Comercial ({langTab.toUpperCase()})</label>
                <textarea
                  rows={2}
                  value={(item[descriptionField] as string) || ''}
                  onChange={(e) => updateItem(idx, descriptionField, e.target.value)}
                  className={INPUT}
                  placeholder={langTab === 'es' ? 'Detalle de aplicaciones, refinerías destino...' : 'Detail applications, destination refineries...'}
                  required={langTab === 'es'}
                />
              </div>

              <MediaUploadField
                label="Fotografía del Producto / Operación (Subir o URL)"
                value={item.imageUrl || ''}
                onChange={(url) => updateItem(idx, 'imageUrl', url)}
                accept="image"
                placeholder="https://... o seleccione una imagen de buque o crudo"
                description="Fotografía de cargamento, buque tanque o refinería."
              />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Catálogo de productos guardado correctamente</span>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>+ Añadir otro producto</span>
        </button>
      </div>
    </div>
  );
}
