'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CLIENT_TESTIMONIALS } from '@/lib/constants/investoil';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? CLIENT_TESTIMONIALS.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === CLIENT_TESTIMONIALS.length - 1 ? 0 : prevIdx + 1));
  };

  const current = CLIENT_TESTIMONIALS[currentIndex];

  return (
    <section className="py-24 border-t border-border bg-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="warm">CONFIANZA DEL SECTOR</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Testimonios de refinerías, fondos energéticos y distribuidores que confían en nuestra intermediación y gestión de riesgos.
          </p>
        </div>

        {/* Carousel Card */}
        <div className="max-w-4xl mx-auto relative">
          <Card className="p-8 sm:p-12 relative overflow-hidden border-border/80 bg-card/90 backdrop-blur-md">
            <Quote className="absolute top-6 right-6 w-16 h-16 text-border/40 pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Star Rating */}
              <div className="flex items-center gap-1 text-warm">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < current.rating ? 'fill-warm' : 'text-border'}`}
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="font-heading text-lg sm:text-2xl text-text leading-relaxed font-medium">
                "{current.text}"
              </p>

              {/* Author footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-base text-accent">
                    {current.name}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {current.role}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prev}
                    className="p-2.5 rounded-lg border border-border bg-surf text-text-muted hover:text-text hover:border-accent transition-colors"
                    aria-label="Testimonio anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    className="p-2.5 rounded-lg border border-border bg-surf text-text-muted hover:text-text hover:border-accent transition-colors"
                    aria-label="Testimonio siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {CLIENT_TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-8 bg-accent' : 'w-2 bg-border hover:bg-text-subtle'
                }`}
                aria-label={`Ir al testimonio ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
