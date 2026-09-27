'use client';

import React from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EditLang = 'es' | 'en';

export interface AdminEditorToolbarProps {
  langTab: EditLang;
  onLangChange: (lang: EditLang) => void;
  onSave: () => void;
  saving: boolean;
  saved?: boolean;
  error?: string | null;
  saveLabel?: string;
  savingLabel?: string;
  savedLabel?: string;
  /** Contenido extra a la izquierda del selector de idioma (p.ej. un botón «Añadir»). */
  extraActions?: React.ReactNode;
}

/**
 * Barra fija (idioma de edición + guardar) para todos los formularios de contenido del backoffice:
 * se queda visible al hacer scroll, así el operador nunca pierde de vista con qué idioma está
 * trabajando ni tiene que bajar hasta el final para guardar.
 */
export function AdminEditorToolbar({
  langTab,
  onLangChange,
  onSave,
  saving,
  saved,
  error,
  saveLabel = 'Guardar Cambios',
  savingLabel = 'Guardando...',
  savedLabel = '¡Guardado!',
  extraActions,
}: AdminEditorToolbarProps) {
  return (
    <div className="sticky top-0 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-bg/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">{extraActions}</div>

        <div className="flex items-center gap-2.5 ml-auto">
          {error && (
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] text-rose-400 font-mono max-w-xs truncate" title={error}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </span>
          )}

          <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 text-xs font-mono">
            <Languages className="w-3.5 h-3.5 text-accent mx-1.5 shrink-0" />
            <button
              type="button"
              onClick={() => onLangChange('es')}
              className={cn(
                'px-3 py-1.5 rounded font-semibold transition-all',
                langTab === 'es' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              Español (ES)
            </button>
            <button
              type="button"
              onClick={() => onLangChange('en')}
              className={cn(
                'px-3 py-1.5 rounded font-semibold transition-all',
                langTab === 'en' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              English (EN)
            </button>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{savingLabel}</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{savedLabel}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{saveLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
