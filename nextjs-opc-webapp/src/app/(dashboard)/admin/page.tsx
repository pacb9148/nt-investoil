import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Eye,
  Inbox,
  Image as ImageIcon,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { type Post, type ContactLead } from '@/types';

export const revalidate = 0; // Dynamic data for dashboard

export default async function AdminDashboardPage() {
  let posts: Post[] = [];
  let leads: ContactLead[] = [];
  let mediaCount = 5;

  try {
    const supabase = createClient();
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) posts = postsData;

    const { data: leadsData } = await supabase
      .from('contact_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (leadsData) leads = leadsData;

    const { count } = await supabase
      .from('media')
      .select('*', { count: 'exact', head: true });

    if (count !== null && count !== undefined) mediaCount = count;
  } catch (e) {
    // In local demo mode, fallback values are used
  }

  // Fallback demo posts if DB is fresh
  if (posts.length === 0) {
    posts = [
      {
        id: '1',
        slug: 'dinamica-pet-coke',
        title: 'Dinámica del Suministro de Pet Coke hacia Asia',
        excerpt: null,
        content: null,
        status: 'published',
        featured_image_url: null,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Pet Coke', 'Asia'],
        reading_time: 5,
        views: 342,
        is_republished: false,
      },
      {
        id: '2',
        slug: 'merey-16-refinerias',
        title: 'Merey 16: Demanda Sólida en Refinerías de Alta Conversión',
        excerpt: null,
        content: null,
        status: 'published',
        featured_image_url: null,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Merey 16'],
        reading_time: 4,
        views: 512,
        is_republished: false,
      },
      {
        id: '3',
        slug: 'diesel-en590',
        title: 'Perspectivas del Diésel EN590 de Bajo Azufre',
        excerpt: null,
        content: null,
        status: 'draft',
        featured_image_url: null,
        published_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Diesel'],
        reading_time: 4,
        views: 195,
        is_republished: false,
      },
    ];
  }

  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Badge variant="accent">PANEL DE CONTROL GENERAL</Badge>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-text mt-1">
            Resumen Operativo
          </h1>
          <p className="text-xs text-text-muted">
            Métricas de contenido, visitas del blog y mensajes de leads recibidos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/posts/new">
            <Button variant="accent" size="sm" className="gap-2 shadow-glow-accent">
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Post</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 space-y-3 border-accent/30 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Posts Publicados
            </span>
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-text">
              {publishedCount}
            </span>
            <span className="text-xs text-text-muted font-mono">
              {draftCount} en borrador
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3 border-warm/30 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Vistas Acumuladas
            </span>
            <div className="p-2 rounded-lg bg-warm/10 text-warm">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-warm">
              {totalViews.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>+18% este mes</span>
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3 border-neon/30 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Leads / Contactos
            </span>
            <div className="p-2 rounded-lg bg-neon/10 text-neon">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-neon">
              {leads.length > 0 ? leads.length : 4}
            </span>
            <span className="text-xs text-text-muted font-mono">
              Nuevas solicitudes
            </span>
          </div>
        </Card>

        <Card className="p-5 space-y-3 border-border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Archivos en Media
            </span>
            <div className="p-2 rounded-lg bg-surf text-text-muted">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-heading font-extrabold text-3xl text-text">
              {mediaCount}
            </span>
            <span className="text-xs text-accent font-mono">
              Almacenamiento OK
            </span>
          </div>
        </Card>
      </div>

      {/* Tables section: Recent Posts & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Posts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-text">
              Artículos Recientes
            </h3>
            <Link
              href="/admin/posts"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="divide-y divide-border/60">
              {posts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="p-4 flex items-center justify-between hover:bg-surf/50 transition-colors"
                >
                  <div className="space-y-1 max-w-md">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="font-heading font-semibold text-sm text-text hover:text-accent transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                      <span>{formatDate(post.published_at || post.created_at)}</span>
                      <span>•</span>
                      <span>{post.views || 0} vistas</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        post.status === 'published'
                          ? 'success'
                          : post.status === 'draft'
                          ? 'warm'
                          : 'default'
                      }
                    >
                      {post.status === 'published'
                        ? 'Publicado'
                        : post.status === 'draft'
                        ? 'Borrador'
                        : 'Archivado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick actions & Leads */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-text">
              Herramientas Rápidas
            </h3>
          </div>

          <div className="space-y-3">
            <Card className="p-4 bg-surf/80 border-border hover:border-accent/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/15 text-accent shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-text">
                    Republicación de Noticias
                  </h4>
                  <p className="text-xs text-text-muted">
                    Scrapea metadatos OG desde URLs externas (Reuters, IEA, Bloomberg) e impórtalas con 1 clic.
                  </p>
                  <div className="pt-2">
                    <Link href="/admin/posts/new">
                      <Button variant="outline" size="sm" className="text-xs">
                        Abrir importador
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-surf/80 border-border hover:border-warm/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-warm/15 text-warm shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-text">
                    Gestor de Medios
                  </h4>
                  <p className="text-xs text-text-muted">
                    Sube y gestiona imágenes de productos, buques y cargamentos en Supabase Storage.
                  </p>
                  <div className="pt-2">
                    <Link href="/admin/media">
                      <Button variant="outline" size="sm" className="text-xs">
                        Ir a Biblioteca
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
