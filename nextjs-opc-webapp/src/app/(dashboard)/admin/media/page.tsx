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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
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
      const supabase = createClient();
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setMediaList(data);
      } else {
        // Fallback demo media
        setMediaList([
          {
            id: 'm-1',
            filename: 'investoil-seal.png',
            url: '/images/branding/seal-transparent.png',
            type: 'image',
            mime_type: 'image/png',
            size: 540000,
            alt_text: 'Sello Oficial Invest Oil LLC',
            created_at: new Date().toISOString(),
          },
          {
            id: 'm-2',
            filename: 'investoil-logo.png',
            url: '/images/branding/logo.png',
            type: 'image',
            mime_type: 'image/png',
            size: 210000,
            alt_text: 'Logotipo Principal Invest Oil LLC',
            created_at: new Date().toISOString(),
          },
          {
            id: 'm-3',
            filename: 'pet-coke-terminal.jpg',
            url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
            mime_type: 'image/jpeg',
            size: 420000,
            alt_text: 'Terminal de carga de Pet Coke',
            created_at: new Date().toISOString(),
          },
          {
            id: 'm-4',
            filename: 'oil-tanker-vessel.jpg',
            url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
            mime_type: 'image/jpeg',
            size: 680000,
            alt_text: 'Buque petrolero VLCC en alta mar',
            created_at: new Date().toISOString(),
          },
          {
            id: 'm-5',
            filename: 'refinery-complex.jpg',
            url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
            type: 'image',
            mime_type: 'image/jpeg',
            size: 510000,
            alt_text: 'Complejo de refinación petroquímica',
            created_at: new Date().toISOString(),
          },
        ]);
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
      const supabase = createClient();
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

      // Upload file to Supabase storage bucket 'media'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filename, file);

      let publicUrl = URL.createObjectURL(file);

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('media')
          .getPublicUrl(filename);
        if (urlData) publicUrl = urlData.publicUrl;
      }

      // Record in media table
      const newItem: MediaItem = {
        id: `m-${Date.now()}`,
        filename: file.name,
        url: publicUrl,
        type: file.type.startsWith('video') ? 'video' : 'image',
        mime_type: file.type,
        size: file.size,
        alt_text: file.name.split('.')[0],
        created_at: new Date().toISOString(),
      };

      try {
        await supabase.from('media').insert([
          {
            filename: newItem.filename,
            url: newItem.url,
            type: newItem.type,
            mime_type: newItem.mime_type,
            size: newItem.size,
            alt_text: newItem.alt_text,
          },
        ]);
      } catch (err) {
        console.warn('DB insert skipped in demo mode:', err);
      }

      setMediaList((prev) => [newItem, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este archivo de la biblioteca?')) return;
    try {
      const supabase = createClient();
      await supabase.from('media').delete().eq('id', id);
    } catch (e) {}
    setMediaList((prev) => prev.filter((m) => m.id !== id));
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
          {filteredMedia.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden group flex flex-col justify-between hover:border-accent/60 transition-all duration-200"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-surf/80">
                <img
                  src={item.url}
                  alt={item.alt_text || item.filename}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

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
          ))}
        </div>
      )}
    </div>
  );
}
