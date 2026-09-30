'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FixResult {
  success: boolean;
  scanned?: number;
  updated?: number;
  updatedSectionIds?: string[];
  error?: string;
}

export default function DomainFixUtilityPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/fix-domain', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setResult({ success: res.ok && data.success, ...data });
    } catch (err: any) {
      setResult({ success: false, error: err?.message || 'Error de red al contactar el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20">
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-xs text-text-subtle hover:text-accent font-mono transition-colors mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a Contenido</span>
        </Link>
        <Badge variant="accent">UTILIDAD PUNTUAL DE ADMINISTRADOR</Badge>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text">
          Corregir Dominio en Contenido Guardado
        </h1>
        <p className="mt-1 text-xs text-text-muted leading-relaxed">
          Cambiar el dominio en el código no toca lo que ya guardaste desde los formularios del
          backoffice (Cabecera, SEO, Pie de Página, prompt de Oli, Retos, Servicios...). Este botón
          recorre todo ese contenido ya guardado en la base de datos y reemplaza{' '}
          <code className="text-accent font-mono">investoil.es</code> por{' '}
          <code className="text-accent font-mono">investoil.us</code> donde aparezca, sin tocar el
          resto del texto. Es seguro ejecutarlo más de una vez: si no encuentra nada que corregir, no
          cambia nada.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surf/50 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/20 text-accent shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">investoil.es → investoil.us</p>
            <p className="text-xs text-text-muted">
              Se corrige en todas las secciones guardadas (Hero, Cabecera, SEO, Pie de Página,
              Agente de IA, y el resto de secciones de la landing).
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="accent"
          size="lg"
          onClick={handleRun}
          disabled={loading}
          className="w-full justify-center gap-2 shadow-glow-accent text-xs font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Corrigiendo...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Corregir dominio ahora</span>
            </>
          )}
        </Button>

        {result && (
          <div
            className={`p-4 rounded-lg border text-xs space-y-2 animate-fade-in ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            <div className="flex items-center gap-2 font-semibold">
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>
                {result.success
                  ? `Listo: ${result.updated ?? 0} de ${result.scanned ?? 0} secciones corregidas.`
                  : result.error || 'No se pudo completar la corrección.'}
              </span>
            </div>
            {result.success && result.updatedSectionIds && result.updatedSectionIds.length > 0 && (
              <p className="text-text-muted font-mono">
                Secciones corregidas: {result.updatedSectionIds.join(', ')}
              </p>
            )}
            {result.success && (result.updated ?? 0) === 0 && (
              <p className="text-text-muted">
                No se encontró ningún «investoil.es» en el contenido guardado — ya estaba corregido.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
