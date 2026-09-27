'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ClientTestimonial } from '@/types';
import { ArrowLeft, CheckCircle2, Plus, Trash2, Star } from 'lucide-react';
import { MediaUploadField } from '@/components/admin/media-upload-field';
import { SectionDesignBar } from '@/components/admin/content/section-design-bar';
import { AdminEditorToolbar, type EditLang } from '@/components/admin/content/admin-editor-toolbar';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TestimonialsEditorPage() {
  const [items, setItems] = useState<ClientTestimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langTab, setLangTab] = useState<EditLang>('es');

  useEffect(() => {
    fetch('/api/content/testimonials')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {});
  }, []);

  const updateItem = (index: number, field: keyof ClientTestimonial, val: any) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };

  const addItem = () => {
    const newItem: ClientTestimonial = {
      id: `test-${Date.now().toString().slice(-4)}`,
      name: '',
      role: '',
      rating: 5,
      avatar: '',
      videoUrl: '',
      text: '',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      alert('Debe permanecer al menos un testimonio en la plataforma.');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/content/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'No se pudieron guardar los testimonios.');
      if (data.testimonials) setItems(data.testimonials);

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const roleField = langTab === 'es' ? 'role' : 'role_en';
  const textField = langTab === 'es' ? 'text' : 'text_en';

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      <AdminEditorToolbar
        langTab={langTab}
        onLangChange={setLangTab}
        onSave={handleSave}
        saving={loading}
        saved={saved}
        error={error}
        saveLabel="Guardar Cambios de Testimonios"
        extraActions={
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Testimonio</span>
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
        <h1 className="text-2xl font-bold tracking-tight text-text">Testimonios y Prueba Social</h1>
        <p className="mt-1 text-xs text-text-muted">
          Gestiona testimonios de clientes corporativos, añade o elimina opiniones e incorpora fotografías o videos testimoniales.
        </p>
      </div>

      <SectionDesignBar sectionId="testimonials" sectionName="Testimonios & Reseñas" />

      <div className="space-y-5">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>0{idx + 1}.</span> {item.name || 'Nuevo Testimonio'}
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-card/60 px-2 py-1 rounded border border-border/60">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => updateItem(idx, 'rating', star)} className="focus:outline-none">
                      <Star className={`w-3.5 h-3.5 ${star <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-text-subtle'}`} />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                  title="Eliminar este testimonio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Nombre del Cliente / Representante</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Director de Aprovisionamiento"
                    required
                  />
                </div>
                <div>
                  <label className={LABEL}>Cargo y Empresa ({langTab.toUpperCase()})</label>
                  <input
                    type="text"
                    value={(item[roleField] as string) || ''}
                    onChange={(e) => updateItem(idx, roleField, e.target.value)}
                    className={INPUT}
                    placeholder={langTab === 'es' ? 'ej. Jefe de Compras · Refinería Asiática' : 'e.g. Head of Procurement · Asian Refinery'}
                    required={langTab === 'es'}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Texto del Testimonio / Reseña ({langTab.toUpperCase()})</label>
                <textarea
                  rows={3}
                  value={(item[textField] as string) || ''}
                  onChange={(e) => updateItem(idx, textField, e.target.value)}
                  className={INPUT}
                  placeholder={langTab === 'es' ? 'Detalle de la experiencia con Invest Oil...' : 'Detail of the experience with Invest Oil...'}
                  required={langTab === 'es'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <MediaUploadField
                  label="Fotografía / Avatar del Cliente (Opcional)"
                  value={item.avatar || ''}
                  onChange={(url) => updateItem(idx, 'avatar', url)}
                  accept="image"
                  placeholder="https://... o seleccione un archivo"
                  description="Foto cuadrada del ejecutivo o logotipo del cliente."
                />

                <MediaUploadField
                  label="Video Testimonial (Opcional - MP4 / WebM)"
                  value={item.videoUrl || ''}
                  onChange={(url) => updateItem(idx, 'videoUrl', url)}
                  accept="video"
                  placeholder="https://... o seleccione video MP4"
                  description="Grabación o declaración en video del cliente."
                />
              </div>
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Testimonios guardados y actualizados correctamente</span>
          </div>
        )}

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>+ Añadir otro testimonio</span>
        </button>
      </div>
    </div>
  );
}
