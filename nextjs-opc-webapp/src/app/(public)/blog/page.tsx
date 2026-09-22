import React from 'react';
import type { Metadata } from 'next';
import { BlogGrid } from '@/components/blog/blog-grid';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/server';
import { type Post, type Category } from '@/types';

export const metadata: Metadata = {
  title: 'Blog & Análisis de Mercados Energéticos',
  description: 'Informes de mercado, análisis de cotizaciones de crudo, dinámicas de fletes y noticias de trading por el equipo de Invest Oil LLC.',
};

export const revalidate = 60; // ISR cache revalidation

export default async function BlogPage() {
  let posts: Post[] = [];
  let categories: Category[] = [];

  try {
    const supabase = createClient();
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, categories(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (postsData && postsData.length > 0) {
      posts = postsData;
    }

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesData && categoriesData.length > 0) {
      categories = categoriesData;
    }
  } catch (error) {
    console.warn('Fallback a datos locales para blog:', error);
  }

  // Fallback demo posts if DB is not populated yet
  if (posts.length === 0) {
    posts = [
      {
        id: 'p-1',
        slug: 'dinamica-de-suministro-pet-coke-mercado-asiatico-2026',
        title: 'Dinámica del Suministro de Pet Coke hacia los Principales Centros Industriales de Asia',
        excerpt: 'Un análisis exhaustivo sobre la evolución de la demanda de coque de petróleo verde (green pet coke) para cementeras y metalurgia pesada en Asia oriental durante el presente ejercicio.',
        content: null,
        status: 'published',
        featured_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Pet Coke', 'Asia', 'Trading', 'Logística'],
        reading_time: 5,
        views: 342,
        is_republished: false,
      },
      {
        id: 'p-2',
        slug: 'merey-16-demanda-refinerias-complejas-diferenciales',
        title: 'Merey 16: Demanda Sólida en Refinerías de Alta Conversión y Dinámica de Diferenciales',
        excerpt: 'Evaluación del comportamiento del crudo pesado venezolano Merey 16 (16° API) en refinerías asiáticas con unidades de coquización retardada e hidrocraqueo profundo.',
        content: null,
        status: 'published',
        featured_image_url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Merey 16', 'Crudo Pesado', 'Refinación', 'Trading'],
        reading_time: 4,
        views: 512,
        is_republished: false,
      },
      {
        id: 'p-3',
        slug: 'cobertura-riesgos-financieros-mercado-petrolero-global',
        title: 'Estrategias Avanzadas de Cobertura y Gestión de Riesgo en Transacciones de Crudo',
        excerpt: 'Cómo blindar márgenes en operaciones spot y term mediante instrumentos derivados, cartas de crédito documentarias y compliance riguroso en comercio internacional.',
        content: null,
        status: 'published',
        featured_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Riesgo Financiero', 'Compliance', 'Derivados', 'Contratos'],
        reading_time: 6,
        views: 289,
        is_republished: false,
      },
      {
        id: 'p-4',
        slug: 'suministro-diesel-en590-normativa-bajo-azufre',
        title: 'Perspectivas del Diésel EN590: Calidad Ultra Baja en Azufre y Eficiencia en Transporte',
        excerpt: 'El combustible EN590 (< 10 ppm de azufre) continúa siendo la columna vertebral del transporte de carga pesada y distribución europea e internacional.',
        content: null,
        status: 'published',
        featured_image_url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['Diesel EN590', 'Refinados', 'Logística', 'Europa'],
        reading_time: 4,
        views: 195,
        is_republished: false,
      },
      {
        id: 'p-5',
        slug: 'republicacion-analisis-precios-brent-iea-reuters',
        title: 'Perspectiva Global de la Demanda de Crudo según Informes de la AIE',
        excerpt: 'Resumen y análisis de las últimas proyecciones de demanda de petróleo y refinados para el segundo semestre, con foco en el balance de inventarios en Asia y Europa.',
        content: null,
        status: 'published',
        featured_image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['IEA', 'Brent', 'Mercados', 'Macroeconomía'],
        reading_time: 3,
        views: 640,
        is_republished: true,
        original_source_url: 'https://www.iea.org/reports/oil-market-report',
        original_source_name: 'International Energy Agency',
      },
    ];
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
      {/* Blog Header */}
      <div className="max-w-3xl space-y-3">
        <Badge variant="accent">ANÁLISIS & ACTUALIDAD</Badge>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-text">
          Blog de Inteligencia Energética
        </h1>
        <p className="text-base text-text-muted leading-relaxed">
          Informes técnicos, novedades de mercado, dinámicas de fletes internacionales y republicaciones clave del sector petrolero.
        </p>
      </div>

      {/* Grid with search & categories */}
      <BlogGrid posts={posts} categories={categories} />
    </div>
  );
}
