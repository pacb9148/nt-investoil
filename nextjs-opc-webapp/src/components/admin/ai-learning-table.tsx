'use client';

import React, { useMemo, useState } from 'react';
import {
  Brain,
  Check,
  BookOpen,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Loader2,
  X,
  ArrowUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LearnedExperienceItem, LearningReviewState } from '@/lib/ai/ai-types';

const PAGE_SIZE = 25;

const SOURCE_LABELS: Record<LearnedExperienceItem['source'], string> = {
  user_interaction: 'Interacción',
  manual_training: 'Manual',
  operator_note: 'Nota',
  consolidated: 'Consolidada',
};

const SOURCE_STYLES: Record<LearnedExperienceItem['source'], string> = {
  user_interaction: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  manual_training: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  operator_note: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/30',
  consolidated: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
};

type SortKey = 'createdAt' | 'topic' | 'occurrences' | 'user';

function userLabel(e: LearnedExperienceItem): string {
  if (e.userName || e.userCompany) return [e.userName, e.userCompany].filter(Boolean).join(' · ');
  if (e.userEmail) return e.userEmail;
  return 'Anónimo';
}

const isIdentified = (e: LearnedExperienceItem) => Boolean(e.userName || e.userCompany || e.userEmail);
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-CA');

/** Icono con tooltip propio (posición fija: no lo recorta el scroll de la tabla). */
function IconAction({
  label,
  onClick,
  children,
  tone = 'neutral',
  disabled,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'neutral' | 'good' | 'amber' | 'danger';
  disabled?: boolean;
}) {
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);
  const tones = {
    neutral: 'text-zinc-300 hover:bg-white/10 hover:text-white',
    good: 'text-emerald-300 hover:bg-emerald-500/15',
    amber: 'text-amber-300 hover:bg-amber-500/15',
    danger: 'text-red-300 hover:bg-red-500/15',
  };
  return (
    <>
      <button
        type="button"
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={(ev) => {
          const r = ev.currentTarget.getBoundingClientRect();
          setTip({ x: r.left + r.width / 2, y: r.top });
        }}
        onMouseLeave={() => setTip(null)}
        onFocus={(ev) => {
          const r = ev.currentTarget.getBoundingClientRect();
          setTip({ x: r.left + r.width / 2, y: r.top });
        }}
        onBlur={() => setTip(null)}
        className={cn('p-1.5 rounded-lg transition-colors disabled:opacity-40', tones[tone])}
      >
        {children}
      </button>
      {tip && (
        <span
          role="tooltip"
          style={{ position: 'fixed', left: tip.x, top: tip.y - 8, transform: 'translate(-50%, -100%)' }}
          className="z-[70] pointer-events-none whitespace-nowrap rounded-md border border-white/15 bg-zinc-950 px-2 py-1 text-[11px] font-medium text-zinc-100 shadow-xl"
        >
          {label}
        </span>
      )}
    </>
  );
}

const FIELD =
  'rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 [color-scheme:dark]';

export interface AiLearningTableProps {
  experiences: LearnedExperienceItem[];
  review: LearningReviewState | null;
  reviewing: boolean;
  onPromoteFaq: (exp: LearnedExperienceItem) => void;
  onPromoteKb: (exp: LearnedExperienceItem) => void;
  onDelete: (id: string) => void;
  onDeleteMany: (ids: string[]) => Promise<void>;
  onReview: () => void;
}

export function AiLearningTable({
  experiences,
  review,
  reviewing,
  onPromoteFaq,
  onPromoteKb,
  onDelete,
  onDeleteMany,
  onReview,
}: AiLearningTableProps) {
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [source, setSource] = useState('');
  const [language, setLanguage] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);

  const topics = useMemo(() => Array.from(new Set(experiences.map((e) => e.topic))).sort(), [experiences]);
  const languages = useMemo(() => Array.from(new Set(experiences.map((e) => e.language))).sort(), [experiences]);
  const users = useMemo(
    () => Array.from(new Set(experiences.filter(isIdentified).map(userLabel))).sort(),
    [experiences]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = experiences.filter((e) => {
      if (topic && e.topic !== topic) return false;
      if (source && e.source !== source) return false;
      if (language && e.language !== language) return false;
      if (userFilter === '__identified') {
        if (!isIdentified(e)) return false;
      } else if (userFilter === '__anonymous') {
        if (isIdentified(e)) return false;
      } else if (userFilter && userLabel(e) !== userFilter) return false;
      const day = dayOf(e.createdAt);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (!q) return true;
      return [e.userQuery, e.insight, e.replySummary, e.topic, userLabel(e), e.userEmail || '', ...(e.variants || [])]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
    const dir = sortDesc ? -1 : 1;
    return rows.sort((a, b) => {
      switch (sortKey) {
        case 'topic':
          return dir * a.topic.localeCompare(b.topic);
        case 'occurrences':
          return dir * ((a.occurrences ?? 1) - (b.occurrences ?? 1));
        case 'user':
          return dir * userLabel(a).localeCompare(userLabel(b));
        default:
          return dir * a.createdAt.localeCompare(b.createdAt);
      }
    });
  }, [experiences, search, topic, source, language, userFilter, from, to, sortKey, sortDesc]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const hasFilters = Boolean(search || topic || source || language || userFilter || from || to);

  const resetFilters = () => {
    setSearch('');
    setTopic('');
    setSource('');
    setLanguage('');
    setUserFilter('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(key === 'createdAt' || key === 'occurrences');
    }
  };

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) rows.forEach((r) => next.delete(r.id));
    else rows.forEach((r) => next.add(r.id));
    setSelected(next);
  };

  const deleteSelected = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`¿Descartar ${ids.length} experiencia(s) de la memoria de Oli? No se puede deshacer.`)) return;
    await onDeleteMany(ids);
    setSelected(new Set());
  };

  const SortHead = ({ k, children, className }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={cn('px-3 py-2 text-left font-semibold', className)}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 hover:text-white"
        aria-label={`Ordenar por ${children}`}
      >
        {children}
        <ArrowUpDown className={cn('w-3 h-3', sortKey === k ? 'text-amber-300' : 'text-zinc-500')} />
      </button>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          <span>Memoria de Oli ({filtered.length}{hasFilters ? ` de ${experiences.length}` : ''})</span>
        </h3>
        <div className="flex items-center gap-3 text-xs text-zinc-300">
          {review && (
            <span className="text-zinc-400">
              Última auto-revisión: {new Date(review.lastRunAt).toLocaleString('es-ES')} · {review.lastMergedCount} fusionadas
              en {review.lastConceptsCount} conceptos
            </span>
          )}
          <button
            type="button"
            onClick={onReview}
            disabled={reviewing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
            title="Detecta consultas redundantes, las funde en conceptos y las incorpora a la base de conocimiento. No toca el historial de usuarios identificados."
          >
            {reviewing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Auto-revisar memoria</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar en consulta, aprendizaje, tema o usuario..."
            aria-label="Buscar en la memoria"
            className={cn(FIELD, 'w-full pl-8 placeholder:text-zinc-400')}
          />
        </div>
        <select aria-label="Tema" value={topic} onChange={(e) => { setTopic(e.target.value); setPage(1); }} className={FIELD}>
          <option value="">Todos los temas</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select aria-label="Tipo" value={source} onChange={(e) => { setSource(e.target.value); setPage(1); }} className={FIELD}>
          <option value="">Todos los tipos</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select aria-label="Idioma" value={language} onChange={(e) => { setLanguage(e.target.value); setPage(1); }} className={FIELD}>
          <option value="">Idiomas</option>
          {languages.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
        </select>
        <select aria-label="Usuario" value={userFilter} onChange={(e) => { setUserFilter(e.target.value); setPage(1); }} className={cn(FIELD, 'max-w-[190px]')}>
          <option value="">Todos los usuarios</option>
          <option value="__identified">Solo identificados</option>
          <option value="__anonymous">Solo anónimos</option>
          {users.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <label className="flex items-center gap-1 text-[11px] text-zinc-300">
          Desde
          <input type="date" value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); setPage(1); }} className={FIELD} />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-zinc-300">
          Hasta
          <input type="date" value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); setPage(1); }} className={FIELD} />
        </label>
        {hasFilters && (
          <IconAction label="Limpiar filtros" onClick={resetFilters}>
            <X className="w-4 h-4" />
          </IconAction>
        )}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <span>{selected.size} seleccionada(s)</span>
          <button type="button" onClick={deleteSelected} className="inline-flex items-center gap-1.5 font-semibold text-red-200 hover:text-white">
            <Trash2 className="w-3.5 h-3.5" /> Descartar selección
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-900/40">
        <table className="w-full min-w-[860px] text-xs">
          <thead className="bg-zinc-950/70 text-[10px] uppercase tracking-wider text-zinc-300">
            <tr>
              <th className="w-8 px-3 py-2">
                <input type="checkbox" aria-label="Seleccionar la página" checked={allOnPageSelected} onChange={toggleAllOnPage} className="accent-amber-500" />
              </th>
              <SortHead k="createdAt">Fecha</SortHead>
              <SortHead k="topic">Tema</SortHead>
              <th className="px-3 py-2 text-left font-semibold">Tipo</th>
              <SortHead k="user">Usuario</SortHead>
              <th className="px-3 py-2 text-left font-semibold">Consulta</th>
              <SortHead k="occurrences" className="text-center">Veces</SortHead>
              <th className="px-3 py-2 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-10 text-center text-zinc-300">
                  {experiences.length === 0
                    ? 'Aún no hay experiencias registradas. Cada interacción del chat público alimentará esta memoria.'
                    : 'Ninguna experiencia coincide con los filtros.'}
                </td>
              </tr>
            )}
            {rows.map((e) => {
              const open = expanded === e.id;
              return (
                <React.Fragment key={e.id}>
                  <tr className={cn('hover:bg-white/[0.03]', open && 'bg-white/[0.04]')}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        aria-label="Seleccionar fila"
                        checked={selected.has(e.id)}
                        onChange={() => {
                          const next = new Set(selected);
                          if (next.has(e.id)) next.delete(e.id);
                          else next.add(e.id);
                          setSelected(next);
                        }}
                        className="accent-amber-500"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-zinc-200">
                      {new Date(e.createdAt).toLocaleDateString('es-ES')}
                      <span className="ml-1.5 rounded border border-white/10 bg-white/5 px-1 text-[10px] uppercase text-zinc-300">{e.language}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="whitespace-nowrap rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">{e.topic}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-semibold', SOURCE_STYLES[e.source])}>{SOURCE_LABELS[e.source]}</span>
                    </td>
                    <td className="px-3 py-2 text-zinc-200">
                      <span className={cn(!isIdentified(e) && 'text-zinc-400')}>{userLabel(e)}</span>
                    </td>
                    <td className="max-w-[340px] px-3 py-2 text-zinc-100">
                      <span className="line-clamp-2" title={e.userQuery}>{e.userQuery}</span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-zinc-200">{e.occurrences ?? 1}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconAction label={open ? 'Ocultar detalle' : 'Ver detalle'} onClick={() => setExpanded(open ? null : e.id)}>
                          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </IconAction>
                        <IconAction label="Convertir en FAQ oficial" tone="good" onClick={() => onPromoteFaq(e)}>
                          <Check className="w-4 h-4" />
                        </IconAction>
                        <IconAction label="Anexar a la base de conocimiento" tone="amber" onClick={() => onPromoteKb(e)}>
                          <BookOpen className="w-4 h-4" />
                        </IconAction>
                        <IconAction label="Descartar de la memoria" tone="danger" onClick={() => onDelete(e.id)}>
                          <Trash2 className="w-4 h-4" />
                        </IconAction>
                      </div>
                    </td>
                  </tr>
                  {open && (
                    <tr className="bg-zinc-950/50">
                      <td colSpan={8} className="space-y-2 px-6 py-3 text-zinc-200">
                        <p><span className="font-mono text-[10px] uppercase text-zinc-400">Consulta:</span> {e.userQuery}</p>
                        <p><span className="font-mono text-[10px] uppercase text-zinc-400">Aprendizaje:</span> {e.insight}</p>
                        {e.replySummary && (
                          <p><span className="font-mono text-[10px] uppercase text-zinc-400">Respuesta de Oli:</span> {e.replySummary}</p>
                        )}
                        {e.variants && e.variants.length > 0 && (
                          <div>
                            <span className="font-mono text-[10px] uppercase text-zinc-400">Otras formulaciones fusionadas:</span>
                            <ul className="mt-1 list-inside list-disc text-zinc-300">
                              {e.variants.map((v) => <li key={v}>{v}</li>)}
                            </ul>
                          </div>
                        )}
                        <p className="text-[11px] text-zinc-400">
                          {e.userEmail ? `Email: ${e.userEmail} · ` : ''}
                          {e.sessionId ? `Sesión: ${e.sessionId.slice(-8)} · ` : ''}
                          Última vez: {new Date(e.lastSeenAt || e.createdAt).toLocaleString('es-ES')}
                        </p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between text-xs text-zinc-300">
          <span>Página {current} de {pages}</span>
          <div className="flex items-center gap-1">
            <IconAction label="Página anterior" onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1}>
              <ChevronLeft className="w-4 h-4" />
            </IconAction>
            <IconAction label="Página siguiente" onClick={() => setPage(Math.min(pages, current + 1))} disabled={current === pages}>
              <ChevronRight className="w-4 h-4" />
            </IconAction>
          </div>
        </div>
      )}
    </div>
  );
}
