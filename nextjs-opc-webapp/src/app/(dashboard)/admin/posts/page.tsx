'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Eye,
  CheckCircle,
  Archive,
  AlertCircle,
  Video,
  Image as ImageIcon,
  FolderPlus,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { type Post, type PostStatus, type Category } from '@/types';
import { CategoriesManagerModal } from '@/components/admin/blog/categories-manager-modal';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: PostStatus) => {
    // Si intenta publicar un post sin categoría, rechazar
    if (newStatus === 'published') {
      const post = posts.find((p) => p.id === id);
      if (post && !post.category_id && !post.category && (!post.categories || post.categories.length === 0)) {
        alert('Es imprescindible asignar una categoría válida antes de publicar el artículo.');
        return;
      }
    }

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        setActionMessage(`Estado actualizado a "${newStatus}" en la base de datos`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al actualizar estado');
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo permanentemente de la base de datos?')) {
      return;
    }
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setActionMessage('Artículo eliminado correctamente de la base de datos');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const pCatName = typeof p.category === 'string' ? p.category : p.category?.name || '';
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (pCatName && pCatName.toLowerCase().includes(search.toLowerCase())) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

    if (categoryFilter !== 'all') {
      const matchesCat =
        p.category_id === categoryFilter ||
        (pCatName && pCatName.toLowerCase() === categoryFilter.toLowerCase()) ||
        (p.categories && p.categories.some((c) => c.id === categoryFilter || c.slug === categoryFilter));
      if (!matchesCat) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Badge variant="accent">CONTENIDO EDITORIAL</Badge>
          <h1 className="font-heading font-extrabold text-2xl text-text mt-1">
            Gestión de Posts del Blog
          </h1>
          <p className="text-xs text-text-muted">
            Crea, edita, publica y administra todos los análisis y noticias republicadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCategoryModalOpen(true)}
            className="gap-2 border-accent/40 text-accent hover:bg-accent/10"
          >
            <FolderPlus className="w-4 h-4 text-accent" />
            <span>Gestionar Categorías</span>
          </Button>

          <Link href="/admin/posts/new">
            <Button variant="accent" size="sm" className="gap-2 shadow-glow-accent">
              <PlusCircle className="w-4 h-4" />
              <span>Crear Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg border border-accent/40 bg-accent/10 text-accent text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Buscar artículos o tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Filtro por Categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto bg-surf border border-border text-text rounded-lg px-3 py-2 text-xs font-medium focus:border-accent focus:outline-none"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'published', 'draft', 'archived'].map((status) => {
            const labels: Record<string, string> = {
              all: 'Todos',
              published: 'Publicados',
              draft: 'Borradores',
              archived: 'Archivados',
            };

            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  statusFilter === status
                    ? 'bg-accent text-bg shadow-glow-accent'
                    : 'bg-surf text-text-muted hover:text-text border border-border'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-text-muted">
            Cargando artículos...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-text">No hay posts que coincidan</p>
            <p className="text-xs text-text-muted">Prueba cambiando los filtros o crea un nuevo artículo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surf/60 text-text-muted uppercase font-mono tracking-wider">
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Vistas</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-text">
                {filteredPosts.map((post) => {
                  const catName =
                    typeof post.category === 'string'
                      ? post.category
                      : post.category?.name || post.categories?.[0]?.name;
                  const catObj = categories.find(
                    (c) => c.id === post.category_id || c.name === catName
                  );
                  const catColor = catObj?.color || '#f59e0b';

                  return (
                    <tr key={post.id} className="hover:bg-surf/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium max-w-sm">
                        <div className="flex items-center gap-3">
                          {post.featured_image_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border bg-surf relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg shrink-0 border border-border/60 bg-surf flex items-center justify-center text-text-muted">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <Link
                              href={`/admin/posts/${post.id}`}
                              className="font-heading font-semibold text-text hover:text-accent transition-colors line-clamp-1"
                            >
                              {post.title}
                            </Link>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-text-subtle truncate">
                                /{post.slug}
                              </span>
                              {post.video_url && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-cyan-400 bg-cyan-500/10 px-1 rounded border border-cyan-500/30">
                                  <Video className="w-2.5 h-2.5" /> Video
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Columna Categoría */}
                      <td className="py-3.5 px-4">
                        {catName ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border"
                            style={{
                              backgroundColor: `${catColor}15`,
                              borderColor: `${catColor}40`,
                              color: catColor,
                            }}
                          >
                            <Tag className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{catName}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                            <AlertCircle className="w-3 h-3" />
                            <span>Sin categoría</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={post.status}
                          onChange={(e) =>
                            handleUpdateStatus(post.id, e.target.value as PostStatus)
                          }
                          className="bg-surf border border-border text-text rounded px-2 py-1 text-xs font-mono focus:border-accent focus:outline-none"
                        >
                          <option value="published">Publicado</option>
                          <option value="draft">Borrador</option>
                          <option value="archived">Archivado</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted font-mono">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-text-subtle" />
                          <span>{post.views || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-text-muted font-mono whitespace-nowrap">
                        {formatDate(post.published_at || post.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-text-subtle hover:text-accent hover:bg-surf transition-colors"
                            title="Ver artículo público"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="p-1.5 rounded-lg text-text-subtle hover:text-accent hover:bg-surf transition-colors"
                            title="Editar artículo"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 rounded-lg text-text-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Eliminar artículo de la base de datos"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Gestión de Categorías */}
      <CategoriesManagerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
          fetchPosts();
        }}
      />
    </div>
  );
}
