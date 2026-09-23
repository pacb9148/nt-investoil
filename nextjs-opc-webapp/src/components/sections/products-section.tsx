'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Globe, Clock, ArrowRight, Package } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PRODUCTS_LIST } from '@/lib/constants/investoil';
import { useLanguage } from '@/lib/i18n/language-context';
import type { ProductItem } from '@/types';

export function ProductsSection({ customBg }: { customBg?: string }) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<ProductItem[]>(PRODUCTS_LIST);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_products');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch {}

    fetch('/api/content/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          try {
            localStorage.setItem('investoil_products', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ProductItem[]>;
      if (Array.isArray(customEvent.detail)) {
        setProducts(customEvent.detail);
      }
    };

    window.addEventListener('investoil_products_updated', handleUpdate);
    return () => window.removeEventListener('investoil_products_updated', handleUpdate);
  }, []);

  return (
    <section
      id="products"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="warm">{t.products.tag}</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            {t.products.title}
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            {t.products.subtitle}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.sku}
              className="flex flex-col justify-between group transition-all duration-300 hover:border-warm/50 hover:shadow-glow-warm/20 overflow-hidden"
            >
              {product.imageUrl && (
                <div className="relative w-full h-44 bg-black/40 overflow-hidden border-b border-border/60">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              )}

              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-warm bg-warm/10 px-2 py-0.5 rounded border border-warm/30">
                    {product.sku}
                  </span>
                  <span className="text-[11px] font-medium text-text-subtle">
                    {product.category || 'Hidrocarburos'}
                  </span>
                </div>
                <CardTitle className="text-lg group-hover:text-warm transition-colors">
                  {product.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 flex-1">
                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                  {product.description}
                </p>

                {/* Specs Box */}
                <div className="p-2.5 rounded-lg bg-surf border border-border text-xs font-mono text-accent space-y-1">
                  <div className="text-[10px] text-text-subtle uppercase tracking-wider font-sans font-semibold">
                    {t.products.specsTitle}
                  </div>
                  <div>{product.specs}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-text-subtle pt-2 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{product.market}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-warm shrink-0" />
                    <span className="truncate">{product.availability}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Link
                  href="#contact"
                  className="w-full flex items-center justify-between text-xs font-semibold text-text-muted group-hover:text-warm transition-colors py-2 px-3 rounded-lg hover:bg-surf/70"
                >
                  <span>{t.products.quoteTitle || 'Solicitar Cotización'}</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
