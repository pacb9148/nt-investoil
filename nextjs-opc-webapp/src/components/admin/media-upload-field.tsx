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

export function MediaUploadField({
  label,
  name,
  value,
  onChange,
  accept = 'all',
  placeholder = 'https://... o /uploads/... o seleccione un archivo',
  description,
  showPreview = true,
  className,
}: MediaUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLocalDiskPath = /^[a-zA-Z]:[\\/]/.test((value || '').trim());

  const acceptMime =
    accept === 'video'
      ? 'video/mp4,video/webm,video/mov'
      : accept === 'image'
      ? 'image/jpeg,image/png,image/webp,image/svg+xml,image/gif'
      : 'image/*,video/mp4,video/webm,video/mov';

  const isVideo =
    /\.(mp4|webm|mov|ogg)$/i.test(value || '') ||
    (value || '').includes('/video/') ||
    accept === 'video';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErr(null);
    setMsg(null);

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
      setMsg(`✓ Archivo "${file.name}" cargado`);
      setTimeout(() => setMsg(null), 4000);
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
      setMsg(`✓ Archivo importado correctamente`);
      setTimeout(() => setMsg(null), 4000);
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

        {/* Input oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={acceptMime}
          className="hidden"
        />

        {/* Botón Buscar / Seleccionar Archivo */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-[11px] font-semibold transition-all disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Cargando...</span>
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
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={INPUT_STYLE}
        />

        {isLocalDiskPath && (
          <button
            type="button"
            onClick={handleImportLocal}
            disabled={uploading}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
            title="Importar archivo del disco local"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Importar</span>
          </button>
        )}

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 rounded-lg border border-border bg-card/50 text-text-subtle hover:text-text transition-colors"
            title="Limpiar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {description && <p className="text-[11px] text-text-subtle">{description}</p>}

      {msg && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {err && (
        <div className="flex items-center gap-1.5 p-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{err}</span>
        </div>
      )}

      {/* Previsualización en Vivo */}
      {showPreview && value && !isLocalDiskPath && (
        <div className="mt-2 p-2.5 rounded-lg border border-border/70 bg-black/40 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-text-muted">
            <span className="flex items-center gap-1 text-accent">
              {isVideo ? <FileVideo className="w-3 h-3" /> : <FileImage className="w-3 h-3" />}
              <span>Vista previa ({isVideo ? 'Video' : 'Imagen'}):</span>
            </span>
            <span className="text-text-subtle truncate max-w-xs">{value}</span>
          </div>

          <div className="relative w-full h-36 rounded-md overflow-hidden bg-black/60 flex items-center justify-center border border-border/40">
            {isVideo ? (
              <video
                key={value}
                src={value}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
