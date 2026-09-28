/**
 * Fecha y hora de publicación ORIGINAL de un artículo, a partir de su HTML: se prueban, en orden de
 * fiabilidad, las fuentes estándar que exponen la mayoría de medios y CMS (metaetiquetas, JSON-LD,
 * y el primer <time datetime>). Nunca inventa una fecha: devuelve null si no encuentra ninguna.
 */
export function extractOriginalPublishedAt(
  html: string,
  metaContent: (key: string) => string | null
): string | null {
  const candidates = [
    metaContent('article:published_time'),
    metaContent('og:article:published_time'),
    metaContent('datePublished'),
    metaContent('date'),
    metaContent('publish-date'),
    metaContent('publication_date'),
    metaContent('sailthru.date'),
    metaContent('parsely-pub-date'),
  ];

  // JSON-LD (schema.org NewsArticle/Article): suele llevar "datePublished" en formato ISO.
  const ldJsonBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const block of ldJsonBlocks) {
    const inner = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
    const match = inner.match(/"datePublished"\s*:\s*"([^"]+)"/i);
    if (match) candidates.push(match[1]);
  }

  // Último recurso: el primer <time datetime="..."> de la página.
  const timeTagMatch = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (timeTagMatch) candidates.push(timeTagMatch[1]);

  for (const raw of candidates) {
    if (!raw) continue;
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  return null;
}
