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
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MarketNewsItem } from '@/app/api/news-agent/route';

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
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [republishedId, setRepublishedId] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news-agent');
      if (res.ok) {
        const data = await res.json();
        setNews(data.news || []);
      }
    } catch (e) {
      console.error('Error fetching news radar:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = news.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic =
      filterTopic === 'all' ||
      item.category.toLowerCase().includes(filterTopic.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(filterTopic.toLowerCase()));

    return matchesSearch && matchesTopic;
  });

  const handleRepublicar = (item: MarketNewsItem) => {
    setRepublishedId(item.id);
    const contentHtml = `
      ${item.content}
      <hr />
      <p style="font-size: 0.85em; color: #94a3b8; font-style: italic;">
        <strong>Fuente Original:</strong> Publicado por <a href="${item.sourceUrl}" target="_blank" rel="noopener noreferrer">${item.source}</a>. 
        Republicado con fines de análisis estratégico de mercado por Invest Oil LLC.
      </p>
    `.trim();

    onSelectNews({
      title: item.title,
      excerpt: item.summary,
      contentHtml,
      sourceName: item.source,
      sourceUrl: item.sourceUrl,
      tags: item.tags,
      imageUrl: item.imageUrl,
      category: item.category,
    });

    setTimeout(() => {
      onClose();
      setRepublishedId(null);
    }, 600);
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
                10 noticias clave en tiempo real sobre crudo, hidrocarburos, GLP, fletes y refino para republicar.
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
        <div className="p-4 border-b border-border/60 bg-surf/40 flex flex-wrap items-center gap-3">
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

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono pb-0.5">
            {[
              { id: 'all', label: 'Todas las Fuentes' },
              { id: 'Google News', label: 'Google News' },
              { id: 'BBC Mundo', label: 'BBC Mundo' },
              { id: 'Euronews', label: 'Euronews' },
              { id: 'EFE', label: 'Agencia EFE' },
              { id: 'Brent', label: 'Brent / WTI' },
              { id: 'Pet Coke', label: 'Pet Coke' },
              { id: 'EN590', label: 'Diésel EN590' },
              { id: 'Logística', label: 'Fletes VLCC' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterTopic(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  filterTopic === cat.id
                    ? 'bg-accent text-bg font-bold shadow-sm'
                    : 'bg-card/60 text-text-muted hover:text-text border border-border/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchNews}
            disabled={loading}
            className="h-8 px-2.5 text-xs text-text-muted hover:text-accent"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Radar
          </Button>
        </div>

        {/* Lista de Noticias */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-xs font-mono">Escaneando portales internacionales de energía y commodities...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs">
              No se encontraron noticias con los filtros actuales.
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
                    disabled={republishedId === item.id}
                    className="shrink-0 bg-accent hover:bg-accent-hover text-bg font-semibold text-xs shadow-sm inline-flex items-center gap-1.5"
                  >
                    {republishedId === item.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>¡Importado!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Republicar en Editor</span>
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
          <span>Fuente: Reuters Energy, S&P Platts, Argus Media & EIA Feed.</span>
          <button onClick={onClose} className="hover:text-text font-mono">
            Cerrar [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
