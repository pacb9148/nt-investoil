import React from 'react';
import { getLandingSections, getLandingHero } from '@/lib/services/content-service';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { TeamSection } from '@/components/sections/team-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { ContactSection } from '@/components/sections/contact-section';

export const revalidate = 0; // Contenido dinámico con soporte de revalidación inmediata

export default async function HomePage() {
  const [sections, heroConfig] = await Promise.all([
    getLandingSections(),
    getLandingHero(),
  ]);

  // Mapa de visibilidad rápida
  const isVisible = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? sec.is_active : true;
  };

  return (
    <>
      {/* 1. Hero Principal */}
      {isVisible('hero') && <HeroSection config={heroConfig} />}

      {/* 2. Marquee de Commodities */}
      {isVisible('marquee') && (
        <section className="border-y border-border/80 bg-surf/80 py-3 overflow-hidden select-none">
          <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
            {[
              'BRENT CRUDE $82.40/bbl (+1.2%)',
              'WTI CRUDE $78.15/bbl (+0.9%)',
              'JET FUEL A1 ASTM D1655',
              'DIESEL EN590 10PPM',
              'GAS NATURAL LICUADO (GNL)',
              'VERIFICACIÓN SGS & INTERTEK',
              'TERMINALES: HOUSTON · ROTTERDAM · SINGAPUR',
              'BRENT CRUDE $82.40/bbl (+1.2%)',
              'WTI CRUDE $78.15/bbl (+0.9%)',
              'JET FUEL A1 ASTM D1655',
              'DIESEL EN590 10PPM',
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-8">
                <span className="text-xs font-mono text-text-muted hover:text-accent transition-colors font-medium">
                  {item}
                </span>
                <span className="text-accent text-xs">◆</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Servicios Petroleros */}
      {isVisible('services') && <ServicesSection />}

      {/* 4. Portafolio de Hidrocarburos */}
      {isVisible('products') && <ProductsSection />}

      {/* 5. Operaciones & Infraestructura */}
      {isVisible('plataforma') && <ProjectsSection />}

      {/* 6. Consejo Directivo */}
      {isVisible('team') && <TeamSection />}

      {/* 7. Testimonios */}
      {isVisible('testimonials') && <TestimonialsSection />}

      {/* 8. Contacto Directo */}
      {isVisible('contact') && <ContactSection />}
    </>
  );
}
