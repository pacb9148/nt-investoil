import React from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';

export interface NewsRepublishBadgeProps {
  sourceName?: string | null;
  sourceUrl?: string | null;
}

export function NewsRepublishBadge({ sourceName, sourceUrl }: NewsRepublishBadgeProps) {
  if (!sourceName && !sourceUrl) return null;

  return (
    <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 dark:text-amber-300 text-xs font-mono">
      <Newspaper className="w-3.5 h-3.5 shrink-0 text-amber-400" />
      <span>
        Noticia reproducida de <strong>{sourceName || 'Fuente externa'}</strong>
      </span>
      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 font-sans font-semibold text-xs text-white bg-amber-600/60 hover:bg-amber-600 px-2 py-0.5 rounded transition-colors ml-1 shadow-sm"
          title="Abrir el artículo original en la fuente"
        >
          <span>Leer artículo original</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}
