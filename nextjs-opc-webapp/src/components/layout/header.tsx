'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './brand-logo';
import { buttonVariants } from '@/components/ui/button';
import { LanguageSelector } from './language-selector';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import type { HeaderData } from '@/components/admin/content/header-form';
import defaultHeaderData from '@/data/header.json';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [headerConfig, setHeaderConfig] = useState<HeaderData>(defaultHeaderData as HeaderData);
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    fetch('/api/content/header')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.menu_items) {
          setHeaderConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setActiveSection(hash);
    }

    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h) setActiveSection(h);
    };

    window.addEventListener('hashchange', handleHashChange);

    const sections = ['contact', 'faq', 'testimonials', 'team', 'plataforma', 'products', 'services', 'problema', 'hero'];

    const handleScrollSpy = () => {
      if (window.scrollY < 180) {
        setActiveSection('hero');
        return;
      }

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 150) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('scroll', handleScrollSpy);
    };
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const activeMenuItems = (headerConfig.menu_items || []).filter(
    (item) => item.is_active !== false
  );

  const isLinkActive = (href: string) => {
    if (pathname === '/') {
      if (href === '/' || href === '/#hero') {
        return activeSection === 'hero' || activeSection === '';
      }
      if (href.startsWith('/#')) {
        const sectionId = href.replace('/#', '');
        return activeSection === sectionId;
      }
      return false;
    }

    if (href === '/' || href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

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
          <BrandLogo
            variant="logo"
            size={42}
            src={headerConfig.logo_url}
            customTitle={headerConfig.logo_text}
            customSubtitle={headerConfig.logo_tagline}
          />

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navegación principal">
            {activeMenuItems.map((link) => {
              const label = isEn ? (link.label_en || link.label) : link.label;
              const isActive = isLinkActive(link.href);

              return (
                <Link
                  key={link.id || link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href.startsWith('/#')) {
                      setActiveSection(link.href.replace('/#', ''));
                    } else if (link.href === '/') {
                      setActiveSection('hero');
                    }
                  }}
                  className={cn(
                    'relative text-xs font-semibold uppercase tracking-wider transition-colors py-1 hover:text-text group',
                    isActive ? 'text-accent font-bold' : 'text-text-muted'
                  )}
                >
                  {label}
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

            {headerConfig.backoffice_button?.is_visible !== false && (
              <Link
                href="/login"
                className={buttonVariants({
                  variant: 'ghost',
                  size: 'sm',
                  className: 'text-xs gap-1.5 border border-border/60 hover:border-accent/40',
                })}
                title="Acceso seguro con usuario y contraseña"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                <span>
                  {isEn
                    ? (headerConfig.backoffice_button?.text_en || 'Login')
                    : (headerConfig.backoffice_button?.text || 'Acceso Backoffice')}
                </span>
              </Link>
            )}

            {headerConfig.action_button?.is_visible !== false && (
              <Link
                href={headerConfig.action_button?.url || '/contact'}
                className={buttonVariants({
                  variant: 'accent',
                  size: 'sm',
                  className: 'text-xs gap-1.5 shadow-glow-accent',
                })}
              >
                <span>
                  {isEn
                    ? (headerConfig.action_button?.text_en || t.common.contactUs)
                    : (headerConfig.action_button?.text || t.common.contactUs)}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
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
            {activeMenuItems.map((link) => {
              const label = isEn ? (link.label_en || link.label) : link.label;
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.id || link.href}
                  href={link.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (link.href.startsWith('/#')) {
                      setActiveSection(link.href.replace('/#', ''));
                    } else if (link.href === '/') {
                      setActiveSection('hero');
                    }
                  }}
                  className={cn(
                    'text-base font-semibold py-2 border-b border-border/40 transition-colors uppercase tracking-wider',
                    isActive ? 'text-accent font-bold' : 'text-text hover:text-accent'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-border">
            {headerConfig.backoffice_button?.is_visible !== false && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: 'secondary',
                  className: 'w-full justify-center gap-2 text-xs',
                })}
              >
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>
                  {isEn
                    ? (headerConfig.backoffice_button?.text_en || 'Backoffice Login')
                    : (headerConfig.backoffice_button?.text || 'Acceso Backoffice')}
                </span>
              </Link>
            )}
            {headerConfig.action_button?.is_visible !== false && (
              <Link
                href={headerConfig.action_button?.url || '/contact'}
                onClick={() => setMobileMenuOpen(false)}
                className={buttonVariants({
                  variant: 'accent',
                  className: 'w-full justify-center gap-2 text-xs',
                })}
              >
                <span>
                  {isEn
                    ? (headerConfig.action_button?.text_en || t.common.contactUs)
                    : (headerConfig.action_button?.text || t.common.contactUs)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
