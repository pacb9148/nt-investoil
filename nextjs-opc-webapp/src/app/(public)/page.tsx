import React from 'react';
import { getLandingSections, getLandingHero } from '@/lib/services/content-service';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { TeamSection } from '@/components/sections/team-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { ProblemSection } from '@/components/sections/problem-section';
import { FaqSection } from '@/components/sections/faq-section';
import { ContactSection } from '@/components/sections/contact-section';
import { MarqueeTicker } from '@/components/layout/marquee-ticker';

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

      {/* 2. Marquee de Commodities & Precios en Vivo */}
      {isVisible('marquee') && <MarqueeTicker />}

      {/* 3. Retos del Sector (El Problema) */}
      {isVisible('problema') && <ProblemSection />}

      {/* 4. Servicios Petroleros */}
      {isVisible('services') && <ServicesSection />}

      {/* 5. Portafolio de Hidrocarburos */}
      {isVisible('products') && <ProductsSection />}

      {/* 6. Operaciones & Infraestructura */}
      {isVisible('plataforma') && <ProjectsSection />}

      {/* 7. Consejo Directivo */}
      {isVisible('team') && <TeamSection />}

      {/* 8. Testimonios */}
      {isVisible('testimonials') && <TestimonialsSection />}

      {/* 9. Preguntas Frecuentes (FAQ) */}
      {isVisible('faq') && <FaqSection />}

      {/* 10. Contacto Directo */}
      {isVisible('contact') && <ContactSection />}
    </>
  );
}
