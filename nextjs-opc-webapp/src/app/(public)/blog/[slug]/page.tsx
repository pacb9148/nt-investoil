import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Eye, Share2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewsRepublishBadge } from '@/components/blog/news-republish-badge';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { type Post } from '@/types';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!post) {
    return {
      title: 'Artículo de Blog | Invest Oil LLC',
    };
  }

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
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
        <Level key={index} className="font-heading font-bold text-text mt-8 mb-4">
          {node.content?.map(renderTiptapNode)}
        </Level>
      );
    }
    case 'paragraph': {
      return (
        <p key={index} className="text-text-muted leading-relaxed mb-5">
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
  let post: Post | null = null;

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select('*, categories(*)')
      .eq('slug', params.slug)
      .single();

    if (data) post = data;
  } catch (e) {
    // Handled below
  }

  // Fallback demo for static preview if database not initialized
  if (!post) {
    if (params.slug.includes('pet-coke')) {
      post = {
        id: 'p-demo',
        slug: params.slug,
        title: 'Dinámica del Suministro de Pet Coke hacia los Principales Centros Industriales de Asia',
        excerpt: 'Un análisis exhaustivo sobre la evolución de la demanda de coque de petróleo verde (green pet coke) para cementeras y metalurgia pesada en Asia oriental.',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'El papel estratégico del Pet Coke en la matriz industrial' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'El coque de petróleo verde con especificaciones PC-4500 (azufre < 4.5%, HGI 40-45) continúa consolidándose como una de las materias primas fundamentales para la competitividad de las plantas de cemento y fundición en Asia.',
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Logística marítima y fletamento seguro' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Invest Oil coordina fletamentos con buques Supramax y Handymax, asegurando un estricto cumplimiento de ventanas de carga y minimizando mermas operativas.',
                },
              ],
            },
          ],
        },
        status: 'published',
        featured_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Pet Coke', 'Asia', 'Trading', 'Logística'],
        reading_time: 5,
        views: 342,
        is_republished: false,
      };
    } else {
      notFound();
    }
  }

  return (
    <article className="pt-32 pb-24 max-w-4xl mx-auto px-4 md:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a todos los artículos</span>
          </Button>
        </Link>
      </div>

      {/* Meta header */}
      <div className="space-y-4">
        {post.is_republished && (
          <NewsRepublishBadge
            sourceName={post.original_source_name}
            sourceUrl={post.original_source_url}
          />
        )}

        <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-text leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-2 border-b border-border/60 pb-6">
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
            Contenido técnico en revisión por el equipo editorial de Invest Oil LLC.
          </p>
        )}
      </div>

      {/* Tags Footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-8 border-t border-border flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-subtle flex items-center gap-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Temas:</span>
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
            ¿Interesado en cotizar este producto?
          </h3>
          <p className="text-xs text-text-muted">
            Nuestro equipo de trading estructura contratos a medida según tu volumen y destino.
          </p>
        </div>
        <Link href="/contact">
          <Button variant="accent" size="md">
            Contactar Trading Desk
          </Button>
        </Link>
      </div>
    </article>
  );
}
