'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { BlogCard } from './blog-card';
import { Input } from '@/components/ui/input';
import { type Post, type Category } from '@/types';

export function BlogGrid({
  posts,
  categories = [],
}: {
  posts: Post[];
  categories?: Category[];
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory) {
      if (post.categories && post.categories.length > 0) {
        return post.categories.some((c) => c.slug === selectedCategory);
      }
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-surf/80">
        <div className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Buscar por título, tag o tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-3.5 pointer-events-none" />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
              selectedCategory === null
                ? 'bg-accent text-bg shadow-glow-accent'
                : 'bg-card text-text-muted hover:text-text border border-border'
            }`}
          >
            Todos ({posts.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-accent text-bg shadow-glow-accent'
                  : 'bg-card text-text-muted hover:text-text border border-border'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-xl border border-border bg-surf/40 space-y-2">
          <h3 className="font-heading font-bold text-lg text-text">No se encontraron artículos</h3>
          <p className="text-xs text-text-muted">
            Intenta con otro término de búsqueda o selecciona otra categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
