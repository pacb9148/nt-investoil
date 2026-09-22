'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { ClientTestimonial } from '@/types';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Star,
  Loader2,
  Video,
  User,
} from 'lucide-react';
import { MediaUploadField } from '@/components/admin/media-upload-field';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TestimonialsEditorPage() {
  const [items, setItems] = useState<ClientTestimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_testimonials');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {}

    fetch('/api/content/testimonials')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          try {
            localStorage.setItem('investoil_testimonials', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateItem = (index: number, field: keyof ClientTestimonial, val: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/content/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.testimonials) {
          setItems(data.testimonials);
        }
      }

      try {
        localStorage.setItem('investoil_testimonials', JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('investoil_testimonials_updated', { detail: items }));
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
      try {
        localStorage.setItem('investoil_testimonials', JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('investoil_testimonials_updated', { detail: items }));
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
            Testimonios y Prueba Social
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Gestiona testimonios de clientes corporativos, añade o elimina opiniones e incorpora fotografías o videos testimoniales.
          </p>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Testimonio</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>0{idx + 1}.</span> {item.name || 'Nuevo Testimonio'}
              </span>

              <div className="flex items-center gap-3">
                {/* Selector de estrellas */}
                <div className="flex items-center gap-1 bg-card/60 px-2 py-1 rounded border border-border/60">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => updateItem(idx, 'rating', star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          star <= item.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-text-subtle'
                        }`}
                      />
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
                  <label className={LABEL}>Cargo y Empresa</label>
                  <input
                    type="text"
                    value={item.role}
                    onChange={(e) => updateItem(idx, 'role', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Jefe de Compras · Refinería Asiática"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={LABEL}>Texto del Testimonio / Reseña</label>
                <textarea
                  rows={3}
                  value={item.text}
                  onChange={(e) => updateItem(idx, 'text', e.target.value)}
                  className={INPUT}
                  placeholder="Detalle de la experiencia con Invest Oil..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Foto / Avatar del Autor */}
                <MediaUploadField
                  label="Fotografía / Avatar del Cliente (Opcional)"
                  value={item.avatar || ''}
                  onChange={(url) => updateItem(idx, 'avatar', url)}
                  accept="image"
                  placeholder="https://... o seleccione un archivo"
                  description="Foto cuadrada del ejecutivo o logotipo del cliente."
                />

                {/* Video Testimonial Opcional */}
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

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>+ Añadir otro testimonio</span>
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
                <span>Guardar Cambios de Testimonios</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
