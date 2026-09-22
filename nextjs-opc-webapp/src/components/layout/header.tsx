'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button } from '@/components/ui/button';
import { NAV_LINKS } from '@/lib/constants/investoil';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3.5 px-4 md:px-8',
          isScrolled
            ? 'bg-bg/90 backdrop-blur-md border-b border-border shadow-lg shadow-black/20 py-2.5'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <BrandLogo variant="logo" size={44} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Navegación principal">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : link.href.startsWith('/#')
                  ? false
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-sm font-medium transition-colors py-1 hover:text-text group',
                    isActive ? 'text-neon font-semibold' : 'text-text-muted'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute left-0 right-0 -bottom-1 h-[2px] bg-neon rounded-full transition-transform duration-200',
                      isActive ? 'scale-x-100 shadow-[0_0_10px_#eaff3f]' : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 border border-border/50">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>Portal</span>
              </Button>
            </Link>
            <Link href="/#contact">
              <Button variant="accent" size="sm" className="gap-1.5 shadow-glow-accent">
                <span>Contáctanos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surf focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-30 md:hidden bg-bg/95 backdrop-blur-xl pt-24 px-6 pb-8 flex flex-col justify-between animate-fade-in">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-heading font-semibold text-text hover:text-accent py-2 border-b border-border/40 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-border">
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Acceso Backoffice</span>
              </Button>
            </Link>
            <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="accent" className="w-full justify-center gap-2">
                <span>Contactar ahora</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
