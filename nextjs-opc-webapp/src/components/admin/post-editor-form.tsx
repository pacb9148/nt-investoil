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
  Radio,
  Eye,
  Heart,
  ThumbsUp,
} from 'lucide-react';
import Link from 'next/link';
import { TiptapEditor } from './tiptap-editor';
import { NewsRepublishDialog } from './news-republish-dialog';
import { NewsAgentModal } from './news-agent-modal';
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

  const [publishedAt, setPublishedAt] = useState<string>(() => {
    if (initialPost?.published_at) {
      try {
        const d = new Date(initialPost.published_at);
        if (!isNaN(d.getTime())) {
          return d.toISOString().slice(0, 16);
        }
      } catch {}
    }
    return new Date().toISOString().slice(0, 16);
  });

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
  const [newsAgentOpen, setNewsAgentOpen] = useState(false);
  const [views, setViews] = useState<number>(initialPost?.views ?? 0);
  const [likes, setLikes] = useState<number>(initialPost?.likes ?? 0);

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
              : (initialPost.category as any)?.name || '';
          const norm = (s: string) => (s || '').toLowerCase().replace(/[\s\-_]/g, '');
          const match = data.find(
            (c) =>
              norm(c.name) === norm(initCatName) ||
              norm(c.slug) === norm(initCatName) ||
              c.id === initCatName
          );
          if (match) {
            setCategoryId(match.id);
          } else if (initCatName) {
            // Si la categoría no está en la lista pero existe en el post, inyectarla
            const fallbackCat: Category = {
              id: `cat-${norm(initCatName)}`,
              name: initCatName,
              slug: norm(initCatName),
              description: 'Categoría existente en publicación',
              color: '#f59e0b',
            };
            setCategories((prev) => [...prev, fallbackCat]);
            setCategoryId(fallbackCat.id);
          }
        }
      })
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  // Auto-generate slug when title changes if slug was empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialPost && !slug) {
      setSlug(slugify(val));
    }
  };

  const suggestSlug = () => {
    if (!title.trim()) return;
    setSlug(slugify(title));
  };

  const suggestTags = () => {
    const rawText = `${title} ${excerpt} ${typeof content === 'string' ? content : JSON.stringify(content || '')}`.toLowerCase();
    const candidateKeywords = [
      'Brent', 'WTI', 'Pet Coke', 'Merey 16', 'EN590', 'Jet A-1',
      'Refinación', 'Trading', 'Logística', 'Buques', 'VLCC', 'Aframax',
      'Demurrage', 'Fletes', 'Arbitraje', 'GNL', 'Gas Natural', 'Crudo Pesado',
      'Derivados', 'Compliance', 'Riesgo Financiero', 'Houston', 'Rotterdam',
      'Sostenibilidad', 'Transición', 'Inventarios', 'Mercados'
    ];
    const detected = candidateKeywords.filter((kw) =>
      rawText.includes(kw.toLowerCase())
    );
    if (detected.length > 0) {
      const current = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [];
      const combined = Array.from(new Set([...current, ...detected]));
      setTagsInput(combined.join(', '));
    } else if (title.trim()) {
      const words = title
        .split(/\s+/)
        .map(w => w.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, ''))
        .filter(w => w.length > 4 && !['sobre', 'desde', 'hacia', 'entre', 'donde', 'cuando', 'porque'].includes(w.toLowerCase()));
      setTagsInput(words.slice(0, 5).join(', '));
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

    // Inyectar contenido completo estructurado con link a la fuente original
    const sourceLink = meta.canonicalUrl || meta.sourceUrl;
    const bodyHtml = meta.contentHtml || `<p>${meta.excerpt}</p>`;
    const fullArticleHtml = `
      ${bodyHtml}
      <hr />
      <p style="font-size: 0.85em; color: #94a3b8; font-style: italic;">
        <strong>Fuente original:</strong> <a href="${sourceLink}" target="_blank" rel="noopener noreferrer">${meta.sourceName || 'Enlace de la noticia'}</a>.
      </p>
    `.trim();

    setContent(fullArticleHtml);
  };

  const handleSelectNewsAgent = (data: {
    title: string;
    excerpt: string;
    contentHtml: string;
    sourceName: string;
    sourceUrl: string;
    tags: string[];
    imageUrl?: string;
    category?: string;
  }) => {
    setTitle(data.title);
    setSlug(slugify(data.title));
    setExcerpt(data.excerpt);
    if (data.tags && data.tags.length > 0) {
      setTagsInput(data.tags.join(', '));
    }
    if (data.imageUrl) {
      setFeaturedImageUrl(data.imageUrl);
    }
    setIsRepublished(true);
    setOriginalSourceName(data.sourceName);
    setOriginalSourceUrl(data.sourceUrl);

    if (data.category && categories.length > 0) {
      const norm = (s: string) => (s || '').toLowerCase().replace(/[\s\-_]/g, '');
      const match = categories.find(
        (c) => norm(c.name) === norm(data.category!) || norm(c.slug) === norm(data.category!)
      );
      if (match) setCategoryId(match.id);
    }

    // Inyectar artículo completo con todos los párrafos y enlace a la fuente original al pie
    setContent(data.contentHtml || `<p>${data.excerpt}</p>`);
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

    const finalPublishedAt =
      finalStatus === 'published'
        ? (publishedAt ? new Date(publishedAt).toISOString() : (initialPost?.published_at || new Date().toISOString()))
        : null;

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
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      is_republished: isRepublished,
      original_source_url: isRepublished ? originalSourceUrl : null,
      original_source_name: isRepublished ? originalSourceName : null,
      published_at: finalPublishedAt,
      created_at: initialPost?.created_at || finalPublishedAt || new Date().toISOString(),
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
    <div className="space-y-4">
      {/* Barra superior de títulos y botones en una única fila compacta */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <Link href="/admin/posts">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-surf text-text-muted hover:text-text">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="font-heading font-bold text-lg sm:text-xl text-text tracking-wide">
            {initialPost ? 'Editar Artículo' : 'Editor de Artículos'}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNewsAgentOpen(true)}
            className="gap-1.5 border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs h-8 px-2.5 font-semibold"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Agente de Noticias (Radar AI)</span>
            <span className="sm:hidden">Noticias AI</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setRepublishModalOpen(true)}
            className="gap-1.5 border-accent/40 text-accent hover:bg-accent/10 text-xs h-8 px-2.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="hidden sm:inline">Republicar Noticia (Scraper)</span>
            <span className="sm:hidden">Scraper</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="gap-1.5 text-xs h-8 px-3"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Borrador</span>
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => handleSave('published')}
            disabled={saving}
            className="gap-1.5 shadow-glow-accent text-xs h-8 px-3.5 font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{saving ? 'Publicando...' : 'Publicar Ahora'}</span>
          </Button>
        </div>
      </div>

      {/* Mensajes de Estado */}
      {saveMessage && (
        <div className="p-2.5 rounded-lg border border-accent/40 bg-accent/10 text-accent text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Principal del Editor: Bloque integrado según diseño */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Columna Izquierda: Título, Slug, Tags, Extracto y Tiptap */}
        <div className="lg:col-span-8 space-y-3">
          <Card className="p-3 bg-card/90 border-border/80 space-y-2.5">
            <div>
              <Input
                placeholder="TÍTULO DEL POST *"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="text-sm font-semibold h-10 bg-surf/80 border-border placeholder:text-text-subtle/70"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative flex items-center">
                <Input
                  placeholder="SLUG URL *"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="text-xs font-mono h-9 bg-surf/80 border-border placeholder:text-text-subtle/70 pr-8"
                />
                <button
                  type="button"
                  onClick={suggestSlug}
                  className="absolute right-2 text-accent hover:text-amber-400 transition-colors p-1"
                  title="Sugerir slug automáticamente"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative flex items-center">
                <Input
                  placeholder="TAGS (SEPARADOS POR COMA)"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="text-xs h-9 bg-surf/80 border-border placeholder:text-text-subtle/70 pr-8"
                />
                <button
                  type="button"
                  onClick={suggestTags}
                  className="absolute right-2 text-accent hover:text-amber-400 transition-colors p-1"
                  title="Sugerir tags automáticamente"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <Textarea
                rows={3}
                placeholder="EXTRACTO / RESUMEN"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="text-xs bg-surf/80 border-border placeholder:text-text-subtle/70 resize-y"
              />
            </div>
          </Card>

          {/* Tiptap Rich Editor con Barra Fija y Scroll Vertical Directo */}
          <div>
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>

        {/* Columna Derecha: Configuración y Detalles de Publicación */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 space-y-3.5 bg-card/90 border-border/80">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-text border-b border-border/80 pb-2">
              Detalles de Publicación
            </h3>

            {/* Selector Obligatorio de Categoría */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted">
                  Categoría <span className="text-amber-500 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(true)}
                  className="text-[10px] text-accent hover:underline flex items-center gap-1 font-mono"
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
                <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-text-muted">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: selectedCategoryObj.color || '#f59e0b' }}
                  />
                  <span className="font-mono text-accent">/{selectedCategoryObj.slug}</span>
                  {selectedCategoryObj.description && (
                    <span className="truncate text-text-subtle text-[10px]">· {selectedCategoryObj.description}</span>
                  )}
                </div>
              ) : (
                <p className="text-[10px] text-amber-500/90 mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Es obligatorio asignar una categoría para poder publicar.</span>
                </p>
              )}
            </div>

            {/* Fecha de Publicación Editable */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1">
                Fecha de Publicación
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full bg-surf border border-border text-text rounded-lg px-3 py-2 text-xs font-mono focus:border-accent focus:outline-none"
              />
              <p className="text-[10px] text-text-subtle mt-0.5 font-mono">
                Permite mantener o corregir fechas históricas de noticias.
              </p>
            </div>

            {/* Estado de Publicación */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1">
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

            {/* Vistas y Likes (Automáticos y Editables) */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/60">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Vistas</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={views}
                  onChange={(e) => setViews(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-surf border border-border text-text rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-400" />
                  <span>Likes</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={likes}
                  onChange={(e) => setLikes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-surf border border-border text-text rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Imagen Destacada */}
            <div className="pt-1">
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

      {/* Modal del Agente de Noticias AI */}
      <NewsAgentModal
        isOpen={newsAgentOpen}
        onClose={() => setNewsAgentOpen(false)}
        onSelectNews={handleSelectNewsAgent}
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
