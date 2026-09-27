'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Radio,
  ExternalLink,
  Sparkles,
  Loader2,
  Tag,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Search,
  CalendarDays,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MarketNewsItem } from '@/app/api/news-agent/route';
import { compressAndOptimizeImage } from '@/components/admin/news-republish-dialog';
import { RADAR_CATEGORIES } from '@/lib/news/google-news-radar';

const OTROS_ID = 'otros';
const CATEGORY_OPTIONS = [
  { id: 'all', label: 'Todas las categorías' },
  ...RADAR_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
  { id: OTROS_ID, label: 'Otros (búsqueda puntual)' },
];

interface NewsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNews: (news: {
    title: string;
    excerpt: string;
    contentHtml: string;
    sourceName: string;
    sourceUrl: string;
    tags: string[];
    imageUrl?: string;
    category?: string;
  }) => void;
}

export function NewsAgentModal({ isOpen, onClose, onSelectNews }: NewsAgentModalProps) {
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [republishedId, setRepublishedId] = useState<string | null>(null);
  // Fecha local del navegador (no UTC) para que «hoy» sea el día que ve el editor.
  const todayLocal = new Date().toLocaleDateString('en-CA');
  const [selectedDate, setSelectedDate] = useState<string>(todayLocal);
  const [warning, setWarning] = useState<string | null>(null);
  const [composeError, setComposeError] = useState<string | null>(null);
  // Categoría del selector: 'all', una de las 10 del negocio, u «otros» (búsqueda puntual, nunca guardada).
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [otrosQuery, setOtrosQuery] = useState<string>('');

  const fetchNews = async (opts?: { date?: string; category?: string; q?: string }) => {
    const date = opts?.date ?? selectedDate;
    const category = opts?.category ?? selectedCategory;
    const q = category === OTROS_ID ? opts?.q ?? otrosQuery : undefined;

    if (category === OTROS_ID && !q?.trim()) return; // «Otros» solo busca cuando hay un término escrito.

    setLoading(true);
    setWarning(null);
    try {
      const params = new URLSearchParams({ date });
      if (category !== 'all') params.set('category', category);
      if (category === OTROS_ID && q) params.set('q', q.trim());

      const res = await fetch(`/api/news-agent?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNews(data.news || []);
        setWarning(data.warning || null);
      } else {
        setNews([]);
        setWarning(data.error || 'No se pudo cargar el radar.');
      }
    } catch (e) {
      console.error('Error fetching news radar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // «Otros» no se dispara solo: espera a que se escriba y se envíe el término puntual.
    if (isOpen && selectedCategory !== OTROS_ID) {
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDate, selectedCategory]);

  if (!isOpen) return null;

  // El buscador de texto libre solo afina dentro de lo ya traído para la categoría y fecha elegidas.
  const filtered = news.filter((item) => {
    if (searchQuery === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // El agente hace el trabajo completo (localiza el artículo, redacta el análisis, trae la imagen y
  // deja el enlace al artículo); el editor solo revisa y publica.
  const handleRepublicar = async (item: MarketNewsItem) => {
    setRepublishedId(item.id);
    setComposeError(null);
    try {
      const res = await fetch('/api/news-agent/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.sourceUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'No se pudo preparar la noticia.');

      let imageUrl: string | undefined = data.imageUrl;
      if (imageUrl && data.imageNeedsCompression) imageUrl = await compressAndOptimizeImage(imageUrl);

      onSelectNews({
        title: data.title,
        excerpt: data.excerpt,
        contentHtml: data.contentHtml,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        tags: data.tags?.length ? data.tags : item.tags,
        imageUrl,
        category: item.category,
      });
      if (Array.isArray(data.warnings) && data.warnings.length > 0) {
        window.alert(['Borrador preparado. Revisa antes de publicar:', ...data.warnings.map((w: string) => `- ${w}`)].join(String.fromCharCode(10)));
      }
      onClose();
    } catch (e) {
      setComposeError(e instanceof Error ? e.message : 'No se pudo preparar la noticia.');
    } finally {
      setRepublishedId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-[#0b1324] shadow-2xl overflow-hidden">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-card/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base text-text">
                  Agente de Inteligencia de Noticias Petroleras
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-accent/15 border border-accent/30 text-accent font-semibold">
                  RADAR AI 24/7
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Noticias sobre crudo, hidrocarburos, GLP, fletes y refino: hoy por defecto, o elige una fecha anterior para republicar.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surf transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 border-b border-border/60 bg-surf/40 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
              <input
                type="text"
                placeholder="Buscar por término, crudo, buque, refinería..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-card/80 border border-border text-text placeholder:text-text-subtle focus:outline-none focus:border-accent"
              />
            </div>

            <div className="relative min-w-[220px]">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Categoría de noticias"
                className="w-full appearance-none pl-9 pr-8 py-1.5 text-xs rounded-lg bg-card/80 border border-border text-text focus:outline-none focus:border-accent cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {selectedCategory === OTROS_ID && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchNews({ category: OTROS_ID, q: otrosQuery });
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                autoFocus
                placeholder="Escribe un término y pulsa Enter (búsqueda puntual, no se guarda)…"
                value={otrosQuery}
                onChange={(e) => setOtrosQuery(e.target.value)}
                maxLength={120}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-card/80 border border-accent/40 text-text placeholder:text-text-subtle focus:outline-none focus:border-accent"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!otrosQuery.trim() || loading}
                className="h-8 px-3 text-xs bg-accent text-bg hover:bg-accent-hover font-semibold shrink-0"
              >
                Buscar
              </Button>
            </form>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted">
              <CalendarDays className="w-3.5 h-3.5 text-accent" />
              <span>Fecha</span>
              <input
                type="date"
                value={selectedDate}
                max={todayLocal}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg bg-card/80 border border-border text-text focus:outline-none focus:border-accent [color-scheme:dark]"
                aria-label="Fecha de las noticias"
              />
            </label>
            {selectedDate !== todayLocal && (
              <button
                type="button"
                onClick={() => setSelectedDate(todayLocal)}
                className="text-[11px] font-mono text-accent hover:underline"
              >
                Volver a hoy
              </button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchNews()}
              disabled={loading || (selectedCategory === OTROS_ID && !otrosQuery.trim())}
              className="h-8 px-2.5 text-xs text-text-muted hover:text-accent"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar Radar
            </Button>
          </div>
        </div>

        {composeError && (
          <div className="mx-4 sm:mx-6 mt-3 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300" role="alert">
            {composeError}
          </div>
        )}

        {/* Lista de Noticias */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-xs font-mono">Escaneando portales internacionales de energía y commodities...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs space-y-1">
              <p>No se encontraron noticias con los filtros actuales para el {selectedDate}.</p>
              {warning && <p className="text-amber-400">{warning}</p>}
            </div>
          ) : (
            filtered.map((item) => (
              <Card
                key={item.id}
                className="p-4 sm:p-5 bg-card/60 border-border/80 hover:border-accent/50 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold">
                        {item.category}
                      </span>
                      <span className="text-text-subtle font-medium">·</span>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-muted hover:text-accent inline-flex items-center gap-1 font-semibold"
                      >
                        <span>{item.source}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-text-subtle font-medium">·</span>
                      <span className="text-text-subtle">
                        {new Date(item.publishedAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-sm sm:text-base text-text leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleRepublicar(item)}
                    disabled={republishedId !== null}
                    className="shrink-0 bg-accent hover:bg-accent-hover text-bg font-semibold text-xs shadow-sm inline-flex items-center gap-1.5"
                  >
                    {republishedId === item.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Leyendo y redactando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Redactar borrador con IA</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  {item.summary}
                </p>

                {/* Tags y Hashtags */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <Tag className="w-3 h-3 text-text-subtle shrink-0" />
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-surf/90 text-text-muted border border-border/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 border-t border-border/80 bg-card/40 flex items-center justify-between text-[11px] text-text-subtle">
          <span>
            {selectedDate === todayLocal
              ? 'Hoy: noticias de Google News. El agente redacta un borrador y una persona lo revisa antes de publicar.'
              : `Noticias de Google News publicadas el ${selectedDate}.`}
            {warning && filtered.length > 0 ? ` ${warning}` : ''}
          </span>
          <button onClick={onClose} className="hover:text-text font-mono">
            Cerrar [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
