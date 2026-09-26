'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Upload,
  X,
  FileImage,
  FileVideo,
  Check,
  Loader2,
  FolderOpen,
  Sparkles,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/utils';
import type { MediaItem } from '@/types';
import { cn } from '@/lib/utils';

export interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
  accept?: 'all' | 'image' | 'video';
  title?: string;
  initialSearch?: string;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  onSelect,
  accept = 'all',
  title = 'Biblioteca de Medios & Assets',
  initialSearch = '',
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'logo'>(
    accept === 'video' ? 'video' : accept === 'image' ? 'image' : 'all'
  );
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMediaList(data);
        }
      }
    } catch (e) {
      console.error('Error fetching media library:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSelectedItem(null);
    }
  }, [open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al subir archivo');
      }

      await fetchMedia();

      // Autoseleccionar el nuevo elemento subido
      const newItem: MediaItem = {
        id: data.id || `m-${Date.now()}`,
        filename: data.filename || file.name,
        url: data.url,
        type: data.mediaType || (file.type.startsWith('video/') ? 'video' : 'image'),
        mime_type: file.type,
        size: file.size,
        alt_text: file.name,
        created_at: new Date().toISOString(),
      };
      setSelectedItem(newItem);
    } catch (err: any) {
      alert(err.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmSelect = (item: MediaItem) => {
    onSelect(item);
    onOpenChange(false);
  };

  // Filtrado reactivo en memoria
  const filteredList = mediaList.filter((item) => {
    // 1. Filtro por tipo
    if (accept === 'image' && item.type !== 'image') return false;
    if (accept === 'video' && item.type !== 'video') return false;

    if (filterType === 'image' && item.type !== 'image') return false;
    if (filterType === 'video' && item.type !== 'video') return false;
    if (filterType === 'logo') {
      const q = (item.filename + ' ' + (item.alt_text || '') + ' ' + item.url).toLowerCase();
      const isLogo = q.includes('logo') || q.includes('seal') || q.includes('sello') || q.includes('branding') || q.endsWith('.svg');
      if (!isLogo) return false;
    }

    // 2. Filtro por texto de búsqueda
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        item.filename.toLowerCase().includes(q) ||
        (item.alt_text && item.alt_text.toLowerCase().includes(q)) ||
        item.url.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Selecciona un recurso multimedia ya existente en la biblioteca para reutilizarlo en la web sin duplicar archivos."
      className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden bg-[#0a1120] border-border/80 shadow-2xl"
    >
      {/* Barra de Controles: Búsqueda, Filtros y Botón de Subir */}
      <div className="space-y-3 pt-2 pb-3 border-b border-border/70">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, logo, producto, formato..."
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-card/80 border border-border text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Acciones Superiores */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={fetchMedia}
              disabled={loading}
              className="p-2 rounded-lg border border-border bg-card/60 text-text-subtle hover:text-accent transition-colors"
              title="Recargar biblioteca"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin text-accent')} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={accept === 'video' ? 'video/*' : accept === 'image' ? 'image/*' : 'image/*,video/*'}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-bg text-xs font-bold shadow-glow-accent hover:shadow-glow-neon transition-all disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Nuevo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pestañas de Filtro Rápido */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-colors border',
              filterType === 'all'
                ? 'bg-accent/20 border-accent text-accent font-semibold'
                : 'bg-card/40 border-border text-text-subtle hover:text-text'
            )}
          >
            Todos ({mediaList.length})
          </button>
          {accept !== 'video' && (
            <button
              type="button"
              onClick={() => setFilterType('logo')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors border flex items-center gap-1',
                filterType === 'logo'
                  ? 'bg-accent/20 border-accent text-accent font-semibold'
                  : 'bg-card/40 border-border text-text-subtle hover:text-text'
              )}
            >
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              <span>Logos & Identidad</span>
            </button>
          )}
          {accept !== 'video' && (
            <button
              type="button"
              onClick={() => setFilterType('image')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors border flex items-center gap-1',
                filterType === 'image'
                  ? 'bg-accent/20 border-accent text-accent font-semibold'
                  : 'bg-card/40 border-border text-text-subtle hover:text-text'
              )}
            >
              <FileImage className="w-3 h-3 text-sky-400" />
              <span>Solo Imágenes</span>
            </button>
          )}
          {accept !== 'image' && (
            <button
              type="button"
              onClick={() => setFilterType('video')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors border flex items-center gap-1',
                filterType === 'video'
                  ? 'bg-accent/20 border-accent text-accent font-semibold'
                  : 'bg-card/40 border-border text-text-subtle hover:text-text'
              )}
            >
              <FileVideo className="w-3 h-3 text-teal-400" />
              <span>Solo Videos</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Medios con Scroll */}
      <div className="flex-1 overflow-y-auto py-3 min-h-[300px] max-h-[50vh] pr-1">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-text-subtle">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs font-mono">Consultando base de datos de medios...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3 text-center p-6 border border-dashed border-border/70 rounded-xl bg-card/20">
            <FolderOpen className="w-10 h-10 text-text-subtle" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-text">No se encontraron archivos en la biblioteca</p>
              <p className="text-[11px] text-text-muted">
                {search ? 'No hay coincidencias con la búsqueda actual.' : 'Aún no se han registrado archivos en esta categoría.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/40 text-accent text-xs font-medium hover:bg-accent/30 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir archivo a la biblioteca</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredList.map((item) => {
              const isSelected = selectedItem?.id === item.id || selectedItem?.url === item.url;
              const isVideo = item.type === 'video' || /\.(mp4|webm|mov)$/i.test(item.url);

              return (
                <div
                  key={item.id || item.url}
                  onClick={() => setSelectedItem(item)}
                  onDoubleClick={() => handleConfirmSelect(item)}
                  className={cn(
                    'group relative rounded-xl border p-2 bg-card/60 transition-all cursor-pointer flex flex-col justify-between hover:border-accent hover:shadow-glow-accent/20',
                    isSelected
                      ? 'border-accent bg-accent/10 ring-2 ring-accent/50 shadow-md'
                      : 'border-border/70 hover:bg-card'
                  )}
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-black/50 border border-border/40 flex items-center justify-center">
                    {isVideo ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#070e1b]">
                        <FileVideo className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-[10px] font-mono text-text-muted truncate max-w-full px-1">
                          {item.filename}
                        </span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.url}
                        alt={item.alt_text || item.filename}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback si la imagen no carga
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    )}

                    {/* Badge de tipo */}
                    <div className="absolute top-1 left-1 flex items-center gap-1">
                      <span className="text-[9px] font-mono uppercase px-1 py-0.5 rounded bg-black/70 text-text font-medium backdrop-blur-xs">
                        {isVideo ? 'Video' : 'Imagen'}
                      </span>
                    </div>

                    {/* Check de selección */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-accent text-bg flex items-center justify-center shadow-md animate-in zoom-in-50">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Metadatos */}
                  <div className="mt-2 space-y-0.5">
                    <p className="text-[11px] font-medium text-text truncate group-hover:text-accent transition-colors" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-text-subtle">
                      <span>{item.size ? formatBytes(item.size) : 'Web'}</span>
                      {item.alt_text && (
                        <span className="truncate max-w-[80px]" title={item.alt_text}>
                          {item.alt_text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer del Modal: Selección Activa y Botones */}
      <div className="pt-3 border-t border-border/70 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-text-muted flex items-center gap-2 truncate max-w-full">
          {selectedItem ? (
            <>
              <span className="text-accent font-mono font-semibold">Seleccionado:</span>
              <span className="truncate text-text font-medium max-w-xs">{selectedItem.filename}</span>
              <span className="text-[10px] font-mono text-text-subtle">({selectedItem.url})</span>
            </>
          ) : (
            <span className="text-[11px] text-text-subtle">
              Haz clic en cualquier imagen o video para seleccionarlo (o doble clic para asignar directamente).
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-border bg-card/60 text-xs font-semibold text-text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => selectedItem && handleConfirmSelect(selectedItem)}
            disabled={!selectedItem}
            className="px-5 py-2 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Usar este recurso</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
