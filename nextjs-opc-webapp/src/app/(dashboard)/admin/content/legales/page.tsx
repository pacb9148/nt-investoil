'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  RefreshCw,
  FileText,
  Shield,
  Scale,
  Cookie,
  AlertTriangle,
  Eye,
  ExternalLink,
  Globe,
  Calendar,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { LegalPageData, LegalSection } from '@/app/api/content/legales/route';
import { TiptapEditor } from '@/components/admin/tiptap-editor';

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

function sectionsToHtml(sections?: LegalSection[]): string {
  if (!sections || sections.length === 0) return '';
  return sections
    .map(
      (sec) =>
        `<h2>${sec.title}</h2><p>${(sec.content || '').replace(/\n/g, '<br/>')}</p>`
    )
    .join('');
}

export default function LegalesContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('aviso-de-privacidad');
  const [editorLang, setEditorLang] = useState<'es' | 'en'>('es');

  const [allPages, setAllPages] = useState<Record<string, LegalPageData>>({});
  const [currentPage, setCurrentPage] = useState<LegalPageData>({
    badge: '',
    title: '',
    lastUpdated: '',
    intro: '',
    content_html: '',
    badge_en: '',
    title_en: '',
    intro_en: '',
    content_html_en: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/content/legales');
        if (res.ok) {
          const data = await res.json();
          setAllPages(data);
          if (data[selectedSlug]) {
            const page = data[selectedSlug];
            setCurrentPage({
              ...page,
              content_html: page.content_html || sectionsToHtml(page.sections),
              content_html_en: page.content_html_en || sectionsToHtml(page.sections_en),
            });
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
      const page = allPages[slug];
      setCurrentPage({
        ...page,
        content_html: page.content_html || sectionsToHtml(page.sections),
        content_html_en: page.content_html_en || sectionsToHtml(page.sections_en),
      });
    }
  };

  const currentContentHtml = useMemo(() => {
    return editorLang === 'en'
      ? currentPage.content_html_en || ''
      : currentPage.content_html || '';
  }, [editorLang, currentPage.content_html, currentPage.content_html_en]);

  const handleEditorChange = (newHtml: string) => {
    if (editorLang === 'en') {
      setCurrentPage((prev) => ({ ...prev, content_html_en: newHtml }));
    } else {
      setCurrentPage((prev) => ({ ...prev, content_html: newHtml }));
    }
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
        window.dispatchEvent(
          new CustomEvent('investoil_legales_updated', {
            detail: { slug: selectedSlug },
          })
        );
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-text-muted font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-accent" />
          <span>Cargando páginas legales...</span>
        </div>
      </div>
    );
  }

  const selectedMeta = LEGAL_PAGES.find((p) => p.slug === selectedSlug) || LEGAL_PAGES[0];
  const PageIcon = selectedMeta.icon;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/content"
              className="text-text-muted hover:text-text transition-colors p-1 rounded hover:bg-card"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-heading font-bold text-xl text-text flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              <span>Editor de Páginas Legales & Cumplimiento</span>
            </h1>
          </div>
          <p className="text-xs text-text-muted pl-7">
            Edición tipo artículo enriquecido (Rich Text) para los 5 documentos normativos de Invest Oil LLC.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={`/${selectedSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card/60 hover:bg-card text-xs font-medium text-text transition-colors"
          >
            <span>Ver Página Pública</span>
            <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
          </a>
        </div>
      </div>

      {/* Selector de Páginas Legales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {LEGAL_PAGES.map((page) => {
          const Icon = page.icon;
          const isActive = selectedSlug === page.slug;
          return (
            <button
              key={page.slug}
              type="button"
              onClick={() => handleSelectSlug(page.slug)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col gap-2 ${
                isActive
                  ? 'border-accent bg-accent/10 shadow-sm'
                  : 'border-border/60 bg-card/40 hover:bg-card hover:border-border text-text-muted hover:text-text'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-text-subtle'}`} />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>
              <span className={`text-xs font-semibold ${isActive ? 'text-accent' : 'text-text'}`}>
                {page.label}
              </span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de Idioma para Edición */}
        <div className="rounded-xl border border-border bg-surf/40 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-text">
            <PageIcon className="w-4 h-4 text-accent" />
            <span className="font-bold">{selectedMeta.label}</span>
            <span className="text-text-subtle">·</span>
            <span className="text-text-muted text-[11px]">/{selectedSlug}</span>
          </div>

          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 text-xs font-mono">
            <Globe className="w-3.5 h-3.5 text-accent ml-1.5 mr-2" />
            <button
              type="button"
              onClick={() => setEditorLang('es')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                editorLang === 'es'
                  ? 'bg-accent text-bg shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Español (ES)
            </button>
            <button
              type="button"
              onClick={() => setEditorLang('en')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                editorLang === 'en'
                  ? 'bg-accent text-bg shadow-sm'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Metadatos y Cabecera del Documento Legal */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className={LABEL}>
                Insignia / Badge ({editorLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={
                  editorLang === 'en'
                    ? currentPage.badge_en || ''
                    : currentPage.badge || ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (editorLang === 'en') {
                    setCurrentPage({ ...currentPage, badge_en: val });
                  } else {
                    setCurrentPage({ ...currentPage, badge: val });
                  }
                }}
                placeholder={editorLang === 'en' ? 'LEGAL FRAMEWORK' : 'MARCO LEGAL'}
                className={INPUT}
              />
            </div>

            <div className="sm:col-span-5">
              <label className={LABEL}>
                Título Principal ({editorLang.toUpperCase()})
              </label>
              <input
                type="text"
                value={
                  editorLang === 'en'
                    ? currentPage.title_en || ''
                    : currentPage.title || ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (editorLang === 'en') {
                    setCurrentPage({ ...currentPage, title_en: val });
                  } else {
                    setCurrentPage({ ...currentPage, title: val });
                  }
                }}
                className={INPUT}
              />
            </div>

            <div className="sm:col-span-3">
              <label className={LABEL}>Fecha de Revisión</label>
              <div className="relative">
                <input
                  type="date"
                  value={currentPage.lastUpdated || ''}
                  onChange={(e) =>
                    setCurrentPage({ ...currentPage, lastUpdated: e.target.value })
                  }
                  className={INPUT}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL}>
              Introducción Resumida ({editorLang.toUpperCase()})
            </label>
            <textarea
              rows={2}
              value={
                editorLang === 'en'
                  ? currentPage.intro_en || ''
                  : currentPage.intro || ''
              }
              onChange={(e) => {
                const val = e.target.value;
                if (editorLang === 'en') {
                  setCurrentPage({ ...currentPage, intro_en: val });
                } else {
                  setCurrentPage({ ...currentPage, intro: val });
                }
              }}
              placeholder="Declaración preliminar de validez institucional..."
              className={INPUT}
            />
          </div>
        </div>

        {/* Editor de Contenido Tipo Artículo (Tiptap / Rich Text) */}
        <div className="rounded-xl border border-border bg-surf/50 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className={LABEL}>
              Cuerpo del Documento Legal ({editorLang === 'en' ? 'Inglés' : 'Español'})
            </label>
            <span className="text-[10px] font-mono text-text-subtle">
              Editor WYSIWYG de Artículos · Encabezados H2/H3, Listas, Negritas, Enlaces y Tablas
            </span>
          </div>

          <div className="bg-card/40 rounded-xl border border-border/80 overflow-hidden">
            <TiptapEditor
              key={`${selectedSlug}-${editorLang}`}
              content={currentContentHtml}
              onChange={handleEditorChange}
              placeholder={`Redacta o pega el contenido completo de ${selectedMeta.label} en ${editorLang === 'en' ? 'inglés' : 'español'}...`}
            />
          </div>
        </div>

        {/* Mensaje de Confirmación */}
        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Página legal guardada correctamente y sincronizada en PostgreSQL.</span>
          </div>
        )}

        {/* Botón de Guardado */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Página Legal</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
