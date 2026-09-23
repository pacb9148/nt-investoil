import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/layout/brand-logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-bg relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute w-80 h-80 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-md space-y-6">
        <BrandLogo variant="logo" size={56} className="justify-center" />

        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-warm bg-warm/10 border border-warm/30 px-3 py-1 rounded-full">
            ERROR 404
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Página No Encontrada
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            La ruta o recurso al que intentas acceder no existe o ha sido reubicada dentro del sistema.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-4">
          <Button href="/" variant="accent" className="gap-2">
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
