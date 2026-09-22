'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const INITIAL_FAQS: FaqItem[] = [
  {
    id: '1',
    question: '¿Cuáles son los procedimientos habituales para la compra de crudo o derivados?',
    answer: 'Operamos bajo estándares internacionales (Incoterms 2020: FOB, CIF, CFR). Los compradores deben presentar LOI/ICPO corporativo y prueba de fondos (BCL o MT799/MT760 según aplique).',
  },
  {
    id: '2',
    question: '¿Qué garantías de calidad e inspección ofrece Invest Oil LLC?',
    answer: 'Todos nuestros cargamentos son inspeccionados y certificados por firmas independientes de primer nivel como SGS, Intertek o Saybolt en el puerto de carga.',
  },
  {
    id: '3',
    question: '¿En qué puertos y hubs disponen de capacidad de entrega?',
    answer: 'Mantenemos presencia y acuerdos en Houston (US Gulf Coast), Rotterdam, Fujairah, Singapur y terminales marítimas clave en el Caribe y Sudamérica.',
  },
];

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function FaqEditorPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>(INITIAL_FAQS);
  const [saved, setSaved] = useState(false);

  const addFaq = () => {
    setFaqs([
      ...faqs,
      { id: Date.now().toString(), question: 'Nueva pregunta frecuente', answer: 'Respuesta detallada...' },
    ]);
  };

  const removeFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const updateFaq = (id: string, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
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
            Editor de Preguntas Frecuentes (FAQ)
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Agrega, modifica o elimina dudas frecuentes sobre procedimientos de compra, inspección y entrega.
          </p>
        </div>

        <button
          type="button"
          onClick={addFaq}
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-accent" />
          <span>Añadir Pregunta</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {faqs.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-border bg-surf/50 p-5 space-y-3 relative group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-accent font-semibold">PREGUNTA #{index + 1}</span>
              <button
                type="button"
                onClick={() => removeFaq(item.id)}
                className="text-text-subtle hover:text-red-400 p-1 transition-colors"
                title="Eliminar pregunta"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className={LABEL}>Pregunta</label>
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateFaq(item.id, 'question', e.target.value)}
                className={INPUT}
                required
              />
            </div>
            <div>
              <label className={LABEL}>Respuesta</label>
              <textarea
                rows={3}
                value={item.answer}
                onChange={(e) => updateFaq(item.id, 'answer', e.target.value)}
                className={INPUT}
                required
              />
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Preguntas frecuentes actualizadas correctamente</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar FAQ</span>
          </button>
        </div>
      </form>
    </div>
  );
}
