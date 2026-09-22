'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function FaqEditorPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_faqs');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFaqs(parsed);
        }
      }
    } catch {}

    fetch('/api/content/faq')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
          try {
            localStorage.setItem('investoil_faqs', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const addFaq = () => {
    setFaqs([
      ...faqs,
      {
        id: `faq-${Date.now().toString().slice(-4)}`,
        question: '',
        answer: '',
      },
    ]);
  };

  const removeFaq = (id: string) => {
    if (faqs.length <= 1) {
      alert('Debe permanecer al menos una pregunta en la sección.');
      return;
    }
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/content/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqs),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.faqs) setFaqs(data.faqs);
      }

      try {
        localStorage.setItem('investoil_faqs', JSON.stringify(faqs));
        window.dispatchEvent(new CustomEvent('investoil_faqs_updated', { detail: faqs }));
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
      try {
        localStorage.setItem('investoil_faqs', JSON.stringify(faqs));
        window.dispatchEvent(new CustomEvent('investoil_faqs_updated', { detail: faqs }));
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
            Preguntas Frecuentes (FAQ)
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Gestiona las preguntas y respuestas operativas y contractuales: añade nuevas consultas o elimina las existentes.
          </p>
        </div>

        <button
          type="button"
          onClick={addFaq}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Pregunta</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={faq.id} className="rounded-xl border border-border bg-surf/50 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>0{idx + 1}.</span> {faq.question || 'Nueva Pregunta'}
              </span>

              <button
                type="button"
                onClick={() => removeFaq(faq.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                title="Eliminar esta pregunta"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            </div>

            <div>
              <label className={LABEL}>Pregunta Frecuente</label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                className={INPUT}
                placeholder="ej. ¿Cuáles son los procedimientos de compra...?"
                required
              />
            </div>

            <div>
              <label className={LABEL}>Respuesta Operativa Detallada</label>
              <textarea
                rows={3}
                value={faq.answer}
                onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
                className={INPUT}
                placeholder="Detalla los términos, documentación requerida, Incoterms..."
                required
              />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Preguntas frecuentes guardadas y actualizadas con éxito</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addFaq}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>+ Añadir otra pregunta</span>
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
                <span>Guardar Cambios de FAQ</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
