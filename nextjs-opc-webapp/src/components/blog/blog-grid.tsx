'use client';

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { BlogCard } from './blog-card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n/language-context';
import { type Post, type Category } from '@/types';

export function BlogGrid({
  posts,
  categories = [],
}: {
  posts: Post[];
  categories?: Category[];
}) {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Contar publicaciones por categoría
  const countByCategory = (slug: string) => {
    const targetCat = categories.find((c) => c.slug === slug);
    return posts.filter((p) => {
      const pCatName = typeof p.category === 'string' ? p.category : p.category?.name || '';
      if (p.category_id && targetCat && p.category_id === targetCat.id) return true;
      if (pCatName && targetCat && pCatName.toLowerCase() === targetCat.name.toLowerCase()) return true;
      if (p.categories && p.categories.some((c) => c.slug === slug || (targetCat && c.id === targetCat.id))) return true;
      return false;
    }).length;
  };

  const filteredPosts = posts.filter((post) => {
    const pCatName = typeof post.category === 'string' ? post.category : post.category?.name || '';
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (pCatName && pCatName.toLowerCase().includes(search.toLowerCase())) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory) {
      const targetCat = categories.find((c) => c.slug === selectedCategory);
      const matches =
        (post.category_id && targetCat && post.category_id === targetCat.id) ||
        (pCatName && targetCat && pCatName.toLowerCase() === targetCat.name.toLowerCase()) ||
        (post.categories && post.categories.some((c) => c.slug === selectedCategory || (targetCat && c.id === targetCat.id)));
      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border/80 bg-surf/80 backdrop-blur-md shadow-lg">
        {/* Barra superior: Buscador + Limpiador */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-sm">
            <Input
              placeholder={
                isEn
                  ? 'Search by title, tag or market topic...'
                  : 'Buscar por título, tag o tema petrolero...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-3.5 pointer-events-none" />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-3.5 text-text-subtle hover:text-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted self-start sm:self-auto font-mono">
            <Filter className="w-3.5 h-3.5 text-accent" />
            <span>
              {isEn
                ? `Showing ${filteredPosts.length} of ${posts.length} articles`
                : `Mostrando ${filteredPosts.length} de ${posts.length} artículos`}
            </span>
          </div>
        </div>

        {/* Categorías como pills con contador */}
        <div className="pt-2 border-t border-border/60">
          <div className="text-[11px] font-mono text-text-subtle uppercase tracking-wider mb-2.5">
            {isEn ? 'Filter by category:' : 'Filtrar por categoría temática:'}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 ${
                selectedCategory === null
                  ? 'bg-accent text-bg shadow-glow-accent scale-105'
                  : 'bg-card text-text-muted hover:text-text hover:border-accent/40 border border-border'
              }`}
            >
              {isEn ? 'All' : 'Todos'} ({posts.length})
            </button>
            {categories.map((cat) => {
              const count = countByCategory(cat.slug);
              const label = isEn && cat.name_en ? cat.name_en : cat.name;
              const isSelected = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-accent text-bg shadow-glow-accent scale-105'
                      : 'bg-card text-text-muted hover:text-text hover:border-accent/40 border border-border'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || '#f59e0b' }}
                  />
                  <span>{label}</span>
                  <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-bg/20 text-bg' : 'bg-surf text-text-subtle'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl border border-border/80 bg-surf/40 space-y-3">
          <h3 className="font-heading font-bold text-lg text-text">
            {isEn ? 'No articles found' : 'No se encontraron artículos'}
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {isEn
              ? 'Try changing the search query or clearing the category filter.'
              : 'Intenta con otro término de búsqueda o selecciona otra categoría.'}
          </p>
          {(search || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory(null);
              }}
              className="mt-2 text-xs font-semibold text-accent hover:underline"
            >
              {isEn ? 'Reset all filters' : 'Restablecer todos los filtros'}
            </button>
          )}
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
