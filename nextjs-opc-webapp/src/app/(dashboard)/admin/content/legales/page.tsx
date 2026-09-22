'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  Shield,
  Scale,
  Cookie,
  AlertTriangle,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { LegalPageData, LegalSection } from '@/app/api/content/legales/route';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

const LEGAL_PAGES = [
  { slug: 'aviso-de-privacidad', label: 'Aviso de Privacidad', icon: Shield },
  { slug: 'terminos-y-condiciones', label: 'Términos y Condiciones', icon: Scale },
  { slug: 'politica-de-cookies', label: 'Política de Cookies', icon: Cookie },
  { slug: 'alerta-de-fraude-y-estafas', label: 'Alerta de Fraude y Estafas', icon: AlertTriangle },
  { slug: 'accesibilidad', label: 'Declaración de Accesibilidad', icon: Eye },
];

export default function LegalesContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('aviso-de-privacidad');

  const [allPages, setAllPages] = useState<Record<string, LegalPageData>>({});
  const [currentPage, setCurrentPage] = useState<LegalPageData>({
    badge: '',
    title: '',
    lastUpdated: '',
    intro: '',
    sections: [],
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/content/legales');
        if (res.ok) {
          const data = await res.json();
          setAllPages(data);
          if (data[selectedSlug]) {
            setCurrentPage(data[selectedSlug]);
          }
        }
      } catch (e) {
        console.error('Error cargando páginas legales:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectSlug = (slug: string) => {
    setSelectedSlug(slug);
    if (allPages[slug]) {
      setCurrentPage(allPages[slug]);
    }
  };

  const handleAddSection = () => {
    const newSection: LegalSection = {
      title: 'Nueva Cláusula / Disposición',
      content: 'Detalle de la disposición normativa o cláusula aplicable.',
    };
    setCurrentPage({
      ...currentPage,
      sections: [...(currentPage.sections || []), newSection],
    });
  };

  const handleRemoveSection = (index: number) => {
    const updated = (currentPage.sections || []).filter((_, idx) => idx !== index);
    setCurrentPage({ ...currentPage, sections: updated });
  };

  const handleSectionChange = (index: number, field: keyof LegalSection, value: string) => {
    const updated = [...(currentPage.sections || [])];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentPage({ ...currentPage, sections: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedAll = {
      ...allPages,
      [selectedSlug]: currentPage,
    };

    try {
      const res = await fetch('/api/content/legales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedSlug, pageData: currentPage }),
      });

      if (res.ok) {
        setAllPages(updatedAll);
        setSaved(true);
        window.dispatchEvent(new CustomEvent('investoil_legales_updated', { detail: { slug: selectedSlug } }));
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Error guardando página legal:', e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-text-muted text-sm font-mono">
        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
        Cargando marco normativo y páginas legales...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
            Editor de Páginas Legales & Compliance
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Administra cláusulas, normativas y estipulaciones para cada una de las 5 páginas legales corporativas.
          </p>
        </div>

        <Link
          href={`/${selectedSlug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card/60 text-xs font-mono text-text-muted hover:text-accent transition-colors"
        >
          <span>Ver página pública</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Selector de Páginas Legales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {LEGAL_PAGES.map((page) => {
          const Icon = page.icon;
          const isSelected = selectedSlug === page.slug;
          return (
            <button
              key={page.slug}
              type="button"
              onClick={() => handleSelectSlug(page.slug)}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'border-accent bg-accent/10 text-accent font-bold shadow-sm'
                  : 'border-border bg-surf/40 text-text-muted hover:text-text hover:border-border/80'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[11px] leading-tight line-clamp-2">{page.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabecera del Documento Legal */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span>Parámetros Generales de la Página</span>
            </h2>
            <span className="text-[11px] font-mono text-accent">/{selectedSlug}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Badge / Etiqueta Superior</label>
              <input
                type="text"
                value={currentPage.badge || ''}
                onChange={(e) => setCurrentPage({ ...currentPage, badge: e.target.value })}
                className={INPUT}
                placeholder="Ej: MARCO LEGAL"
              />
            </div>

            <div className="sm:col-span-2">
              <label className={LABEL}>Título Principal</label>
              <input
                type="text"
                value={currentPage.title || ''}
                onChange={(e) => setCurrentPage({ ...currentPage, title: e.target.value })}
                className={INPUT}
                placeholder="Ej: Términos y Condiciones de Uso"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={LABEL}>Última Revisión / Fecha</label>
              <input
                type="date"
                value={currentPage.lastUpdated || ''}
                onChange={(e) => setCurrentPage({ ...currentPage, lastUpdated: e.target.value })}
                className={INPUT}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={LABEL}>Preámbulo / Texto Introductorio</label>
              <textarea
                rows={2}
                value={currentPage.intro || ''}
                onChange={(e) => setCurrentPage({ ...currentPage, intro: e.target.value })}
                className={INPUT}
                placeholder="Párrafo introductorio oficial..."
              />
            </div>
          </div>
        </div>

        {/* Cláusulas y Secciones */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text">Cláusulas, Normas & Disposiciones</h2>
              <p className="text-[11px] text-text-muted">
                Agrega, edita o elimina las cláusulas que componen esta página legal.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent text-xs font-bold hover:bg-accent hover:text-bg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Añadir Cláusula</span>
            </button>
          </div>

          <div className="space-y-4">
            {currentPage.sections?.map((section, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-card/60 space-y-3 relative group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] font-mono font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                      § {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleSectionChange(idx, 'title', e.target.value)}
                      placeholder="Título de la Cláusula..."
                      className={`${INPUT} font-semibold`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSection(idx)}
                    className="p-2 rounded text-text-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                    title="Eliminar cláusula"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className={LABEL}>Contenido Normativo / Disposición Legal</label>
                  <textarea
                    rows={4}
                    value={section.content}
                    onChange={(e) => handleSectionChange(idx, 'content', e.target.value)}
                    placeholder="Escribe el texto de la cláusula. Puedes usar viñetas (•) o saltos de línea..."
                    className={INPUT}
                  />
                </div>
              </div>
            ))}

            {(!currentPage.sections || currentPage.sections.length === 0) && (
              <div className="text-center py-8 text-text-subtle text-xs border border-dashed border-border rounded-xl">
                No hay cláusulas registradas en esta página. Pulsa en "+ Añadir Cláusula" para comenzar.
              </div>
            )}
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Página legal actualizada y guardada correctamente</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Guardando...' : 'Guardar y Publicar Página'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
