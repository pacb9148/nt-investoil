'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TEAM_MEMBERS } from '@/lib/constants/investoil';
import type { TeamMember } from '@/types';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  User,
  Loader2,
} from 'lucide-react';
import { MediaUploadField } from '@/components/admin/media-upload-field';

const INPUT =
  'w-full rounded-lg bg-card/70 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent transition-colors';
const LABEL = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function TeamEditorPage() {
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // 1. Cargar desde localStorage
    try {
      const local = localStorage.getItem('investoil_team_members');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTeam(parsed);
        }
      }
    } catch {}

    // 2. Cargar desde API
    fetch('/api/content/team')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeam(data);
          try {
            localStorage.setItem('investoil_team_members', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateMember = (id: string, field: keyof TeamMember, val: string) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const addMember = () => {
    const newIdx = team.length + 1;
    const newMember: TeamMember = {
      id: `t-${Date.now().toString().slice(-4)}`,
      number: `#${newIdx < 10 ? '0' + newIdx : newIdx}`,
      name: '',
      role: '',
      location: 'Madrid',
      image: '',
    };
    setTeam((prev) => [...prev, newMember]);
  };

  const removeMember = (id: string) => {
    if (team.length <= 1) {
      alert('Debe permanecer al menos un miembro en el equipo directivo.');
      return;
    }
    setTeam((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/content/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.members) {
          setTeam(data.members);
        }
      }

      try {
        localStorage.setItem('investoil_team_members', JSON.stringify(team));
        window.dispatchEvent(new CustomEvent('investoil_team_updated', { detail: team }));
      } catch {}

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
      try {
        localStorage.setItem('investoil_team_members', JSON.stringify(team));
        window.dispatchEvent(new CustomEvent('investoil_team_updated', { detail: team }));
      } catch {}
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-36">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Contenido</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Consejo Directivo y Dirección Ejecutiva
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Gestiona los directivos, añade o elimina perfiles y selecciona o sube las fotografías oficiales.
          </p>
        </div>

        <button
          type="button"
          onClick={addMember}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 border border-accent/40 text-accent hover:bg-accent/25 text-xs font-bold transition-all self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Directivo</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {team.map((m: TeamMember, idx: number) => (
          <div key={m.id} className="rounded-xl border border-border bg-surf/50 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-mono text-accent font-semibold flex items-center gap-2">
                <span>0{idx + 1}.</span> {m.name || 'Nuevo Miembro'} ({m.number})
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-text-subtle">ID: {m.id}</span>
                <button
                  type="button"
                  onClick={() => removeMember(m.id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors"
                  title="Eliminar este directivo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Nombre Completo</label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMember(m.id, 'name', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Carlos Medina"
                    required
                  />
                </div>
                <div>
                  <label className={LABEL}>Cargo Directivo</label>
                  <input
                    type="text"
                    value={m.role}
                    onChange={(e) => updateMember(m.id, 'role', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Director General & Trading Head"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={LABEL}>Sede / Ubicación</label>
                  <input
                    type="text"
                    value={m.location}
                    onChange={(e) => updateMember(m.id, 'location', e.target.value)}
                    className={INPUT}
                    placeholder="ej. Madrid, Houston, Dubái"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  {/* Selector universal de fotos con botón de buscar archivo y preview */}
                  <MediaUploadField
                    label="Fotografía / Retrato Oficial (Subir o URL)"
                    value={m.image}
                    onChange={(url) => updateMember(m.id, 'image', url)}
                    accept="image"
                    placeholder="https://... o seleccione un archivo local"
                    description="Formatos recomendados: JPG, PNG o WebP en proporción cuadrada (1:1)."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {saved && (
          <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>✓ Equipo directivo guardado y actualizado con éxito</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={addMember}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-card border border-border text-xs font-semibold text-text hover:text-accent hover:border-accent/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-accent" />
            <span>+ Añadir otro miembro</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando cambios...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios del Equipo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
