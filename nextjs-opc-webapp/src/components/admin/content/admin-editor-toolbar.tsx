'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  /** Contenido extra (p.ej. un botón «Añadir») que se muestra dentro de la página, no en la topbar. */
  extraActions?: React.ReactNode;
}

const TOPBAR_SLOT_ID = 'admin-topbar-actions';

/**
 * Selector de idioma de edición + botón de guardar para todos los formularios de contenido del
 * backoffice. En vez de una barra propia, se inyecta por portal en la topbar fija (junto a la
 * identidad del usuario conectado) para que quede siempre visible sin duplicar barras al hacer scroll.
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
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(TOPBAR_SLOT_ID));
  }, []);

  const actions = (
    <>
      {error && (
        <span
          className="hidden lg:flex items-center gap-1.5 text-[11px] text-rose-400 font-mono max-w-[220px] truncate"
          title={error}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}

      <div className="inline-flex items-center rounded-lg border border-border bg-card p-0.5 text-xs font-mono font-bold">
        <button
          type="button"
          onClick={() => onLangChange('es')}
          className={cn(
            'px-2.5 py-1.5 rounded transition-all',
            langTab === 'es' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
          )}
        >
          ES
        </button>
        <span className="text-border">|</span>
        <button
          type="button"
          onClick={() => onLangChange('en')}
          className={cn(
            'px-2.5 py-1.5 rounded transition-all',
            langTab === 'en' ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text'
          )}
        >
          EN
        </button>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50 shrink-0"
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
    </>
  );

  return (
    <>
      {slot && createPortal(actions, slot)}
      {extraActions && <div className="flex items-center gap-2 flex-wrap">{extraActions}</div>}
    </>
  );
}
