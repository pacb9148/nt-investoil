import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'accent' | 'warm' | 'neon' | 'outline' | 'success' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-surf text-text-muted border-border',
    accent: 'bg-accent/15 text-accent border-accent/30',
    warm: 'bg-warm/15 text-warm border-warm/30',
    neon: 'bg-neon/15 text-neon border-neon/30',
    outline: 'text-text-muted border-border bg-transparent',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono tracking-wide transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
