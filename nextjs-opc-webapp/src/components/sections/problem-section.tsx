'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProblemItem {
  id: string;
  num: string;
  title: string;
  desc: string;
  solution?: string;
}

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

export function ProblemSection({ customBg }: { customBg?: string }) {
  const [problems, setProblems] = useState<ProblemItem[]>(DEFAULT_PROBLEMS);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_problems');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) setProblems(parsed);
      }
    } catch {}

    fetch('/api/content/problem')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProblems(data);
          try {
            localStorage.setItem('investoil_problems', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ProblemItem[]>;
      if (Array.isArray(customEvent.detail)) setProblems(customEvent.detail);
    };

    window.addEventListener('investoil_problems_updated', handleUpdate);
    return () => window.removeEventListener('investoil_problems_updated', handleUpdate);
  }, []);

  return (
    <section
      id="problema"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="danger">DESAFÍOS OPERATIVOS</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Retos del Mercado Energético
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Navegar el comercio petrolero global exige solvencia, rigor normativo y mitigación activa de los cuellos de botella habituales del sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((item) => (
            <Card
              key={item.id}
              className="p-6 relative overflow-hidden group hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                    DESAFÍO #{item.num}
                  </span>
                  <AlertCircle className="w-4 h-4 text-warm" />
                </div>

                <h3 className="font-heading font-bold text-lg text-text group-hover:text-accent transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {item.solution && (
                <div className="mt-6 pt-4 border-t border-border/60 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-accent font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Solución Invest Oil:</span>
                  </span>
                  <p className="text-[11px] text-text-subtle font-sans leading-relaxed">
                    {item.solution}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
