'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
  Video as VideoIcon,
  Play,
  X,
  Sparkles,
  Info,
  List as ListIcon,
  LayoutGrid,
  CalendarClock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatBytes, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { type MediaItem } from '@/types';

type ViewMode = 'grid' | 'list' | 'date';

function isVideoItem(item: MediaItem): boolean {
  return (
    item.type === 'video' ||
    (item.mime_type ? item.mime_type.startsWith('video/') : false) ||
    /\.(mp4|webm|mov|ogg|m4v)$/i.test(item.url) ||
    /\.(mp4|webm|mov|ogg|m4v)$/i.test(item.filename)
  );
}

/** Clave de agrupación por día en la zona horaria del navegador (no UTC), p.ej. 2026-09-27. */
function dayKey(iso: string | null | undefined): string {
  const d = iso ? new Date(iso) : new Date(0);
  return Number.isNaN(d.getTime()) ? 'sin-fecha' : d.toLocaleDateString('en-CA');
}

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [deduplicating, setDeduplicating] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDeduplicate = async () => {
    if (!window.confirm('¿Deseas buscar y eliminar archivos y logos duplicados en la base de datos?')) return;
    setDeduplicating(true);
    try {
      const res = await fetch('/api/media/deduplicate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`Deduplicación completada: Se eliminaron ${data.removedCount} elementos duplicados.`);
        await fetchMedia();
      } else {
        alert(`Error al deduplicar: ${data.error}`);
      }
    } catch {
      alert('Error al conectar con el servidor.');
    } finally {
      setDeduplicating(false);
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const file = files[0];

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Error al subir archivo');
      }

      await fetchMedia();
    } catch (err: any) {
      console.error('Error al subir:', err);
      alert(err.message || 'Error al subir archivo a la base de datos');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este archivo de la base de datos y del almacenamiento?')) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      setMediaList((prev) => prev.filter((m) => m.id !== id));
      setPreviewItem((cur) => (cur?.id === id ? null : cur));
    } catch (e) {
      console.error(e);
    }
  };

  const searchedMedia = useMemo(
    () =>
      mediaList.filter(
        (m) =>
          m.filename.toLowerCase().includes(search.toLowerCase()) ||
          (m.alt_text && m.alt_text.toLowerCase().includes(search.toLowerCase()))
      ),
    [mediaList, search]
  );

  // La vista «Por fecha» además filtra a un día concreto cuando se elige en el selector.
  const filteredMedia = useMemo(() => {
    if (viewMode !== 'date' || !dateFilter) return searchedMedia;
    return searchedMedia.filter((m) => dayKey(m.created_at) === dateFilter);
  }, [searchedMedia, viewMode, dateFilter]);

  const sortedByDateDesc = useMemo(
    () =>
      [...filteredMedia].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ),
    [filteredMedia]
  );

  // Agrupación por día para la vista «Por fecha» sin un día concreto elegido.
  const groupedByDay = useMemo(() => {
    const groups: { key: string; label: string; items: MediaItem[] }[] = [];
    for (const item of sortedByDateDesc) {
      const key = dayKey(item.created_at);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, label: item.created_at ? formatDate(item.created_at) : 'Sin fecha', items: [] };
        groups.push(group);
      }
      group.items.push(item);
    }
    return groups;
  }, [sortedByDateDesc]);

  const VIEW_OPTIONS: { id: ViewMode; label: string; icon: typeof ListIcon }[] = [
    { id: 'grid', label: 'Ver como tarjetas', icon: LayoutGrid },
    { id: 'list', label: 'Ver como lista', icon: ListIcon },
    { id: 'date', label: 'Ver por fecha', icon: CalendarClock },
  ];

  const rowActions = (item: MediaItem, size: 'sm' | 'xs' = 'sm') => {
    const iconCls = size === 'sm' ? 'w-4 h-4' : 'w-3.5 h-3.5';
    const btnCls = size === 'sm' ? 'p-2' : 'p-1.5';
    return (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleCopyUrl(item.id, item.url);
          }}
          className={cn(btnCls, 'rounded-lg bg-surf text-text hover:text-accent border border-border shadow-md transition-colors')}
          title="Copiar URL"
        >
          {copiedId === item.id ? <Check className={cn(iconCls, 'text-accent')} /> : <Copy className={iconCls} />}
        </button>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(btnCls, 'rounded-lg bg-surf text-text hover:text-accent border border-border shadow-md transition-colors')}
          title="Abrir en pestaña nueva"
        >
          <ExternalLink className={iconCls} />
        </a>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          className={cn(btnCls, 'rounded-lg bg-surf text-text hover:text-rose-400 border border-border shadow-md transition-colors')}
          title="Eliminar archivo"
        >
          <Trash2 className={iconCls} />
        </button>
      </>
    );
  };

  const renderGridCard = (item: MediaItem) => {
    const isVideo = isVideoItem(item);
    return (
      <div
        key={item.id}
        onClick={() => setPreviewItem(item)}
        className="overflow-hidden group flex flex-col rounded-lg border border-border bg-card hover:border-accent/60 transition-all duration-200 cursor-pointer"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-surf/80">
          {isVideo ? (
            <div
              className="relative w-full h-full bg-black/70 flex items-center justify-center"
              onMouseEnter={(e) => {
                const vid = e.currentTarget.querySelector('video');
                if (vid) vid.play().catch(() => {});
              }}
              onMouseLeave={(e) => {
                const vid = e.currentTarget.querySelector('video');
                if (vid) {
                  vid.pause();
                  vid.currentTime = 0;
                }
              }}
            >
              <video src={item.url} muted playsInline preload="metadata" loop className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                <div className="w-6 h-6 rounded-full bg-accent/90 text-bg flex items-center justify-center shadow-lg">
                  <Play className="w-3 h-3 ml-0.5 fill-current" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={item.url}
              alt={item.alt_text || item.filename}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              loading="lazy"
            />
          )}

          <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/70 text-[8px] font-mono text-amber-300 uppercase">
            {isVideo ? 'video' : 'img'}
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1 pointer-events-none group-hover:pointer-events-auto">
            {rowActions(item, 'xs')}
          </div>
        </div>

        <div className="px-1.5 py-1">
          <p className="text-[10px] text-text truncate" title={item.filename}>
            {item.filename}
          </p>
        </div>
      </div>
    );
  };

  const renderListRow = (item: MediaItem) => {
    const isVideo = isVideoItem(item);
    return (
      <div
        key={item.id}
        onClick={() => setPreviewItem(item)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-card hover:border-accent/50 transition-colors cursor-pointer"
      >
        <div className="w-10 h-10 shrink-0 rounded-md overflow-hidden bg-surf/80 border border-border/60 flex items-center justify-center">
          {isVideo ? (
            <VideoIcon className="w-4 h-4 text-text-subtle" />
          ) : (
            <img src={item.url} alt="" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLElement).style.display = 'none')} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-text truncate" title={item.filename}>
            {item.filename}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-text-subtle font-mono">
            <span className="uppercase">{isVideo ? 'video' : 'image'}</span>
            <span>·</span>
            <span>{formatBytes(item.size)}</span>
            {item.created_at && (
              <>
                <span>·</span>
                <span>{formatDate(item.created_at)}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">{rowActions(item, 'sm')}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Cabecera compacta: título, info y acciones en una sola fila */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Badge variant="accent" className="shrink-0">GESTIÓN DE ASSETS</Badge>
          <h1 className="font-heading font-extrabold text-lg sm:text-xl text-text truncate">Biblioteca de Medios</h1>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
              className="p-1 rounded text-text-subtle hover:text-accent transition-colors"
              aria-label="Especificaciones técnicas y persistencia"
              title="Especificaciones técnicas y persistencia"
            >
              <Info className="w-4 h-4" />
            </button>
            {showInfo && (
              <div className="absolute left-0 top-full mt-2 z-30 w-80 p-3.5 rounded-xl border border-border/80 bg-[#0d1627] shadow-2xl text-[11px] text-text-muted space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-text font-semibold pb-1.5 border-b border-border/50">
                  <span className="flex items-center gap-1.5 text-accent text-xs">
                    <Info className="w-3.5 h-3.5" /> Especificaciones y persistencia
                  </span>
                  <button type="button" onClick={() => setShowInfo(false)} className="text-text-subtle hover:text-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="leading-relaxed">
                  Los archivos subidos localmente quedan codificados y persistidos de forma duradera en PostgreSQL, sin
                  perderse en despliegues ni actualizaciones. Los videos o imágenes de internet se guardan como URL externa.
                </p>
                <div className="grid grid-cols-1 gap-1.5 pt-1 font-mono">
                  <div className="p-2 rounded-lg border border-border/60 bg-card/60">
                    <span className="text-text font-bold block mb-0.5">📸 Imágenes:</span>
                    JPG, PNG, WebP, SVG, GIF — <strong className="text-accent">Máx. 2 MB</strong>
                  </div>
                  <div className="p-2 rounded-lg border border-border/60 bg-card/60">
                    <span className="text-text font-bold block mb-0.5">🎬 Videos:</span>
                    MP4, WebM, MOV (H.264/AAC) — <strong className="text-accent">Máx. 10 MB</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDeduplicate}
            disabled={deduplicating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/80 bg-card/60 hover:bg-card text-text text-xs font-semibold transition-all disabled:opacity-50"
            title="Buscar y limpiar archivos y logos repetidos en la base de datos"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{deduplicating ? 'Deduplicando...' : 'Deduplicar Medios'}</span>
          </button>

          <label className="cursor-pointer">
            <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-bg text-xs font-bold shadow-glow-accent hover:shadow-glow-neon transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Buscador + vista + contador */}
      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="relative flex-1 min-w-[220px]">
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-surf/60">
          {VIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = viewMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setViewMode(opt.id)}
                aria-label={opt.label}
                title={opt.label}
                className={cn(
                  'p-1.5 rounded-md transition-colors',
                  active ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text hover:bg-card'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {viewMode === 'date' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Filtrar por fecha de subida"
              className="px-2 py-1.5 text-xs rounded-lg bg-card/80 border border-border text-text focus:outline-none focus:border-accent [color-scheme:dark]"
            />
            {dateFilter && (
              <button type="button" onClick={() => setDateFilter('')} className="text-[11px] font-mono text-accent hover:underline">
                Todas las fechas
              </button>
            )}
          </div>
        )}

        <div className="text-xs text-text-muted font-mono ml-auto">{filteredMedia.length} archivos</div>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="p-16 text-center text-xs text-text-muted">Cargando archivos multimedia...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-16 text-center space-y-2 border border-border rounded-xl bg-card">
          <ImageIcon className="w-10 h-10 text-border mx-auto" />
          <p className="text-sm font-semibold text-text">No se encontraron archivos</p>
          <p className="text-xs text-text-muted">Sube tu primera imagen o video usando el botón superior.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
          {sortedByDateDesc.map(renderGridCard)}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-1.5">{sortedByDateDesc.map(renderListRow)}</div>
      ) : dateFilter ? (
        <div className="space-y-1.5">{sortedByDateDesc.map(renderListRow)}</div>
      ) : (
        <div className="space-y-5">
          {groupedByDay.map((group) => (
            <div key={group.key} className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-text-subtle">
                <CalendarClock className="w-3.5 h-3.5 text-accent" />
                <span>{group.label}</span>
                <span className="text-text-subtle/70">({group.items.length})</span>
              </div>
              <div className="space-y-1.5">{group.items.map(renderListRow)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Popup de Previsualización (imagen o video) */}
      {previewItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setPreviewItem(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-border bg-surf shadow-2xl p-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-3 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {isVideoItem(previewItem) ? (
                  <VideoIcon className="w-4 h-4 text-accent shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-accent shrink-0" />
                )}
                <span className="text-xs font-mono font-semibold text-text truncate">{previewItem.filename}</span>
                <span className="text-[10px] font-mono text-text-subtle shrink-0">({formatBytes(previewItem.size)})</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 rounded-lg bg-card text-text-muted hover:text-text hover:bg-card/80 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              {isVideoItem(previewItem) ? (
                <video src={previewItem.url} controls autoPlay playsInline preload="auto" className="w-full h-full object-contain" />
              ) : (
                <img src={previewItem.url} alt={previewItem.alt_text || previewItem.filename} className="w-full h-full object-contain" />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-text-subtle font-mono truncate max-w-md">URL: {previewItem.url}</span>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" onClick={() => handleCopyUrl(previewItem.id, previewItem.url)} className="text-xs">
                  {copiedId === previewItem.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-accent" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span>Copiar URL</span>
                    </>
                  )}
                </Button>
                <a
                  href={previewItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-text-muted hover:text-accent text-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(previewItem.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card text-text-muted hover:text-rose-400 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
