'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Tag,
  Palette,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';
import type { Category } from '@/types';

interface CategoriesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated?: (newCategory: Category) => void;
}

const PRESET_COLORS = [
  '#f59e0b', // Ámbar
  '#06b6d4', // Cyan
  '#eab308', // Oro
  '#10b981', // Esmeralda
  '#ec4899', // Rosa
  '#8b5cf6', // Violeta
  '#3b82f6', // Azul
  '#ef4444', // Rojo
];

export function CategoriesManagerModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: CategoriesManagerModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#f59e0b');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setMessage(null);
      setError(null);
    }
  }, [isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la categoría es obligatorio.');
      return;
    }

    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || slugify(name),
          description: description.trim(),
          color,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al crear categoría');
      }

      setMessage(`Categoría "${data.category.name}" guardada en la base de datos.`);
      setName('');
      setSlug('');
      setDescription('');
      setCategories((prev) => [...prev, data.category]);

      if (onCategoryCreated) {
        onCategoryCreated(data.category);
      }
    } catch (err: any) {
      setError(err.message || 'Error al persistir categoría en la base de datos');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`¿Deseas eliminar la categoría "${catName}"? Solo es posible si no tiene artículos asociados.`)) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar');
      }

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMessage(`Categoría "${catName}" eliminada correctamente.`);
    } catch (err: any) {
      setError(err.message || 'No se pudo eliminar la categoría');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surf/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/30 text-accent">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-text">
                Gestión de Categorías del Blog
              </h2>
              <p className="text-xs text-text-muted">
                Crea y administra las categorías almacenadas en la base de datos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-subtle hover:text-text hover:bg-card transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {message && (
            <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Formulario para Crear Nueva Categoría */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl border border-border bg-surf/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent font-mono">
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Categoría</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej. Trading de Crudo Spot"
                  className="w-full bg-card border border-border text-text rounded-lg px-3 py-2 text-xs focus:border-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1">
                  Slug URL *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="trading-crudo-spot"
                  className="w-full bg-card border border-border text-text rounded-lg px-3 py-2 text-xs focus:border-accent focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1">
                Descripción Editorial
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve alcance temático de los análisis asignados a esta categoría..."
                className="w-full bg-card border border-border text-text rounded-lg px-3 py-2 text-xs focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3 h-3 text-accent" />
                  <span>Color Distintivo</span>
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-card' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                    title="Color personalizado"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="accent"
                size="sm"
                disabled={creating || !name.trim()}
                className="gap-1.5 shadow-glow-accent w-full sm:w-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{creating ? 'Guardando en BD...' : 'Guardar Categoría en BD'}</span>
              </Button>
            </div>
          </form>

          {/* Lista de Categorías Existentes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span>Categorías Existentes ({categories.length})</span>
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-text-muted">Cargando categorías...</div>
            ) : categories.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted border border-border/60 rounded-xl">
                No hay categorías registradas en la base de datos.
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color || '#f59e0b' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-text">{cat.name}</span>
                          <span className="text-[10px] font-mono text-text-subtle">/{cat.slug}</span>
                        </div>
                        {cat.description && (
                          <p className="text-[11px] text-text-muted truncate max-w-md">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 rounded-lg text-text-subtle hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar categoría (solo si no tiene artículos asociados)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-border bg-surf/80 flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
