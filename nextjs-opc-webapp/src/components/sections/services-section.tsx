'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, BookOpen, Newspaper, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BlogCard } from '@/components/blog/blog-card';
import { useLanguage } from '@/lib/i18n/language-context';
import type { Post } from '@/types';

export function ServicesSection({ customBg }: { customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts?status=published')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Post[]) => {
        if (Array.isArray(data) && data.length > 0) {
          // Filtrar publicados y ordenar por fecha descendente
          const sorted = [...data].sort((a, b) => {
            const dateA = new Date(a.published_at || a.created_at).getTime();
            const dateB = new Date(b.published_at || b.created_at).getTime();
            return dateB - dateA;
          });
          setPosts(sorted.slice(0, 6));
        }
      })
      .catch((err) => console.error('Error cargando posts para servicios:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      id="services"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <Badge variant="accent">
            {isEn ? 'MARKET INTELLIGENCE & RESEARCH' : 'INTELIGENCIA DE MERCADO & TRADING'}
          </Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {isEn
              ? 'Latest Strategic Oil & Energy Publications'
              : 'Publicaciones & Análisis Estratégicos del Petróleo'}
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            {isEn
              ? 'Real-time insight on Brent/WTI differentials, pet coke supply, middle distillates, and global maritime tanker routes.'
              : 'Monitoreo en tiempo real de diferenciales Brent/WTI, coque de petróleo, destilados limpios y logística de fletes marítimos.'}
          </p>
        </div>

        {/* Grid de 6 publicaciones más recientes */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-80 rounded-2xl bg-card/40 border border-border/60 animate-pulse flex flex-col justify-end p-6 space-y-3"
              >
                <div className="h-4 bg-surf rounded w-1/3" />
                <div className="h-6 bg-surf rounded w-3/4" />
                <div className="h-3 bg-surf rounded w-full" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-muted text-sm font-mono">
            {isEn
              ? 'No publications available at the moment.'
              : 'No hay publicaciones disponibles en este momento.'}
          </div>
        )}

        {/* Botón inferior de enlace completo al Blog */}
        <div className="text-center mt-12">
          <Link href="/blog">
            <Button
              variant="outline"
              size="lg"
              className="border-accent/40 text-accent hover:bg-accent hover:text-bg font-bold text-xs gap-2 px-6 h-11 transition-all shadow-glow-accent/10"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {isEn
                  ? 'Explore All Publications & Market News'
                  : 'Explorar Todos los Análisis en el Blog'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
