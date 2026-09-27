'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/blog-card';
import { useLanguage } from '@/lib/i18n/language-context';
import { DEFAULT_ACTUALIDAD, type ActualidadConfig } from '@/lib/constants/actualidad-defaults';
import type { Post } from '@/types';

export function NewsSection({ customBg }: { customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ActualidadConfig>(DEFAULT_ACTUALIDAD);

  useEffect(() => {
    fetch('/api/content/actualidad')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setConfig((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/posts?status=published')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Post[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => {
            const dateA = new Date(a.published_at || a.created_at).getTime();
            const dateB = new Date(b.published_at || b.created_at).getTime();
            return dateB - dateA;
          });
          setPosts(sorted.slice(0, config.cardCount));
        }
      })
      .catch((err) => console.error('Error cargando publicaciones de Actualidad:', err))
      .finally(() => setLoading(false));
  }, [config.cardCount]);

  const badge = (isEn ? config.badgeTextEn : config.badgeText) || DEFAULT_ACTUALIDAD.badgeText;
  const title = (isEn ? config.titleEn : config.title) || DEFAULT_ACTUALIDAD.title;
  const subtitle = (isEn ? config.subtitleEn : config.subtitle) || DEFAULT_ACTUALIDAD.subtitle;

  // Flexbox con ancho fijo por tarjeta (en vez de CSS Grid) para que la última fila incompleta quede
  // centrada en lugar de pegada a la izquierda con un hueco vacío a la derecha.
  const cardWidth = 'w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]';

  return (
    <section
      id="actualidad"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="accent">{badge}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">{title}</h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">{subtitle}</p>
        </div>

        {loading ? (
          <div className="flex flex-wrap justify-center gap-6">
            {Array.from({ length: Math.min(config.cardCount, 6) }).map((_, idx) => (
              <div
                key={idx}
                className={`${cardWidth} h-80 rounded-2xl bg-card/40 border border-border/60 animate-pulse flex flex-col justify-end p-6 space-y-3`}
              >
                <div className="h-4 bg-surf rounded w-1/3" />
                <div className="h-6 bg-surf rounded w-3/4" />
                <div className="h-3 bg-surf rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-6">
            {posts.map((post) => (
              <div key={post.id} className={cardWidth}>
                <BlogCard post={post} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted text-sm font-mono">
            {isEn ? 'No publications available at the moment.' : 'No hay publicaciones disponibles en este momento.'}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/blog">
            <Button
              variant="outline"
              size="lg"
              className="border-accent/40 text-accent hover:bg-accent hover:text-bg font-bold text-xs gap-2 px-6 h-11 transition-all shadow-glow-accent/10"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? 'Explore All Publications & Market News' : 'Explorar Todos los Análisis en el Blog'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
