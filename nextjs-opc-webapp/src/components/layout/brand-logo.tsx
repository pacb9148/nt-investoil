import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  variant?: 'logo' | 'seal';
  showText?: boolean;
  className?: string;
  size?: number;
}

export function BrandLogo({
  variant = 'logo',
  showText = true,
  className,
  size = 40,
}: BrandLogoProps) {
  const imageSrc =
    variant === 'seal'
      ? '/images/branding/seal-transparent.png'
      : '/images/branding/logo.png';

  return (
    <Link
      href="/"
      className={cn('inline-flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg', className)}
      aria-label="Invest Oil LLC - Inicio"
    >
      <div className="relative flex items-center justify-center overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
        <Image
          src={imageSrc}
          alt="Invest Oil LLC"
          width={size}
          height={size}
          className="object-contain filter drop-shadow-[0_2px_8px_rgba(0,201,167,0.3)]"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-base md:text-lg tracking-tight text-text group-hover:text-accent transition-colors">
            INVEST OIL
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-text-muted -mt-1">
            Trading Company
          </span>
        </div>
      )}
    </Link>
  );
}
