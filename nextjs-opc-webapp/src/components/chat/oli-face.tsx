'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface OliFaceProps {
  size?: 'sm' | 'md' | 'lg';
  isTyping?: boolean;
  isOpen?: boolean;
  isHovered?: boolean;
  isHappy?: boolean;
  className?: string;
}

export function OliFace({
  size = 'lg',
  isTyping = false,
  isOpen = false,
  isHovered = false,
  isHappy,
  className,
}: OliFaceProps) {
  // Estado de ciclo de mirada para simular conciencia y espera viva
  const [lookDirection, setLookDirection] = useState<'center' | 'left' | 'right' | 'up' | 'down'>('center');
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (isTyping) {
      setLookDirection('up');
      return;
    }
    if (isOpen || isHovered) {
      setLookDirection('center');
      return;
    }

    // Ciclo orgánico de mirada en reposo (esperando interacción)
    const directions: ('center' | 'left' | 'center' | 'right' | 'center' | 'up' | 'center' | 'down')[] = [
      'center',
      'left',
      'center',
      'right',
      'center',
      'up',
      'center',
      'down',
    ];
    let idx = 0;

    const interval = setInterval(() => {
      idx = (idx + 1) % directions.length;
      setLookDirection(directions[idx]);
    }, 1800);

    // Ciclo aleatorio de parpadeo
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearInterval(blinkInterval);
    };
  }, [isTyping, isOpen, isHovered]);

  // Dimensiones según tamaño
  const dimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-14 h-14',
  }[size];

  // Desplazamiento de los ojos según dirección de mirada
  const eyeOffset = {
    center: 'translate-x-0 translate-y-0',
    left: '-translate-x-1 translate-y-0',
    right: 'translate-x-1 translate-y-0',
    up: 'translate-x-0 -translate-y-1',
    down: 'translate-x-0 translate-y-0.5',
  }[lookDirection];

  // Expresión feliz cuando está en hover o el chat está abierto o forzada por prop
  const happy = isHappy !== undefined ? isHappy : (isHovered || isOpen);

  return (
    <div
      className={cn(
        'relative rounded-full select-none flex items-center justify-center transition-all duration-300',
        'bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30',
        dimensions,
        className
      )}
    >
      {/* Brillo especular superior simulando volumen esférico 3D (estilo emoji / cristal líquido) */}
      <div className="absolute top-1 left-1.5 w-1/2 h-1/3 rounded-full bg-white/45 blur-[0.8px] rotate-[-20deg] pointer-events-none" />
      <div className="absolute bottom-0.5 right-1.5 w-1/3 h-1/4 rounded-full bg-amber-900/30 blur-[1px] pointer-events-none" />

      {/* Sutil halo interno */}
      <div className="absolute inset-0 rounded-full border border-amber-200/50 pointer-events-none" />

      {/* Rostro y Ojos de Oli (SVG) */}
      <div
        className={cn(
          'relative z-10 w-full h-full flex flex-col items-center justify-center transition-transform duration-300',
          eyeOffset
        )}
      >
        {/* Contenedor de Ojos */}
        <div className="flex items-center justify-center gap-2.5 mb-0.5">
          {/* Ojo Izquierdo */}
          <div
            className={cn(
              'relative rounded-full bg-zinc-950 transition-all duration-200 flex items-center justify-center',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-3',
              isBlinking && 'scale-y-[0.1]',
              isHappy && 'rounded-t-full rounded-b-none h-2 w-2.5 border-t-2 border-zinc-950 bg-transparent'
            )}
          >
            {/* Destello blanco en la pupila */}
            {!happy && !isBlinking && (
              <span className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white opacity-95" />
            )}
          </div>

          {/* Ojo Derecho */}
          <div
            className={cn(
              'relative rounded-full bg-zinc-950 transition-all duration-200 flex items-center justify-center',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2 h-2',
              size === 'lg' && 'w-2.5 h-3',
              isBlinking && 'scale-y-[0.1]',
              happy && 'rounded-t-full rounded-b-none h-2 w-2.5 border-t-2 border-zinc-950 bg-transparent'
            )}
          >
            {/* Destello blanco en la pupila */}
            {!happy && !isBlinking && (
              <span className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white opacity-95" />
            )}
          </div>
        </div>

        {/* Sonrisa Amigable */}
        <div className="flex items-center justify-center">
          {happy ? (
            // Sonrisa alegre abierta
            <svg
              className={cn(
                'overflow-visible transition-all duration-200',
                size === 'sm' && 'w-3 h-1.5',
                size === 'md' && 'w-4 h-2',
                size === 'lg' && 'w-5 h-2.5'
              )}
              viewBox="0 0 20 10"
              fill="none"
            >
              <path
                d="M 2 2 Q 10 11 18 2"
                stroke="#18181b"
                strokeWidth={size === 'lg' ? '2.5' : '2'}
                strokeLinecap="round"
                fill="#18181b"
              />
            </svg>
          ) : isTyping ? (
            // Expresión curiosa / concentrada pensando
            <svg
              className={cn(
                'overflow-visible animate-pulse',
                size === 'sm' && 'w-2.5 h-1',
                size === 'md' && 'w-3.5 h-1.5',
                size === 'lg' && 'w-4 h-2'
              )}
              viewBox="0 0 20 8"
              fill="none"
            >
              <path
                d="M 3 4 Q 10 7 17 4"
                stroke="#18181b"
                strokeWidth={size === 'lg' ? '2.2' : '1.8'}
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // Sonrisa amigable en reposo
            <svg
              className={cn(
                'overflow-visible transition-all duration-200',
                size === 'sm' && 'w-2.5 h-1.5',
                size === 'md' && 'w-3.5 h-2',
                size === 'lg' && 'w-4.5 h-2.5'
              )}
              viewBox="0 0 20 10"
              fill="none"
            >
              <path
                d="M 3 3 Q 10 9 17 3"
                stroke="#18181b"
                strokeWidth={size === 'lg' ? '2.2' : '1.8'}
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        {/* Rubor sutil en mejillas (visible en expresiones felices) */}
        {happy && (
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none opacity-40">
            <div className="w-1.5 h-1 rounded-full bg-rose-500 blur-[0.5px]" />
            <div className="w-1.5 h-1 rounded-full bg-rose-500 blur-[0.5px]" />
          </div>
        )}
      </div>
    </div>
  );
}
