'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TiptapEditorProps {
  content: any;
  onChange: (content: any) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Escribe aquí el contenido del artículo...',
  className,
}: TiptapEditorProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-accent underline hover:text-neon transition-colors',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Typography,
      Youtube.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[350px] p-4 text-text text-sm focus:outline-none leading-relaxed',
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Introduce la URL de la imagen:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Introduce la URL de YouTube o Vimeo:');
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 640,
        height: 360,
      });
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Introduce el enlace (URL):', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={cn('rounded-xl border border-border bg-surf/90 overflow-hidden', className)}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card/60 text-text-muted">
        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-surf hover:text-text disabled:opacity-30"
          title="Deshacer"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-surf hover:text-text disabled:opacity-30"
          title="Rehacer"
        >
          <Redo className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('heading', { level: 1 }) && 'bg-accent/20 text-accent font-bold'
          )}
          title="Título 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('heading', { level: 2 }) && 'bg-accent/20 text-accent font-bold'
          )}
          title="Título 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('heading', { level: 3 }) && 'bg-accent/20 text-accent font-bold'
          )}
          title="Título 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        {/* Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('bold') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Negrita"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('italic') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Cursiva"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('underline') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Subrayado"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('bulletList') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Lista con viñetas"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('orderedList') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Lista numerada"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('taskList') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Lista de tareas"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('blockquote') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Cita"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('codeBlock') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Bloque de código"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        {/* Alignments */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive({ textAlign: 'left' }) && 'bg-accent/20 text-accent font-bold'
          )}
          title="Alinear izquierda"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive({ textAlign: 'center' }) && 'bg-accent/20 text-accent font-bold'
          )}
          title="Centrar"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive({ textAlign: 'right' }) && 'bg-accent/20 text-accent font-bold'
          )}
          title="Alinear derecha"
        >
          <AlignRight className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-border mx-1" />

        {/* Media & Embeds */}
        <button
          type="button"
          onClick={setLink}
          className={cn(
            'p-1.5 rounded hover:bg-surf hover:text-text',
            editor.isActive('link') && 'bg-accent/20 text-accent font-bold'
          )}
          title="Insertar enlace"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-1.5 rounded hover:bg-surf hover:text-text"
          title="Insertar imagen"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addYoutube}
          className="p-1.5 rounded hover:bg-surf hover:text-text"
          title="Insertar video YouTube / Vimeo"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="p-1.5 rounded hover:bg-surf hover:text-text"
          title="Insertar tabla"
        >
          <TableIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Footer stats: Character & Word Count */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/40 text-[11px] font-mono text-text-subtle">
        <div>
          {editor.storage.characterCount.words()} palabras ·{' '}
          {editor.storage.characterCount.characters()} caracteres
        </div>
        <div className="text-accent">
          ~{Math.ceil(editor.storage.characterCount.words() / 200)} min de lectura
        </div>
      </div>
    </div>
  );
}
