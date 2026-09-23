import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Eye, Share2, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewsRepublishBadge } from '@/components/blog/news-republish-badge';
import { formatDate } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCuratedPostBySlug, getCuratedPosts } from '@/lib/constants/blog-data';
import { type Post } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  let post: Post | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', params.slug)
        .single();
      if (data) post = data;
    } catch {}
  }

  if (!post) {
    post = getCuratedPostBySlug(params.slug);
  }

  if (!post) {
    return {
      title: 'Artículo de Blog | Invest Oil LLC',
    };
  }

  return {
    title: `${post.title} | Invest Oil LLC`,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

// Simple render for Tiptap JSON content nodes
function renderTiptapNode(node: any, index: number): React.ReactNode {
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

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  let post: (Post & { category?: any; categories?: any[] }) | null = null;

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = createClient();
      const { data } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('slug', params.slug)
        .single();

      if (data) post = data;
    } catch (e) {}
  }

  if (!post) {
    post = getCuratedPostBySlug(params.slug);
  }

  if (!post) {
    notFound();
  }

  const category =
    post.category ||
    (post.categories && post.categories.length > 0 ? post.categories[0] : null);

  // Artículos relacionados de la misma categoría o recientes
  const allPosts = getCuratedPosts();
  const relatedPosts = allPosts
    .filter((p) => p.id !== post?.id)
    .slice(0, 2);

  return (
    <article className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-mono text-text-subtle hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Blog de Inteligencia Energética</span>
        </Link>
      </div>

      {/* Meta header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <span
              className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border shadow-sm"
              style={{
                backgroundColor: `${category.color || '#f59e0b'}20`,
                borderColor: `${category.color || '#f59e0b'}50`,
                color: category.color || '#f59e0b',
              }}
            >
              {category.name}
            </span>
          )}
          {post.is_republished && (
            <NewsRepublishBadge
              sourceName={post.original_source_name}
              sourceUrl={post.original_source_url}
            />
          )}
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-text leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted font-mono pt-2 border-b border-border/60 pb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-warm" />
            <span>{post.reading_time || 3} min de lectura</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-neon" />
            <span>{post.views || 0} lecturas</span>
          </span>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xl">
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Post Excerpt */}
      {post.excerpt && (
        <p className="text-base sm:text-lg text-text font-medium leading-relaxed italic border-l-2 border-accent pl-4 py-1 text-slate-200">
          {post.excerpt}
        </p>
      )}

      {/* Post Content */}
      <div className="prose prose-invert max-w-none pt-4">
        {post.content?.content ? (
          post.content.content.map(renderTiptapNode)
        ) : typeof post.content === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        ) : (
          <p className="text-text-muted leading-relaxed">
            Contenido técnico y análisis de trading estructurado por el equipo de Invest Oil LLC.
          </p>
        )}
      </div>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-8 border-t border-border flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-subtle flex items-center gap-1 font-mono">
            <Tag className="w-3.5 h-3.5" />
            <span>Categorías & Tags:</span>
          </span>
          {post.tags.map((t) => (
            <Badge key={t} variant="default">
              #{t}
            </Badge>
          ))}
        </div>
      )}

      {/* CTA Box */}
      <div className="p-8 rounded-2xl border border-accent/40 bg-card/90 shadow-glow-accent/20 flex flex-col sm:flex-row items-center justify-between gap-6 mt-12">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-heading font-bold text-lg text-text">
            ¿Interesado en cotizar este producto o ruta?
          </h3>
          <p className="text-xs text-text-muted">
            Nuestro equipo de trading estructura contratos a medida según tu volumen, especificaciones e Incoterms.
          </p>
        </div>
        <Link href="/contact">
          <Button variant="accent" size="md" className="gap-2 shrink-0">
            <span>Contactar Trading Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="pt-12 border-t border-border/80 space-y-6">
          <h3 className="font-heading font-bold text-xl text-text">
            Artículos Recomendados de Mercado
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedPosts.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="p-5 rounded-xl border border-border bg-card/60 hover:border-accent/50 transition-all group block space-y-2"
              >
                <div className="text-[11px] font-mono text-accent">
                  {formatDate(rel.published_at || rel.created_at)}
                </div>
                <h4 className="font-heading font-semibold text-sm text-text group-hover:text-accent transition-colors line-clamp-2">
                  {rel.title}
                </h4>
                <p className="text-xs text-text-muted line-clamp-2">{rel.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
