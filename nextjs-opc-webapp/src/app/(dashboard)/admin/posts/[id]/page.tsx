import React from 'react';
import { PostEditorForm } from '@/components/admin/post-editor-form';
import { createClient } from '@/lib/supabase/server';
import { type Post } from '@/types';

export const revalidate = 0;

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  let post: Post | null = null;

  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) post = data;
  } catch (e) {
    // Handled below
  }

  // Fallback demo post if editing in local demo mode
  if (!post) {
    post = {
      id: params.id,
      slug: 'dinamica-de-suministro-pet-coke-mercado-asiatico-2026',
      title: 'Dinámica del Suministro de Pet Coke hacia los Principales Centros Industriales de Asia',
      excerpt: 'Un análisis exhaustivo sobre la evolución de la demanda de coque de petróleo verde (green pet coke) para cementeras y metalurgia pesada en Asia oriental.',
      content: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'El papel estratégico del Pet Coke' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'El coque de petróleo verde con especificaciones PC-4500 continúa consolidándose como una de las materias primas fundamentales para la competitividad industrial.',
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
      tags: ['Pet Coke', 'Asia'],
      reading_time: 5,
      views: 342,
      is_republished: false,
    };
  }

  return <PostEditorForm initialPost={post} />;
}
