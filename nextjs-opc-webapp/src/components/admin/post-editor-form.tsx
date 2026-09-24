'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Send,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Video,
  FolderPlus,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { TiptapEditor } from './tiptap-editor';
import { NewsRepublishDialog } from './news-republish-dialog';
import { MediaUploadField } from './media-upload-field';
import { CategoriesManagerModal } from './blog/categories-manager-modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import { type Post, type NewsRepublishMetadata, type PostStatus, type Category } from '@/types';

export function PostEditorForm({ initialPost }: { initialPost?: Post | null }) {
  const router = useRouter();

  const [title, setTitle] = useState(initialPost?.title || '');
  const [slug, setSlug] = useState(initialPost?.slug || '');
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '');
  const [content, setContent] = useState<any>(initialPost?.content || '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(
    initialPost?.featured_image_url || ''
  );
  const [videoUrl, setVideoUrl] = useState(initialPost?.video_url || '');
  const [tagsInput, setTagsInput] = useState(
    initialPost?.tags?.join(', ') || ''
  );
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status || 'draft'
  );
  const [isRepublished, setIsRepublished] = useState(
    initialPost?.is_republished || false
  );
  const [originalSourceUrl, setOriginalSourceUrl] = useState(
    initialPost?.original_source_url || ''
  );
  const [originalSourceName, setOriginalSourceName] = useState(
    initialPost?.original_source_name || ''
  );

  // Categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(
    initialPost?.category_id || initialPost?.categories?.[0]?.id || ''
  );
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [republishModalOpen, setRepublishModalOpen] = useState(false);

  // Cargar categorías disponibles desde la base de datos
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Category[]) => {
        setCategories(data);
        // Si no se asignó ID pero hay nombre de categoría en el post inicial, mapearlo
        if (!categoryId && initialPost?.category) {
          const initCatName =
            typeof initialPost.category === 'string'
              ? initialPost.category
              : initialPost.category?.name || '';
          const match = data.find(
            (c) =>
              c.name.toLowerCase() === initCatName.toLowerCase() ||
              c.slug === initCatName.toLowerCase()
          );
          if (match) setCategoryId(match.id);
        }
      })
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  // Auto-generate slug when title changes if slug was empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialPost) {
      setSlug(slugify(val));
    }
  };

  const handleImportNews = (meta: NewsRepublishMetadata) => {
    setTitle(meta.title);
    setSlug(slugify(meta.title));
    setExcerpt(meta.excerpt);
    if (meta.imageUrl) setFeaturedImageUrl(meta.imageUrl);
    setIsRepublished(true);
    setOriginalSourceUrl(meta.canonicalUrl || meta.sourceUrl);
    setOriginalSourceName(meta.sourceName);

    // Seed initial editor content with paragraph from scraped article
    setContent({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: meta.excerpt,
            },
          ],
        },
      ],
    });
  };

  const handleSave = async (targetStatus?: PostStatus) => {
    if (!title.trim()) {
      setErrorMessage('El título del post es obligatorio');
      return;
    }

    const finalStatus = targetStatus || status;

    // Validación estricta: No se puede publicar un artículo sin categoría
    if (finalStatus === 'published' && !categoryId) {
      setErrorMessage('Es imprescindible asignar una categoría válida antes de publicar el artículo.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const selectedCat = categories.find((c) => c.id === categoryId);

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      status: finalStatus,
      category_id: categoryId || null,
      category: selectedCat ? selectedCat.name : null,
      categories: selectedCat ? [selectedCat] : [],
      featured_image_url: featuredImageUrl || null,
      video_url: videoUrl || null,
      tags: tagsArray,
      is_republished: isRepublished,
      original_source_url: isRepublished ? originalSourceUrl : null,
      original_source_name: isRepublished ? originalSourceName : null,
      published_at: finalStatus === 'published' ? (initialPost?.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(initialPost?.id ? { id: initialPost.id } : {}),
          ...payload,
        }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || 'Error al guardar el artículo');
      }

      setSaveMessage('¡Artículo, categoría e imágenes guardados exitosamente en la base de datos!');
      setStatus(finalStatus);
      setTimeout(() => {
        router.push('/admin/posts');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error('Error al guardar artículo:', err);
      setErrorMessage(err.message || 'Error al persistir artículo en la base de datos');
    } finally {
      setSaving(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </Button>
          </Link>
          <div>
            <Badge variant="accent">EDITOR EDITORIAL</Badge>
            <h1 className="font-heading font-extrabold text-2xl text-text mt-1">
              {initialPost ? 'Editar Artículo' : 'Nuevo Artículo del Blog'}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRepublishModalOpen(true)}
            className="gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Republicar Noticia (Scraper)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Borrador</span>
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="gap-1.5 shadow-glow-accent"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{saving ? 'Publicando...' : 'Publicar Ahora'}</span>
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {saveMessage && (
        <div className="p-3 rounded-lg border border-accent/40 bg-accent/10 text-accent text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Form Inputs & Tiptap Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Title, Excerpt, Tiptap */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="p-6 bg-card space-y-4">
            <Input
              label="Título del Post *"
              placeholder="Ej. Dinámica del Suministro de Pet Coke hacia Asia..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="text-base font-semibold"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Slug URL *"
                placeholder="dinamica-pet-coke-asia"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />

              <Input
                label="Tags (separados por coma)"
                placeholder="Pet Coke, Asia, Logística"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <Textarea
              label="Extracto / Resumen"
              rows={2}
              placeholder="Breve resumen que aparecerá en tarjetas de blog y meta tags..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </Card>

          {/* Tiptap Rich Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
              Contenido del Artículo
            </label>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Right Column: Settings & Metadata */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4 bg-card">
            <h3 className="font-heading font-bold text-sm text-text border-b border-border/80 pb-2">
              Detalles de Publicación
            </h3>

            {/* Selector Obligatorio de Categoría */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Categoría <span className="text-amber-500 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-mono font-medium"
                >
                  <FolderPlus className="w-3 h-3" />
                  <span>+ Nueva Categoría</span>
                </button>
              </div>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-surf border border-border text-text rounded-lg px-3 py-2 text-xs font-medium focus:border-accent focus:outline-none"
                required
              >
                <option value="">-- Seleccionar Categoría Obligatoria --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {selectedCategoryObj ? (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-text-muted">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: selectedCategoryObj.color || '#f59e0b' }}
                  />
                  <span className="font-mono text-accent">/{selectedCategoryObj.slug}</span>
                  {selectedCategoryObj.description && (
                    <span className="truncate text-text-subtle">· {selectedCategoryObj.description}</span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-amber-500/90 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Es obligatorio asignar una categoría para poder publicar.</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Estado de Publicación
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full bg-surf border border-border text-text rounded-lg px-3 py-2 text-xs font-medium focus:border-accent focus:outline-none"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>

            <div className="space-y-1">
              <MediaUploadField
                label="Imagen Destacada"
                accept="image"
                value={featuredImageUrl}
                onChange={(url) => setFeaturedImageUrl(url)}
                placeholder="/uploads/... o https://..."
                description="Selecciona un archivo del disco o pega una URL de imagen."
              />
            </div>
          </Card>

          {/* Video Relacionado Card */}
          <Card className="p-5 space-y-4 bg-card border-cyan-500/20">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <h3 className="font-heading font-bold text-sm text-text flex items-center gap-1.5">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Video Relacionado</span>
              </h3>
              {videoUrl && (
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px]">
                  Video Activo
                </Badge>
              )}
            </div>

            <MediaUploadField
              label="Archivo de Video o Enlace"
              accept="video"
              value={videoUrl}
              onChange={(url) => setVideoUrl(url)}
              placeholder="/uploads/... o https://youtube.com/watch?v=..."
              description="Sube un video MP4/WebM o pega un enlace de YouTube/Vimeo."
            />
          </Card>

          {/* Republish Source Card */}
          {isRepublished && (
            <Card className="p-5 space-y-3 bg-card border-accent/20">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <h3 className="font-heading font-bold text-sm text-text">
                  Metadatos de Noticia
                </h3>
                <Badge variant="accent" className="text-[10px]">
                  Scraped
                </Badge>
              </div>

              <Input
                label="Fuente Original"
                value={originalSourceName}
                onChange={(e) => setOriginalSourceName(e.target.value)}
                placeholder="Reuters, Bloomberg, etc."
              />

              <Input
                label="URL Original Canónica"
                value={originalSourceUrl}
                onChange={(e) => setOriginalSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Scraper de Noticias */}
      <NewsRepublishDialog
        open={republishModalOpen}
        onOpenChange={setRepublishModalOpen}
        onImport={handleImportNews}
      />

      {/* Modal de Gestión y Creación de Categorías */}
      <CategoriesManagerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          setCategoryId(newCat.id);
        }}
      />
    </div>
  );
}
