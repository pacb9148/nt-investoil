'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeleteMediaFileButtonProps {
  /** URL del archivo (solo se puede eliminar de la biblioteca lo que vive en /uploads/). */
  url: string;
  /** Se llama tras borrarlo del servidor y de la base de datos, para vaciar el campo que lo usaba. */
  onDeleted: () => void;
  label?: string;
  className?: string;
}

/**
 * Elimina de forma definitiva un archivo de la biblioteca (disco + base de datos), avisando antes
 * de las secciones donde todavía se usa. Los archivos externos o estáticos (/images, http…) no
 * se pueden borrar desde aquí: para ellos basta con limpiar el campo.
 */
export function DeleteMediaFileButton({
  url,
  onDeleted,
  label = 'Eliminar archivo',
  className,
}: DeleteMediaFileButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!url || !url.startsWith('/uploads/')) return null;

  const fileName = url.split('/').pop() || url;

  const handleClick = async () => {
    setError(null);
    setBusy(true);
    try {
      let usedIn: string[] = [];
      try {
        const usageRes = await fetch(`/api/media/usage?url=${encodeURIComponent(url)}`);
        if (usageRes.ok) usedIn = (await usageRes.json()).usedIn || [];
      } catch {
        // Sin el aviso de uso se puede seguir: la confirmación sigue siendo explícita.
      }

      const usage = usedIn.length
        ? `\n\nAtención: este archivo aparece en: ${usedIn.join(', ')}. Tras borrarlo esas secciones mostrarán la imagen rota hasta que elijas otra.`
        : '';
      if (
        !window.confirm(
          `¿Eliminar definitivamente "${fileName}" de la biblioteca y de la base de datos? Esta acción no se puede deshacer.${usage}`
        )
      ) {
        return;
      }

      const res = await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo eliminar el archivo.');
      }
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el archivo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-500/40 bg-red-950/40 text-red-300 hover:bg-red-900/60 hover:text-red-100 text-[11px] font-semibold transition-colors disabled:opacity-50',
          className
        )}
        title="Eliminar este archivo de la biblioteca y de la base de datos"
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
        <span>{busy ? 'Eliminando...' : label}</span>
      </button>
      {error && <span className="text-[10px] text-rose-400">{error}</span>}
    </span>
  );
}
