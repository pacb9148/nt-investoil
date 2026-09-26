import React, { useState } from 'react';
import Image from 'next/image';
import { Newspaper, Sparkles, ExternalLink, AlertCircle, CheckCircle2, Video, Shrink } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type NewsRepublishMetadata } from '@/types';

async function compressAndOptimizeImage(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      img.onload = async () => {
        try {
          const maxDim = 1600;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(imageUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(async (blob) => {
            if (!blob) {
              resolve(imageUrl);
              return;
            }
            try {
              const formData = new FormData();
              formData.append('file', blob, `news-${Date.now()}.jpg`);
              const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
              });
              if (uploadRes.ok) {
                const uploadData = await uploadRes.json();
                if (uploadData.url) {
                  resolve(uploadData.url);
                  return;
                }
              }
            } catch {
              // Si falla la subida a /api/upload, usar la URL original
            }
            resolve(imageUrl);
          }, 'image/jpeg', 0.85);
        } catch {
          resolve(imageUrl);
        }
      };
      img.onerror = () => resolve(imageUrl);
    } catch {
      resolve(imageUrl);
    }
  });
}

export function NewsRepublishDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (meta: NewsRepublishMetadata) => void;
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizingImage, setOptimizingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<NewsRepublishMetadata | null>(null);

  const handleFetchMetadata = async () => {
    if (!url || !url.startsWith('http')) {
      setError('Por favor introduce una URL válida que empiece por http:// o https://');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news-republish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudieron extraer los metadatos de la URL');
      }

      const meta: NewsRepublishMetadata = await res.json();
      setPreview(meta);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servicio de scraping');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;

    let finalMeta = { ...preview };

    // Si la imagen supera 2MB o se solicita optimización, comprimirla con canvas
    if (preview.imageUrl && (preview.imageNeedsCompression || preview.imageUrl.startsWith('http'))) {
      setOptimizingImage(true);
      try {
        const optimizedUrl = await compressAndOptimizeImage(preview.imageUrl);
        finalMeta.imageUrl = optimizedUrl;
      } catch (e) {
        console.warn('Compresión omitida por política CORS, usando URL remota:', e);
      } finally {
        setOptimizingImage(false);
      }
    }

    onImport(finalMeta);
    onOpenChange(false);
    setPreview(null);
    setUrl('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Republicar Noticia de Energía / Petróleo"
      description="Introduce la URL de una noticia externa para extraer automáticamente metadatos OpenGraph y preparar un nuevo post atribuido."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            label="URL de la Noticia"
            placeholder="https://www.reuters.com/business/energy/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleFetchMetadata}
            isLoading={loading}
            className="w-full gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Extraer Metadatos</span>
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {preview && (
          <div className="p-4 rounded-xl border border-border bg-surf space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <Badge variant="warm">METADATOS DETECTADOS</Badge>
              <span className="text-xs font-mono text-accent">
                {preview.sourceName}
              </span>
            </div>

            {preview.imageUrl && (
              <div className="space-y-1.5">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                  <Image
                    src={preview.imageUrl}
                    alt={preview.title}
                    fill
                    className="object-cover"
                  />
                </div>
                {preview.imageNeedsCompression && (
                  <p className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <Shrink className="w-3 h-3" />
                    <span>Imagen externa &gt; 2 MB detectada: Se reducirá automáticamente antes de integrarla.</span>
                  </p>
                )}
              </div>
            )}

            {preview.videoUrl && (
              <div className="p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-cyan-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate max-w-[280px]">Video detectado en la fuente original</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/80">Vista previa externa</span>
              </div>
            )}

            <div>
              <h4 className="font-heading font-bold text-sm text-text">
                {preview.title}
              </h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-3">
                {preview.excerpt}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <a
                href={preview.canonicalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-mono text-text-subtle hover:text-accent flex items-center gap-1"
              >
                <span>Fuente canónica</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={handleConfirm}
                className="gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cargar en Editor</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
