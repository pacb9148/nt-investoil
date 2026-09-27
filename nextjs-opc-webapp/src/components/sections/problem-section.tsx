'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/language-context';
import { PROBLEMS_EN, localized, localizedRich } from '@/lib/i18n/content-en';
import { TiptapContent, tiptapToPlainText } from '@/components/blog/tiptap-content';
import type { ProblemItem } from '@/types';

const PREVIEW_LENGTH = 128;

const DEFAULT_PROBLEMS: ProblemItem[] = [
  {
    id: 'prob-01',
    num: '01',
    title: 'Intermediación Ineficiente y Falta de Trazabilidad',
    desc: 'Cadenas de intermediarios sin capacidad real de fletamento que encarecen el barril y dilatan las ventanas de carga contractuales.',
    solution: 'En Invest Oil tratamos directamente con refinerías, productores y fletadores certificados bajo protocolos KYC de máxima exigencia.',
  },
  {
    id: 'prob-02',
    num: '02',
    title: 'Volatilidad Extrema y Exposición Financiera',
    desc: 'Fluctuaciones drásticas de precios internacionales sin instrumentos de cobertura ni estructuras de pago garantizadas por bancos de primer nivel.',
    solution: 'Estructuración de contratos spot y a plazo con cartas de crédito standby (SBLC), indexación contractual y gestión activa de riesgo.',
  },
  {
    id: 'prob-03',
    num: '03',
    title: 'Restricciones de Cuello de Botella Logístico',
    desc: 'Déficit de almacenamiento en terminales estratégicas, demoras en fondeo y discrepancias en inspecciones de cantidad y calidad (Q&Q).',
    solution: 'Monitoreo satelital de cargamentos, ventanas prioritarias de atraque y verificación independiente avalada por SGS e Intertek.',
  },
];

function truncate(text: string, max: number): { text: string; clipped: boolean } {
  const clean = text.trim();
  if (clean.length <= max) return { text: clean, clipped: false };
  // Corta en el último espacio para no partir una palabra por la mitad.
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return { text: (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim(), clipped: true };
}

export function ProblemSection({ customBg }: { customBg?: string }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [problems, setProblems] = useState<ProblemItem[]>(DEFAULT_PROBLEMS);
  const [openItem, setOpenItem] = useState<ProblemItem | null>(null);

  useEffect(() => {
    fetch('/api/content/problem')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProblems(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="problema"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="danger">{isEn ? 'OPERATIONAL CHALLENGES' : 'DESAFÍOS OPERATIVOS'}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {isEn ? 'Energy Market Challenges' : 'Retos del Mercado Energético'}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            {isEn
              ? "Navigating global oil trading demands solvency, regulatory rigor and active mitigation of the sector's usual bottlenecks."
              : 'Navegar el comercio petrolero global exige solvencia, rigor normativo y mitigación activa de los cuellos de botella habituales del sector.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((item) => {
            const title = localized(item, 'title', isEn, PROBLEMS_EN, item.id);
            const descPlain = tiptapToPlainText(localizedRich(item, 'desc', isEn, PROBLEMS_EN, item.id));
            const solutionRich = localizedRich(item, 'solution', isEn, PROBLEMS_EN, item.id);
            const solution: string = solutionRich ? tiptapToPlainText(solutionRich).trim() : '';
            const { text: descPreview, clipped } = truncate(descPlain, PREVIEW_LENGTH);

            return (
              <Card
                key={item.id}
                className="p-6 relative overflow-hidden group hover:border-accent/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                      {isEn ? 'CHALLENGE' : 'DESAFÍO'} #{item.num}
                    </span>
                    <AlertCircle className="w-4 h-4 text-warm" />
                  </div>

                  <h3 className="font-heading font-bold text-lg text-text group-hover:text-accent transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {descPreview}
                    {clipped && '…'}
                  </p>

                  {clipped && (
                    <button
                      type="button"
                      onClick={() => setOpenItem(item)}
                      className="text-[11px] font-mono font-semibold text-accent hover:text-neon hover:underline transition-colors"
                    >
                      {isEn ? 'See more...' : 'Ver más...'}
                    </button>
                  )}
                </div>

                {solution && (
                  <div className="mt-6 pt-4 border-t border-border/60 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-accent font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{isEn ? 'The Invest Oil solution:' : 'Solución Invest Oil:'}</span>
                    </span>
                    <p className="text-[11px] text-text-subtle font-sans leading-relaxed line-clamp-3">
                      {tiptapToPlainText(solutionRich)}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Pop de detalle completo */}
      {openItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setOpenItem(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-surf shadow-2xl p-6 sm:p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                  {isEn ? 'CHALLENGE' : 'DESAFÍO'} #{openItem.num}
                </span>
                <h3 className="font-heading font-bold text-xl sm:text-2xl text-text">
                  {localized(openItem, 'title', isEn, PROBLEMS_EN, openItem.id)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenItem(null)}
                className="p-1.5 rounded-lg bg-card text-text-muted hover:text-text hover:bg-card/80 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-sm">
              <TiptapContent
                content={localizedRich(openItem, 'desc', isEn, PROBLEMS_EN, openItem.id)}
                legacyClassName="text-text-muted leading-relaxed"
              />
            </div>

            {(openItem.solution || openItem.solution_en) && (
              <div className="pt-4 border-t border-border/60 space-y-2">
                <span className="text-xs font-mono uppercase text-accent font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{isEn ? 'The Invest Oil solution' : 'Solución Invest Oil'}</span>
                </span>
                <div className="text-sm">
                  <TiptapContent
                    content={localizedRich(openItem, 'solution', isEn, PROBLEMS_EN, openItem.id)}
                    legacyClassName="text-text-muted leading-relaxed"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <a
                href="#contact"
                onClick={() => setOpenItem(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-neon transition-colors"
              >
                <span>{isEn ? 'Talk to our team' : 'Hablar con nuestro equipo'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
