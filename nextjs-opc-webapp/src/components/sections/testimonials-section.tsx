'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote, User, Video } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CLIENT_TESTIMONIALS } from '@/lib/constants/investoil';
import type { ClientTestimonial } from '@/types';

export function TestimonialsSection({ customBg }: { customBg?: string }) {
  const [items, setItems] = useState<ClientTestimonial[]>(CLIENT_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    try {
      const local = localStorage.getItem('investoil_testimonials');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      }
    } catch {}

    fetch('/api/content/testimonials')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
          try {
            localStorage.setItem('investoil_testimonials', JSON.stringify(data));
          } catch {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ClientTestimonial[]>;
      if (Array.isArray(customEvent.detail)) {
        setItems(customEvent.detail);
      }
    };

    window.addEventListener('investoil_testimonials_updated', handleUpdate);
    return () => window.removeEventListener('investoil_testimonials_updated', handleUpdate);
  }, []);

  const safeIndex = Math.min(currentIndex, Math.max(0, items.length - 1));
  const current = items[safeIndex] || items[0] || CLIENT_TESTIMONIALS[0];

  const prev = () => {
    setShowVideo(false);
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? items.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setShowVideo(false);
    setCurrentIndex((prevIdx) => (prevIdx === items.length - 1 ? 0 : prevIdx + 1));
  };

  return (
    <section
      id="testimonials"
      className="py-24 border-t border-border/80 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
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
              {/* Star Rating & Video Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-warm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < current.rating ? 'fill-warm' : 'text-border'}`}
                    />
                  ))}
                </div>

                {current.videoUrl && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(!showVideo)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold hover:bg-accent/25 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>{showVideo ? 'Ocultar Video' : 'Ver Video Testimonial'}</span>
                  </button>
                )}
              </div>

              {/* Video Player si está activo */}
              {showVideo && current.videoUrl ? (
                <div className="rounded-xl overflow-hidden border border-border bg-black max-h-72 flex items-center justify-center">
                  <video
                    src={current.videoUrl}
                    controls
                    autoPlay
                    className="w-full max-h-72 object-contain"
                  />
                </div>
              ) : (
                /* Quote text */
                <p className="font-heading text-lg sm:text-2xl text-text leading-relaxed font-medium">
                  "{current.text}"
                </p>
              )}

              {/* Author footer */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border bg-surf flex items-center justify-center shrink-0">
                    {current.avatar ? (
                      <Image
                        src={current.avatar}
                        alt={current.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="w-6 h-6 text-text-subtle" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-accent">
                      {current.name}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {current.role}
                    </p>
                  </div>
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
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setShowVideo(false);
                  setCurrentIndex(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  safeIndex === idx ? 'w-8 bg-accent' : 'w-2 bg-border hover:bg-text-subtle'
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
