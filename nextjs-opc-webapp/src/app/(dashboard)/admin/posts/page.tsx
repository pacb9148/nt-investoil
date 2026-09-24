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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { type Post, type PostStatus } from '@/types';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: PostStatus) => {
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
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;

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

        <Link href="/admin/posts/new">
          <Button variant="accent" size="sm" className="gap-2 shadow-glow-accent">
            <PlusCircle className="w-4 h-4" />
            <span>Crear Post</span>
          </Button>
        </Link>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg border border-accent/40 bg-accent/10 text-accent text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Buscar artículos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Vistas</th>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-text">
                {filteredPosts.map((post) => (
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

                    <td className="py-3.5 px-4 font-mono text-text-muted">
                      {post.views || 0}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-text-muted">
                      {formatDate(post.published_at || post.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {post.status === 'published' && (
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded hover:bg-surf text-text-muted hover:text-text"
                            title="Ver en vivo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="p-1.5 rounded hover:bg-surf text-text-muted hover:text-accent"
                          title="Editar post"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(post.id)}
                          className="p-1.5 rounded hover:bg-rose-500/20 text-text-muted hover:text-rose-400"
                          title="Eliminar post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
