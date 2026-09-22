'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/language-context';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function LanguageSelector({ className, variant = 'compact' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-lg border border-border/80 bg-surf/80 backdrop-blur-sm text-xs font-mono select-none',
        className
      )}
      role="group"
      aria-label="Selector de idioma / Language selector"
    >
      <div className="flex items-center px-1 text-text-subtle">
        <Globe className="w-3.5 h-3.5 text-accent/80" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('es')}
        className={cn(
          'px-2 py-0.5 rounded transition-all duration-150 font-semibold',
          language === 'es'
            ? 'bg-accent text-bg shadow-sm shadow-accent/20'
            : 'text-text-muted hover:text-text hover:bg-card/40'
        )}
        aria-pressed={language === 'es'}
      >
        ES
      </button>

      <span className="text-border">/</span>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'px-2 py-0.5 rounded transition-all duration-150 font-semibold',
          language === 'en'
            ? 'bg-accent text-bg shadow-sm shadow-accent/20'
            : 'text-text-muted hover:text-text hover:bg-card/40'
        )}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
    </div>
  );
}
