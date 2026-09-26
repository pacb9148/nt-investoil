'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  variant?: 'logo' | 'seal';
  showText?: boolean;
  className?: string;
  size?: number;
  src?: string;
  customTitle?: string;
  customSubtitle?: string;
}

export function BrandLogo({
  variant = 'logo',
  showText = true,
  className,
  size = 40,
  src,
  customTitle,
  customSubtitle,
}: BrandLogoProps) {
  const DEFAULT_LOGO = '/images/branding/oil-drop-logo.png';
  // Si el archivo configurado ya no existe (borrado de la biblioteca), se muestra el logo oficial en vez de un hueco.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasNoImage = src === '' || src === 'none';
  const wanted = src || DEFAULT_LOGO;
  const imageSrc = hasNoImage ? null : failedSrc === wanted ? DEFAULT_LOGO : wanted;
  const imgRef = useRef<HTMLImageElement>(null);

  // Si la imagen falló antes de hidratar, onError ya no se dispara: se comprueba al montar.
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setFailedSrc(wanted);
  }, [wanted]);

  return (
    <Link
      href="/"
      className={cn('inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg', className)}
      aria-label="Invest Oil LLC - Inicio"
    >
      {imageSrc && (
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
          <Image
            ref={imgRef}
            src={imageSrc}
            alt={customTitle || 'Invest Oil LLC'}
            width={size}
            height={size}
            unoptimized={Boolean(imageSrc && imageSrc.startsWith('/uploads'))}
            className="object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
            priority
            onError={() => setFailedSrc(wanted)}
          />
        </div>
      )}

      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-base md:text-lg tracking-tight text-text group-hover:text-accent transition-colors">
            {customTitle || 'INVEST OIL'}
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted -mt-1">
            {customSubtitle || 'Petroleum and Derivates Markets'}
          </span>
        </div>
      )}
    </Link>
  );
}
