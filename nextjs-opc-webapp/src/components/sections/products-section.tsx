'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Globe, Clock, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PRODUCTS_LIST } from '@/lib/constants/investoil';

export function ProductsSection() {
  return (
    <section id="products" className="py-24 border-t border-border bg-surf/40 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="warm">PORTAFOLIO DE SUMINISTRO</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Nuestro Producto
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Crudos de referencia, destilados y derivados industriales con especificaciones garantizadas para refinerías y distribuidores en mercados globales.
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
                    Especificación
                  </div>
                  <div>{product.specs}</div>
                </div>

                {/* Meta details */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-text-subtle" />
                      <span>Mercado:</span>
                    </span>
                    <span className="font-medium text-text">{product.market}</span>
                  </div>

                  <div className="flex items-center justify-between text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-text-subtle" />
                      <span>Disponibilidad:</span>
                    </span>
                    <span className="font-medium text-text">{product.availability}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border/50">
                <Link href={`/#contact?product=${encodeURIComponent(product.sku)}`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs justify-between group-hover:border-warm/60">
                    <span>Cotizar cargamento</span>
                    <ArrowRight className="w-3 h-3 text-warm" />
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
