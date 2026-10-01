import React from 'react';

/**
 * Renderiza un nodo del documento JSON de Tiptap (el mismo formato que produce el editor de
 * artículos y que ahora también usan Nosotros, Retos y las páginas legales). Vive aquí para que
 * todos lo reutilicen en vez de duplicar la lógica de cada nodo y marca.
 *
 * Cubre todos los nodos y marcas que `TiptapEditor` (`components/admin/tiptap-editor.tsx`) permite
 * crear: si el editor gana una herramienta nueva, este renderizador debe aprender el nodo o marca
 * correspondiente, o el contenido se guardará bien pero desaparecerá al mostrarlo en público.
 */
function renderMarks(text: string, marks: any[] | undefined, key: number): React.ReactNode {
  let node: React.ReactNode = text;
  if (!marks) return node;
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        node = <strong key={`b-${key}`}>{node}</strong>;
        break;
      case 'italic':
        node = <em key={`i-${key}`}>{node}</em>;
        break;
      case 'underline':
        node = <u key={`u-${key}`}>{node}</u>;
        break;
      case 'strike':
        node = <s key={`s-${key}`}>{node}</s>;
        break;
      case 'code':
        node = (
          <code key={`c-${key}`} className="px-1 py-0.5 rounded bg-black/40 font-mono text-[0.9em]">
            {node}
          </code>
        );
        break;
      case 'highlight':
        node = (
          <mark
            key={`h-${key}`}
            className="rounded px-0.5"
            style={{ backgroundColor: mark.attrs?.color || 'rgba(245,158,11,0.35)', color: 'inherit' }}
          >
            {node}
          </mark>
        );
        break;
      case 'textStyle': {
        const style: React.CSSProperties = {};
        if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize;
        if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily;
        if (Object.keys(style).length > 0) {
          node = (
            <span key={`ts-${key}`} style={style}>
              {node}
            </span>
          );
        }
        break;
      }
      case 'link':
        node = (
          <a
            key={`l-${key}`}
            href={mark.attrs?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline hover:text-neon"
          >
            {node}
          </a>
        );
        break;
    }
  }
  return node;
}

export function renderTiptapNode(node: any, index: number): React.ReactNode {
  if (!node) return null;
  const style: React.CSSProperties | undefined = node.attrs?.textAlign
    ? { textAlign: node.attrs.textAlign }
    : undefined;

  switch (node.type) {
    case 'heading': {
      const Level = (`h${node.attrs?.level || 2}`) as keyof JSX.IntrinsicElements;
      return (
        <Level key={index} className="font-heading font-bold text-text mt-8 mb-4 text-xl sm:text-2xl" style={style}>
          {node.content?.map(renderTiptapNode)}
        </Level>
      );
    }
    case 'paragraph': {
      if (!node.content) return <p key={index} className="mb-5" style={style}>&nbsp;</p>;
      return (
        <p key={index} className="text-text-muted leading-relaxed mb-5 text-sm sm:text-base" style={style}>
          {node.content.map(renderTiptapNode)}
        </p>
      );
    }
    case 'text': {
      return <React.Fragment key={index}>{renderMarks(node.text, node.marks, index)}</React.Fragment>;
    }
    case 'bulletList': {
      return (
        <ul key={index} className="list-disc pl-6 mb-5 space-y-1.5 text-text-muted text-sm sm:text-base">
          {node.content?.map(renderTiptapNode)}
        </ul>
      );
    }
    case 'orderedList': {
      return (
        <ol
          key={index}
          start={node.attrs?.start || 1}
          className="list-decimal pl-6 mb-5 space-y-1.5 text-text-muted text-sm sm:text-base"
        >
          {node.content?.map(renderTiptapNode)}
        </ol>
      );
    }
    case 'listItem': {
      return (
        <li key={index} className="leading-relaxed">
          {node.content?.map(renderTiptapNode)}
        </li>
      );
    }
    case 'taskList': {
      return (
        <ul key={index} className="pl-1 mb-5 space-y-1.5 text-text-muted text-sm sm:text-base">
          {node.content?.map(renderTiptapNode)}
        </ul>
      );
    }
    case 'taskItem': {
      return (
        <li key={index} className="flex items-start gap-2 leading-relaxed list-none">
          <input type="checkbox" checked={!!node.attrs?.checked} readOnly className="mt-1 accent-accent" />
          <span>{node.content?.map(renderTiptapNode)}</span>
        </li>
      );
    }
    case 'blockquote': {
      return (
        <blockquote key={index} className="border-l-2 border-accent/50 pl-4 italic text-text-muted mb-5">
          {node.content?.map(renderTiptapNode)}
        </blockquote>
      );
    }
    case 'codeBlock': {
      const code = (node.content || []).map((n: any) => n.text || '').join('');
      return (
        <pre key={index} className="rounded-lg bg-black/40 p-4 mb-5 overflow-x-auto text-xs font-mono">
          <code>{code}</code>
        </pre>
      );
    }
    case 'horizontalRule': {
      return <hr key={index} className="my-8 border-border" />;
    }
    case 'hardBreak': {
      return <br key={index} />;
    }
    case 'image': {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={node.attrs?.src}
          alt={node.attrs?.alt || ''}
          title={node.attrs?.title || undefined}
          className="rounded-lg max-w-full mb-5"
        />
      );
    }
    case 'youtube': {
      return (
        <div key={index} className="mb-5 aspect-video">
          <iframe
            src={node.attrs?.src}
            width={node.attrs?.width || 640}
            height={node.attrs?.height || 360}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      );
    }
    case 'table': {
      return (
        <div key={index} className="overflow-x-auto mb-5">
          <table className="w-full border-collapse text-sm">
            <tbody>{node.content?.map(renderTiptapNode)}</tbody>
          </table>
        </div>
      );
    }
    case 'tableRow': {
      return (
        <tr key={index} className="border-b border-border">
          {node.content?.map(renderTiptapNode)}
        </tr>
      );
    }
    case 'tableHeader': {
      return (
        <th key={index} className="border border-border p-2 text-left font-bold bg-card/60">
          {node.content?.map(renderTiptapNode)}
        </th>
      );
    }
    case 'tableCell': {
      return (
        <td key={index} className="border border-border p-2">
          {node.content?.map(renderTiptapNode)}
        </td>
      );
    }
    default:
      return node.content ? <React.Fragment key={index}>{node.content.map(renderTiptapNode)}</React.Fragment> : null;
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
 * página (Nosotros, Retos, páginas legales...): admite el documento JSON del editor, texto plano
 * o HTML de antes de tener editor (se muestra tal cual), o nada.
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
