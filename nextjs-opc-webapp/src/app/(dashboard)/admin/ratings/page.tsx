'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquareHeart, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import { type CompanyRating } from '@/types';
import { cn } from '@/lib/utils';

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('w-3.5 h-3.5', n <= value ? 'text-accent fill-accent' : 'text-text-subtle')}
        />
      ))}
    </div>
  );
}

export default function AdminRatingsPage() {
  const [ratings, setRatings] = useState<CompanyRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ratings')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRatings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const count = ratings.length;
  const avg = (key: keyof CompanyRating) =>
    count === 0 ? 0 : ratings.reduce((sum, r) => sum + (Number(r[key]) || 0), 0) / count;

  const avgWhatWeDo = avg('what_we_do');
  const avgHowWeDoIt = avg('how_we_do_it');
  const avgResults = avg('results');
  const avgOverall = count === 0 ? 0 : (avgWhatWeDo + avgHowWeDoIt + avgResults) / 3;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-6 border-b border-border">
        <Badge variant="accent">SATISFACCIÓN DE CLIENTES</Badge>
        <h1 className="font-heading font-extrabold text-2xl text-text mt-1">
          Valoraciones de la Empresa
        </h1>
        <p className="text-xs text-text-muted">
          Estrellas dejadas por los visitantes tras enviar el formulario de contacto.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Promedio General', value: avgOverall },
          { label: 'Lo que Hacemos', value: avgWhatWeDo },
          { label: 'Cómo lo Hacemos', value: avgHowWeDoIt },
          { label: 'Nuestros Resultados', value: avgResults },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 bg-card space-y-1.5">
            <div className="text-[11px] uppercase tracking-wider font-mono text-text-subtle">
              {stat.label}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-extrabold text-text">
                {stat.value ? stat.value.toFixed(1) : '—'}
              </span>
              {stat.value > 0 && <Stars value={Math.round(stat.value)} />}
            </div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-text-muted">Cargando valoraciones...</div>
        ) : ratings.length === 0 ? (
          <div className="p-12 text-center space-y-2 border border-border rounded-xl bg-card">
            <MessageSquareHeart className="w-10 h-10 text-border mx-auto" />
            <p className="text-sm font-semibold text-text">Aún no hay valoraciones</p>
            <p className="text-xs text-text-muted">
              Aparecerán aquí cuando los visitantes califiquen la empresa tras enviar el formulario de contacto.
            </p>
          </div>
        ) : (
          ratings.map((r) => (
            <Card key={r.id} className="p-4 bg-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {r.name ? (
                    <span className="font-heading font-semibold text-sm text-text truncate block">
                      {r.name}
                    </span>
                  ) : (
                    <span className="text-xs text-text-subtle font-mono">Visitante anónimo</span>
                  )}
                  {r.email && (
                    <a
                      href={`mailto:${r.email}`}
                      className="text-[11px] text-accent hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{r.email}</span>
                    </a>
                  )}
                </div>
                <span className="text-[11px] font-mono text-text-subtle shrink-0">
                  {formatDateTime(r.created_at)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surf border border-border/60">
                  <span className="text-[11px] text-text-muted">Lo que hacemos</span>
                  <Stars value={r.what_we_do} />
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surf border border-border/60">
                  <span className="text-[11px] text-text-muted">Cómo lo hacemos</span>
                  <Stars value={r.how_we_do_it} />
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surf border border-border/60">
                  <span className="text-[11px] text-text-muted">Resultados</span>
                  <Stars value={r.results} />
                </div>
              </div>

              {r.comment && (
                <div className="p-3 rounded-lg bg-surf/60 border border-border/50 text-xs text-text leading-relaxed">
                  {r.comment}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
