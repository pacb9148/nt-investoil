import React from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';

export interface NewsRepublishBadgeProps {
  sourceName?: string | null;
  sourceUrl?: string | null;
}

export function NewsRepublishBadge({ sourceName, sourceUrl }: NewsRepublishBadgeProps) {
  if (!sourceName && !sourceUrl) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-warm/40 bg-warm/10 text-warm text-xs font-mono">
      <Newspaper className="w-3.5 h-3.5 shrink-0" />
      <span>
        Republicación autorizada de{' '}
        <strong>{sourceName || 'Fuente externa'}</strong>
      </span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 hover:underline ml-1 font-sans text-xs text-text"
        >
          <span>Ver fuente</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
