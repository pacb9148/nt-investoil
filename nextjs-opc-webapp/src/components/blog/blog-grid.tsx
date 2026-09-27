'use client';

import { LABELS_EN } from '@/lib/i18n/content-en';
import React, { useMemo, useState } from 'react';
import { Search, X, Layers, List as ListIcon, LayoutGrid, CalendarClock } from 'lucide-react';
import { BlogCard } from './blog-card';
import { BlogListRow } from './blog-list-row';
import { Input } from '@/components/ui/input';
import { formatDate, cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-context';
import { type Post, type Category } from '@/types';

type ViewMode = 'grid' | 'list' | 'date';

/** Fecha efectiva del artículo (publicación, o creación si aún no tiene) para ordenar y agrupar. */
function postDate(post: Post): number {
  return new Date(post.published_at || post.created_at || 0).getTime();
}

function dayKey(post: Post): string {
  const d = new Date(post.published_at || post.created_at || 0);
  return Number.isNaN(d.getTime()) ? 'sin-fecha' : d.toLocaleDateString('en-CA');
}

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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [dateFilter, setDateFilter] = useState('');

  const filteredPosts = posts.filter((post) => {
    const pCatName = typeof post.category === 'string' ? post.category : post.category?.name || '';
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      (pCatName && pCatName.toLowerCase().includes(search.toLowerCase())) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase())) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

    if (!matchesSearch) return false;

    if (selectedCategory !== 'all') {
      const targetCat = categories.find((c) => c.slug === selectedCategory);
      const matches =
        (post.category_id && targetCat && post.category_id === targetCat.id) ||
        (pCatName && targetCat && pCatName.toLowerCase() === targetCat.name.toLowerCase()) ||
        (post.categories && post.categories.some((c) => c.slug === selectedCategory || (targetCat && c.id === targetCat.id)));
      if (!matches) return false;
    }

    if (viewMode === 'date' && dateFilter && dayKey(post) !== dateFilter) return false;

    return true;
  });

  // Orden por defecto: fecha de publicación más reciente primero, siempre (con independencia del
  // orden en que llegaron los artículos).
  const sortedPosts = useMemo(() => [...filteredPosts].sort((a, b) => postDate(b) - postDate(a)), [filteredPosts]);

  const groupedByDay = useMemo(() => {
    const groups: { key: string; label: string; items: Post[] }[] = [];
    for (const post of sortedPosts) {
      const key = dayKey(post);
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = { key, label: formatDate(post.published_at || post.created_at), items: [] };
        groups.push(group);
      }
      group.items.push(post);
    }
    return groups;
  }, [sortedPosts]);

  const VIEW_OPTIONS: { id: ViewMode; label: string; labelEn: string; icon: typeof ListIcon }[] = [
    { id: 'grid', label: 'Ver como tarjetas', labelEn: 'View as cards', icon: LayoutGrid },
    { id: 'list', label: 'Ver como lista', labelEn: 'View as list', icon: ListIcon },
    { id: 'date', label: 'Ver por fecha', labelEn: 'View by date', icon: CalendarClock },
  ];

  return (
    <div className="space-y-8">
      {/* Controles: buscador, categoría y vista */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border/80 bg-surf/80 backdrop-blur-md shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:flex-1">
            <Input
              placeholder={
                isEn ? 'Search by title, tag or market topic...' : 'Buscar por título, tag o tema petrolero...'
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

          <div className="relative w-full sm:w-64 shrink-0">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label={isEn ? 'Filter by category' : 'Filtrar por categoría'}
              className="w-full appearance-none pl-9 pr-8 h-10 text-xs rounded-lg bg-card border border-border text-text focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">{isEn ? 'All categories' : 'Todas las categorías'}</option>
              {categories.map((cat) => {
                const label = isEn ? (cat.name_en && cat.name_en !== cat.name ? cat.name_en : LABELS_EN[cat.name] || cat.name) : cat.name;
                return (
                  <option key={cat.slug} value={cat.slug}>
                    {label}
                  </option>
                );
              })}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-subtle pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-card/60 shrink-0">
            {VIEW_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = viewMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setViewMode(opt.id)}
                  aria-label={isEn ? opt.labelEn : opt.label}
                  title={isEn ? opt.labelEn : opt.label}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    active ? 'bg-accent text-bg shadow-sm' : 'text-text-muted hover:text-text hover:bg-surf'
                  )}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {viewMode === 'date' && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/60 mt-1">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label={isEn ? 'Filter by publish date' : 'Filtrar por fecha de publicación'}
              className="px-2.5 py-1.5 text-xs rounded-lg bg-card border border-border text-text focus:outline-none focus:border-accent [color-scheme:dark]"
            />
            {dateFilter && (
              <button type="button" onClick={() => setDateFilter('')} className="text-[11px] font-mono text-accent hover:underline">
                {isEn ? 'All dates' : 'Todas las fechas'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Resultado */}
      {sortedPosts.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl border border-border/80 bg-surf/40 space-y-3">
          <h3 className="font-heading font-bold text-lg text-text">
            {isEn ? 'No articles found' : 'No se encontraron artículos'}
          </h3>
          <p className="text-xs text-text-muted max-w-md mx-auto">
            {isEn
              ? 'Try changing the search query or clearing the category filter.'
              : 'Intenta con otro término de búsqueda o selecciona otra categoría.'}
          </p>
          {(search || selectedCategory !== 'all' || dateFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setDateFilter('');
              }}
              className="mt-2 text-xs font-semibold text-accent hover:underline"
            >
              {isEn ? 'Reset all filters' : 'Restablecer todos los filtros'}
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-2.5">
          {sortedPosts.map((post) => (
            <BlogListRow key={post.id} post={post} />
          ))}
        </div>
      ) : dateFilter ? (
        <div className="space-y-2.5">
          {sortedPosts.map((post) => (
            <BlogListRow key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map((group) => (
            <div key={group.key} className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-text-subtle">
                <CalendarClock className="w-3.5 h-3.5 text-accent" />
                <span>{group.label}</span>
                <span className="text-text-subtle/70">({group.items.length})</span>
              </div>
              <div className="space-y-2.5">
                {group.items.map((post) => (
                  <BlogListRow key={post.id} post={post} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
