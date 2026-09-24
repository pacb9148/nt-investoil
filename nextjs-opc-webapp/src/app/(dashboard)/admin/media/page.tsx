'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  Trash2,
  Check,
  Search,
  ExternalLink,
  Plus,
  Video as VideoIcon,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatBytes, formatDate } from '@/lib/utils';
import { type MediaItem } from '@/types';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMedia = mediaList.filter((m) =>
    m.filename.toLowerCase().includes(search.toLowerCase()) ||
    (m.alt_text && m.alt_text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Badge variant="accent">GESTIÓN DE ASSETS</Badge>
          <h1 className="font-heading font-extrabold text-2xl text-text mt-1">
            Biblioteca de Medios
          </h1>
          <p className="text-xs text-text-muted">
            Sube y administra imágenes de productos, logos, certificados e infografías.
          </p>
        </div>

        {/* Upload Trigger */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-bg text-xs font-bold shadow-glow-accent hover:shadow-glow-neon transition-all">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Subiendo...' : 'Subir Archivo'}</span>
          </div>
        </label>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
        <div className="relative w-full max-w-sm">
          <Input
            placeholder="Buscar por nombre o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-2.5 pointer-events-none" />
        </div>
        <div className="text-xs text-text-muted font-mono">
          {filteredMedia.length} archivos
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-text-muted">
          Cargando archivos multimedia...
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="p-16 text-center space-y-2 border border-border rounded-xl bg-card">
          <ImageIcon className="w-10 h-10 text-border mx-auto" />
          <p className="text-sm font-semibold text-text">No se encontraron archivos</p>
          <p className="text-xs text-text-muted">Sube tu primera imagen usando el botón superior.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => {
            const isVideo = item.type === 'video' || /\.(mp4|webm|mov|ogg)$/i.test(item.url) || /\.(mp4|webm|mov|ogg)$/i.test(item.filename);

            return (
              <Card
                key={item.id}
                className="overflow-hidden group flex flex-col justify-between hover:border-accent/60 transition-all duration-200"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-surf/80">
                  {isVideo ? (
                    <div className="relative w-full h-full bg-black/60 flex items-center justify-center">
                      <video
                        src={item.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 border border-accent/40 text-[9px] font-mono text-accent flex items-center gap-1 z-10">
                        <VideoIcon className="w-3 h-3" />
                        <span>VIDEO</span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-accent/90 text-bg flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 ml-0.5 fill-current" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback si la imagen no carga
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}

                {/* Hover overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.id, item.url)}
                    className="p-2 rounded-lg bg-surf text-text hover:text-accent border border-border shadow-md"
                    title="Copiar URL"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-surf text-text hover:text-accent border border-border shadow-md"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-surf text-text hover:text-rose-400 border border-border shadow-md"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-text truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-text-subtle font-mono">
                  <span>{formatBytes(item.size)}</span>
                  <span>{item.type}</span>
                </div>
              </div>
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}
