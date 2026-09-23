'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { Button, buttonVariants } from '@/components/ui/button';
import { LanguageSelector } from './language-selector';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: '/', label: t.nav.home },
    { href: '/services', label: t.nav.services },
    { href: '/products', label: t.nav.products },
    { href: '/about', label: t.nav.about },
    { href: '/blog', label: t.nav.blog },
    { href: '/contact', label: t.nav.contact },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-3 px-4 md:px-8',
          isScrolled
            ? 'bg-bg/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/20 py-2.5'
            : 'bg-transparent border-b border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <BrandLogo variant="logo" size={42} />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            {navItems.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-xs font-semibold uppercase tracking-wider transition-colors py-1 hover:text-text group',
                    isActive ? 'text-accent font-bold' : 'text-text-muted'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute left-0 right-0 -bottom-1 h-[2px] bg-accent rounded-full transition-transform duration-200',
                      isActive ? 'scale-x-100 shadow-[0_0_8px_#f59e0b]' : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher ES / EN */}
            <LanguageSelector />

            <Link
              href="/admin"
              className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
                className: 'text-xs gap-1.5 border border-border/60 hover:border-accent/40',
              })}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>{t.nav.admin}</span>
            </Link>

            <Link
              href="/contact"
              className={buttonVariants({
                variant: 'accent',
                size: 'sm',
                className: 'text-xs gap-1.5 shadow-glow-accent',
              })}
            >
              <span>{t.common.contactUs}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
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
            {navItems.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-text hover:text-accent py-2 border-b border-border/40 transition-colors uppercase tracking-wider"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-border">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={buttonVariants({
                variant: 'secondary',
                className: 'w-full justify-center gap-2 text-xs',
              })}
            >
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>{t.nav.admin}</span>
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={buttonVariants({
                variant: 'accent',
                className: 'w-full justify-center gap-2 text-xs',
              })}
            >
              <span>{t.common.contactUs}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
