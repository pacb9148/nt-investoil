'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderOpen,
  FileVideo,
  FileImage,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MediaUploadFieldProps {
  label?: string;
  name?: string;
  value: string;
  onChange: (url: string, mediaType?: 'image' | 'video') => void;
  accept?: 'all' | 'image' | 'video';
  placeholder?: string;
  description?: string;
  showPreview?: boolean;
  className?: string;
}

const INPUT_STYLE =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-accent transition-colors';
const LABEL_STYLE = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5';

const MAX_IMAGE_SIZE_MB = 2;
const MAX_VIDEO_SIZE_MB = 10;

export function MediaUploadField({
  label,
  name,
  value,
  onChange,
  accept = 'all',
  placeholder = 'https://... o /uploads/... o examine un archivo',
  description,
  showPreview = true,
  className,
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocalDiskPath = /^[a-zA-Z]:[\\/]/.test((value || '').trim());

  const isVideo =
    /\.(mp4|webm|mov|ogg)$/i.test(value || '') ||
    (value || '').includes('/video/') ||
    accept === 'video';

  const acceptMime =
    accept === 'video'
      ? 'video/mp4,video/webm,video/quicktime'
      : accept === 'image'
      ? 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif'
      : 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif,video/mp4,video/webm,video/quicktime';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const isVid = file.type.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext);
    const isImg = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext);

    // Validación de formato antes de subir
    if (!isVid && !isImg) {
      setErr(`Formato "${ext}" no permitido. Formatos soportados: Imágenes (JPG, PNG, WebP, SVG, GIF) y Videos (MP4, WebM, MOV).`);
      return;
    }

    // Validación de tamaño antes de subir
    const fileSizeMB = file.size / (1024 * 1024);
    if (isImg && fileSizeMB > MAX_IMAGE_SIZE_MB) {
      setErr(`La imagen pesa ${fileSizeMB.toFixed(1)} MB y supera el tamaño máximo permitido de ${MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }
    if (isVid && fileSizeMB > MAX_VIDEO_SIZE_MB) {
      setErr(`El video pesa ${fileSizeMB.toFixed(1)} MB y supera el tamaño máximo permitido de ${MAX_VIDEO_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    setErr(null);
    setMsg(null);
    setPreviewError(false);

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

      onChange(data.url, data.mediaType);
      setMsg(`✓ Archivo guardado en base de datos correctamente (${(file.size / 1024).toFixed(0)} KB)`);
      setTimeout(() => setMsg(null), 5000);
    } catch (e: any) {
      setErr(e.message || 'Error al procesar archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportLocal = async () => {
    if (!value || !value.trim()) return;

    setUploading(true);
    setErr(null);
    setMsg(null);
    setPreviewError(false);

    try {
      const res = await fetch('/api/upload/from-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localPath: value }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo importar');
      }

      onChange(data.url, data.mediaType);
      setMsg(`✓ Archivo importado y guardado en base de datos`);
      setTimeout(() => setMsg(null), 5000);
    } catch (e: any) {
      setErr(e.message || 'Error al importar archivo local');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        {label && <label className={LABEL_STYLE}>{label}</label>}

        {/* Input file nativo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={acceptMime}
          className="hidden"
        />

        {/* Botón Seleccionar Archivo Local */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-[11px] font-semibold transition-all disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Guardando en BD...</span>
            </>
          ) : (
            <>
              <Upload className="w-3 h-3" />
              <span>Examinar archivo local...</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            setPreviewError(false);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className={INPUT_STYLE}
        />

        {isLocalDiskPath && (
          <button
            type="button"
            onClick={handleImportLocal}
            disabled={uploading}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
            title="Importar archivo del disco local a la base de datos"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Importar</span>
          </button>
        )}

        {value && (
          <button
            type="button"
            onClick={() => {
              setPreviewError(false);
              onChange('');
            }}
            className="p-2 rounded-lg border border-border bg-card/50 text-text-subtle hover:text-text transition-colors"
            title="Limpiar campo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {description && <p className="text-[11px] text-text-subtle">{description}</p>}

      {/* Leyenda obligatoria de especificaciones y límites */}
      <div className="p-2.5 rounded-lg border border-border/70 bg-surf/60 space-y-1 text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5 font-semibold text-text">
          <Info className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>Formatos permitidos y límites de almacenamiento:</span>
        </div>
        <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10px] text-text-subtle font-mono">
          <li>
            <strong className="text-text">Imágenes:</strong> JPG, JPEG, PNG, WebP, SVG, GIF (Máx. <span className="text-amber-400">2 MB</span>)
          </li>
          <li>
            <strong className="text-text">Videos:</strong> MP4, WebM, MOV (Máx. <span className="text-amber-400">10 MB</span>)
          </li>
          <li className="text-[10px] text-text-muted font-sans pt-0.5">
            Los archivos subidos se almacenan en la <span className="text-accent font-semibold">base de datos</span> para persistir entre deploys. Si introduces una URL de internet (HTTPS), se guardará el enlace directo.
          </li>
        </ul>
      </div>

      {msg && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {err && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* Previsualización en Vivo con Fallback Amigable */}
      {showPreview && value && !isLocalDiskPath && (
        <div className="mt-2 p-2.5 rounded-lg border border-border/70 bg-black/40 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1 text-accent">
              {isVideo ? <FileVideo className="w-3 h-3" /> : <FileImage className="w-3 h-3" />}
              <span>Vista previa ({isVideo ? 'Video' : 'Imagen'}):</span>
            </span>
            <div className="flex items-center gap-2 max-w-xs truncate">
              <span className="text-text-subtle truncate">{value}</span>
              {value.startsWith('http') && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline inline-flex items-center"
                  title="Abrir enlace externo"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <div className="relative w-full h-40 rounded-md overflow-hidden bg-black/60 flex items-center justify-center border border-border/40">
            {previewError ? (
              <div className="p-4 text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-xs font-semibold text-text">No se pudo cargar la vista previa</p>
                <p className="text-[10px] text-text-subtle">
                  Compruebe la ruta del archivo o que la extensión sea compatible (.jpg, .png, .mp4...).
                </p>
              </div>
            ) : isVideo ? (
              <video
                key={value}
                src={value}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
                onError={() => setPreviewError(true)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={value}
                src={value}
                alt="Vista previa"
                className="w-full h-full object-contain"
                onError={() => setPreviewError(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
