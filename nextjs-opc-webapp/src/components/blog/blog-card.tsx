'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar, ArrowRight, Video, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { type Post } from '@/types';

export function BlogCard({ post }: { post: Post & { categories?: any[] } }) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const imageUrl =
    post.featured_image_url ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';

  const category =
    post.categories && post.categories.length > 0
      ? post.categories[0]
      : post.category
      ? typeof post.category === 'string'
        ? { name: post.category, name_en: post.category, color: '#f59e0b' }
        : post.category
      : null;
  const categoryLabel = category
    ? (isEn && category.name_en ? category.name_en : category.name)
    : null;

  return (
    <Card className="overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-accent/50 hover:shadow-glow-accent/20 bg-card/90">
      <div>
        {/* Thumbnail */}
        <Link href={`/blog/${post.slug}`} className="block relative aspect-video w-full overflow-hidden bg-surf">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {post.is_republished && (
            <div className="absolute top-3 left-3">
              <Badge variant="warm">{isEn ? 'REPUBLICATED' : 'REPUBLICACIÓN'}</Badge>
            </div>
          )}
          {post.video_url && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md bg-black/80 text-cyan-400 border border-cyan-500/40">
                <Video className="w-3 h-3" />
                <span>Video</span>
              </span>
            </div>
          )}
          {categoryLabel && (
            <div className="absolute top-3 right-3">
              <span
                className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md border"
                style={{
                  backgroundColor: `${category.color || '#f59e0b'}25`,
                  borderColor: `${category.color || '#f59e0b'}60`,
                  color: category.color || '#f59e0b',
                }}
              >
                {categoryLabel}
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3 text-xs text-text-muted font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-warm" />
              <span>{post.reading_time || 3} min</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-neon" />
              <span>{post.views || 0}</span>
            </span>
          </div>

          <Link href={`/blog/${post.slug}`}>
            <h3 className="font-heading font-bold text-lg text-text group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h3>
          </Link>

          <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {post.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono text-text-subtle bg-surf px-2 py-0.5 rounded border border-border/50"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-6 pt-0 border-t border-border/40 mt-auto flex items-center justify-between text-[11px] font-mono text-text-subtle">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-neon transition-colors"
        >
          <span>{isEn ? 'Read article' : 'Leer artículo'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" title={`${post.views || 0} lecturas`}>
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{post.views || 0}</span>
          </span>
          <span className="flex items-center gap-1 text-rose-400" title={`${post.likes || 0} likes`}>
            <Heart className="w-3.5 h-3.5 fill-rose-500/20" />
            <span>{post.likes || 0}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
