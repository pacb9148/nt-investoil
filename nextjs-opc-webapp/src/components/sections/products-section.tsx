'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PRODUCTS_LIST } from '@/lib/constants/investoil';
import { useLanguage } from '@/lib/i18n/language-context';

export function ProductsSection() {
  const { t } = useLanguage();

  return (
    <section id="products" className="py-24 border-t border-border bg-surf/40 relative">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS_LIST.map((product) => (
            <Card
              key={product.sku}
              className="flex flex-col justify-between group transition-all duration-300 hover:border-warm/50 hover:shadow-glow-warm/20"
            >
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-warm bg-warm/10 px-2 py-0.5 rounded border border-warm/30">
                    {product.sku}
                  </span>
                  <span className="text-[11px] font-medium text-text-subtle">
                    {product.category}
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

                {/* Meta details */}
                <div className="space-y-1 text-xs text-text-muted pt-2 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                    <span>{product.market}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-subtle shrink-0" />
                    <span>{product.availability}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/40">
                <Link href="#contact" className="w-full">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-warm hover:text-warm-light hover:bg-warm/10">
                    <span>{t.products.quoteTitle}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
