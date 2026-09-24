'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import Link from 'next/link';
import { TiptapEditor } from './tiptap-editor';
import { NewsRepublishDialog } from './news-republish-dialog';
import { MediaUploadField } from './media-upload-field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { slugify } from '@/lib/utils';
import { type Post, type NewsRepublishMetadata, type PostStatus } from '@/types';

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

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [republishModalOpen, setRepublishModalOpen] = useState(false);

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

    setSaving(true);
    setErrorMessage(null);
    setSaveMessage(null);

    const finalStatus = targetStatus || status;
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      status: finalStatus,
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

      setSaveMessage('¡Artículo, imagen y video guardados exitosamente en la base de datos!');
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

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-text">
              {initialPost ? 'Editar Post' : 'Nuevo Post'}
            </h1>
            <p className="text-xs text-text-muted">
              Editor WYSIWYG Tiptap con soporte de embeds y republicación de noticias.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Republish News Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setRepublishModalOpen(true)}
            className="gap-1.5 border-warm/40 text-warm hover:bg-warm/10"
          >
            <Sparkles className="w-4 h-4" />
            <span>Republicar Noticia (1 Clic)</span>
          </Button>

          {/* Save Draft */}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleSave('draft')}
            isLoading={saving}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Borrador</span>
          </Button>

          {/* Publish */}
          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={() => handleSave('published')}
            isLoading={saving}
            className="gap-1.5 shadow-glow-accent"
          >
            <Send className="w-4 h-4" />
            <span>Publicar</span>
          </Button>
        </div>
      </div>

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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">
                Estado
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

            {videoUrl && (
              <div className="pt-2">
                <span className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5">
                  Vista Previa del Video
                </span>
                {videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') ? (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border">
                    <iframe
                      src={
                        videoUrl.includes('watch?v=')
                          ? videoUrl.replace('watch?v=', 'embed/')
                          : videoUrl.includes('youtu.be/')
                          ? videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                          : videoUrl
                      }
                      title="Video Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-black">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-cover"
                    >
                      Tu navegador no soporta el tag de video.
                    </video>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Republication Metadata Card */}
          <Card className="p-5 space-y-4 bg-card border-warm/30">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <h3 className="font-heading font-bold text-sm text-text">
                Atribución de Fuente
              </h3>
              <Badge variant={isRepublished ? 'warm' : 'outline'}>
                {isRepublished ? 'Republicado' : 'Original'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRepublishedCheck"
                checked={isRepublished}
                onChange={(e) => setIsRepublished(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="isRepublishedCheck" className="text-xs text-text">
                Es una republicación de una fuente externa
              </label>
            </div>

            {isRepublished && (
              <div className="space-y-3 pt-2 animate-fade-in">
                <Input
                  label="Nombre de la Fuente"
                  placeholder="Ej. Reuters, IEA, S&P Global"
                  value={originalSourceName}
                  onChange={(e) => setOriginalSourceName(e.target.value)}
                />
                <Input
                  label="URL Canónica de la Fuente"
                  placeholder="https://..."
                  value={originalSourceUrl}
                  onChange={(e) => setOriginalSourceUrl(e.target.value)}
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Scraper / News Republish Modal */}
      <NewsRepublishDialog
        open={republishModalOpen}
        onOpenChange={setRepublishModalOpen}
        onImport={handleImportNews}
      />
    </div>
  );
}
