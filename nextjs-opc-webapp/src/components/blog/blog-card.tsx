import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NewsRepublishBadge } from './news-republish-badge';
import { formatDate } from '@/lib/utils';
import { type Post } from '@/types';

export function BlogCard({ post }: { post: Post }) {
  const imageUrl =
    post.featured_image_url ||
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80';

  return (
    <Card className="overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-accent/50 hover:shadow-glow-accent/20">
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
              <Badge variant="warm">REPUBLICACIÓN</Badge>
            </div>
          )}
        </Link>

        {/* Content */}
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-3 text-xs text-text-muted">
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

      <div className="p-6 pt-0 border-t border-border/40 mt-auto flex items-center justify-between">
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-neon transition-colors"
        >
          <span>Leer artículo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
}
