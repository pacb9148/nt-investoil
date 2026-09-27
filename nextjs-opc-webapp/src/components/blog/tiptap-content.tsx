import React from 'react';

/**
 * Renderiza un nodo del documento JSON de Tiptap (el mismo formato que produce el editor de
 * artículos y ahora también el de la página Nosotros). Vive aquí para que ambos lo reutilicen
 * en vez de duplicar la lógica de cada nodo y marca.
 */
export function renderTiptapNode(node: any, index: number): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case 'heading': {
      const Level = (`h${node.attrs?.level || 2}`) as keyof JSX.IntrinsicElements;
      return (
        <Level key={index} className="font-heading font-bold text-text mt-8 mb-4 text-xl sm:text-2xl">
          {node.content?.map(renderTiptapNode)}
        </Level>
      );
    }
    case 'paragraph': {
      return (
        <p key={index} className="text-text-muted leading-relaxed mb-5 text-sm sm:text-base">
          {node.content?.map(renderTiptapNode)}
        </p>
      );
    }
    case 'text': {
      let textContent: React.ReactNode = node.text;
      if (node.marks) {
        for (const mark of node.marks) {
          if (mark.type === 'bold') textContent = <strong key={mark.type}>{textContent}</strong>;
          if (mark.type === 'italic') textContent = <em key={mark.type}>{textContent}</em>;
          if (mark.type === 'underline') textContent = <u key={mark.type}>{textContent}</u>;
          if (mark.type === 'link') {
            textContent = (
              <a
                key={mark.type}
                href={mark.attrs?.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline hover:text-neon"
              >
                {textContent}
              </a>
            );
          }
        }
      }
      return textContent;
    }
    default:
      return null;
  }
}

/** Texto plano de un documento Tiptap, cadena de texto o HTML heredado; para recortes y metadatos. */
export function tiptapToPlainText(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const walk = (node: any): string => {
    if (!node) return '';
    if (node.type === 'text') return node.text || '';
    if (Array.isArray(node.content)) return node.content.map(walk).join(node.type === 'paragraph' || node.type === 'heading' ? ' ' : '');
    return '';
  };
  const nodes = content.content || [];
  return nodes.map(walk).join(' ').replace(/\s+/g, ' ').trim();
}

export interface TiptapContentProps {
  /** Documento JSON de Tiptap (`{type:'doc', content:[...]}`), HTML/texto heredado, o vacío. */
  content: any;
  /** Se muestra cuando no hay contenido en absoluto. */
  fallback?: React.ReactNode;
  /** Clase para el contenido heredado en texto/HTML plano (el JSON de Tiptap ya trae su propio estilo por nodo). */
  legacyClassName?: string;
}

/**
 * Punto único para pintar un campo editado con TiptapEditor, en el blog o en cualquier otra
 * página (por ejemplo Nosotros): admite el documento JSON del editor, texto plano o HTML de
 * antes de tener editor (se muestra tal cual), o nada.
 */
export function TiptapContent({ content, fallback = null, legacyClassName }: TiptapContentProps) {
  if (!content) return <>{fallback}</>;

  if (typeof content === 'string') {
    if (!content.trim()) return <>{fallback}</>;
    return <div className={legacyClassName} dangerouslySetInnerHTML={{ __html: content }} />;
  }

  if (content?.content) {
    return <>{content.content.map((node: any, i: number) => renderTiptapNode(node, i))}</>;
  }

  return <>{fallback}</>;
}
