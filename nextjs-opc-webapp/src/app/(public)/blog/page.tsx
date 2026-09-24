import React from 'react';
import type { Metadata } from 'next';
import { BlogGrid } from '@/components/blog/blog-grid';
import { Badge } from '@/components/ui/badge';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCuratedCategories, getCuratedPosts } from '@/lib/constants/blog-data';
import { type Post, type Category } from '@/types';

export const metadata: Metadata = {
  title: 'Blog & Análisis de Mercados Energéticos | Invest Oil LLC',
  description:
    'Informes de mercado, análisis de cotizaciones de crudo, dinámicas de fletes y noticias de trading por el equipo de Invest Oil LLC.',
};

export const revalidate = 0; // Dynamic blog feed from database

export default async function BlogPage() {
  const { getPosts, getCategories } = await import('@/lib/db/db-service');
  const [posts, categories] = await Promise.all([
    getPosts({ status: 'published' }),
    getCategories(),
  ]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
      {/* Blog Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">ANÁLISIS & ACTUALIDAD PETROLERA</Badge>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-text">
          Blog de Inteligencia Energética
        </h1>
        <p className="text-base text-text-muted leading-relaxed">
          Informes técnicos, cotizaciones de crudo y refinados, dinámicas de fletes marítimos, regulaciones internacionales y análisis de mercado por Invest Oil LLC.
        </p>
      </div>

      {/* Grid with search & categories */}
      <BlogGrid posts={posts} categories={categories} />
    </div>
  );
}
