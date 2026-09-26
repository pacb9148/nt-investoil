import React from 'react';
import type { Metadata } from 'next';
import { BlogGrid } from '@/components/blog/blog-grid';
import { Badge } from '@/components/ui/badge';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getCuratedCategories, getCuratedPosts } from '@/lib/constants/blog-data';
import { type Post, type Category } from '@/types';
import { getServerLanguage } from '@/lib/i18n/server-language';

export function generateMetadata(): Metadata {
  return getServerLanguage() === 'en'
    ? {
        title: 'Blog & Energy Market Analysis | Invest Oil LLC',
        description: 'Market reports, crude price analysis, freight dynamics and trading news by the Invest Oil LLC team.',
      }
    : {
        title: 'Blog & Análisis de Mercados Energéticos | Invest Oil LLC',
        description:
          'Informes de mercado, análisis de cotizaciones de crudo, dinámicas de fletes y noticias de trading por el equipo de Invest Oil LLC.',
      };
}

export const revalidate = 0; // Dynamic blog feed from database

export default async function BlogPage() {
  const isEn = getServerLanguage() === 'en';
  const { getPosts, getCategories } = await import('@/lib/db/db-service');
  // Si la base falla, el blog se muestra vacío (y el error queda en el log) en vez de romper la página.
  const [posts, categories] = await Promise.all([
    getPosts({ status: 'published' }).catch(() => [] as Post[]),
    getCategories(),
  ]);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
      {/* Blog Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">{isEn ? 'OIL ANALYSIS & NEWS' : 'ANÁLISIS & ACTUALIDAD PETROLERA'}</Badge>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-text">
          {isEn ? 'Energy Intelligence Blog' : 'Blog de Inteligencia Energética'}
        </h1>
        <p className="text-base text-text-muted leading-relaxed">
          {isEn
            ? 'Technical reports, crude and refined-product quotations, maritime freight dynamics, international regulations and market analysis by Invest Oil LLC.'
            : 'Informes técnicos, cotizaciones de crudo y refinados, dinámicas de fletes marítimos, regulaciones internacionales y análisis de mercado por Invest Oil LLC.'}
        </p>
      </div>

      {/* Grid with search & categories */}
      <BlogGrid posts={posts} categories={categories} />
    </div>
  );
}
