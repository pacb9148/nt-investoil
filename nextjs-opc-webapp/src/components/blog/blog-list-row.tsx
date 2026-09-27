'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar, Heart, Video, ArrowRight } from 'lucide-react';
import { LABELS_EN } from '@/lib/i18n/content-en';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { type Post } from '@/types';

/** Fila compacta para las vistas de lista y por fecha: misma información que la tarjeta, en una línea. */
export function BlogListRow({ post }: { post: Post & { categories?: any[] } }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const imageUrl =
    post.featured_image_url ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=200&q=80';

  const category =
    post.categories && post.categories.length > 0
      ? post.categories[0]
      : post.category
      ? typeof post.category === 'string'
        ? { name: post.category, name_en: post.category, color: '#f59e0b' }
        : post.category
      : null;
  const categoryLabel = category
    ? isEn
      ? category.name_en && category.name_en !== category.name
        ? category.name_en
        : LABELS_EN[category.name] || category.name
      : category.name
    : null;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-center gap-4 p-3 rounded-xl border border-border/80 bg-surf/60 hover:border-accent/50 hover:bg-surf transition-all"
    >
      <div className="relative w-20 h-16 sm:w-28 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-card">
        <Image src={imageUrl} alt={post.title} fill className="object-cover" sizes="112px" />
        {post.video_url && (
          <div className="absolute bottom-1 right-1">
            <Video className="w-3.5 h-3.5 text-cyan-400 drop-shadow" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-text-subtle">
          {categoryLabel && (
            <span
              className="px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
              style={{ backgroundColor: `${category.color || '#f59e0b'}25`, color: category.color || '#f59e0b' }}
            >
              {categoryLabel}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-accent" />
            {formatDate(post.published_at || post.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-warm" />
            {post.reading_time || 3} min
          </span>
        </div>

        <h3 className="font-heading font-bold text-sm sm:text-base text-text group-hover:text-accent transition-colors truncate">
          {post.title}
        </h3>

        <p className="text-xs text-text-muted line-clamp-1 sm:line-clamp-2">{post.excerpt}</p>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 text-[11px] font-mono text-text-subtle">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          {post.views || 0}
        </span>
        <span className="flex items-center gap-1 text-rose-400">
          <Heart className="w-3.5 h-3.5" />
          {post.likes || 0}
        </span>
      </div>

      <ArrowRight className="hidden md:block w-4 h-4 text-text-subtle group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
  );
}
