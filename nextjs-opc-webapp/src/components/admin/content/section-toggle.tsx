'use client';

import React, { useTransition, useState } from 'react';
import { toggleSectionAction } from '@/lib/services/content-actions';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SectionToggleProps {
  id: string;
  isActive: boolean;
  title: string;
}

export function SectionToggle({ id, isActive: initialActive, title }: SectionToggleProps) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    startTransition(async () => {
      await toggleSectionAction(id, nextState);
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        'relative inline-flex items-center h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-60',
        isActive ? 'bg-emerald-500' : 'bg-surf-light/60'
      )}
      role="switch"
      aria-checked={isActive}
      aria-label={`Alternar visibilidad de ${title}`}
      title={isActive ? 'Sección visible (Click para ocultar)' : 'Sección oculta (Click para mostrar)'}
    >
      <span className="sr-only">{title}</span>
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
          isActive ? 'translate-x-5' : 'translate-x-0'
        )}
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 text-text-subtle animate-spin" />
        ) : (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isActive ? 'bg-emerald-600' : 'bg-text-subtle'
            )}
          />
        )}
      </span>
    </button>
  );
}
