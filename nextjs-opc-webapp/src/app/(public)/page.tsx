import React from 'react';
import {
  getLandingSections,
  getLandingHero,
  getLandingAppearance,
  getSectionContent,
} from '@/lib/services/content-service';
import { HeroSection } from '@/components/sections/hero-section';
import { ServicesSection } from '@/components/sections/services-section';
import { ProductsSection } from '@/components/sections/products-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { TeamSection } from '@/components/sections/team-section';
import { TestimonialsSection } from '@/components/sections/testimonials-section';
import { ProblemSection } from '@/components/sections/problem-section';
import { FaqSection } from '@/components/sections/faq-section';
import { ContactSection } from '@/components/sections/contact-section';
import { MarqueeTicker, MarqueeConfig } from '@/components/layout/marquee-ticker';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Contenido dinámico con soporte de revalidación inmediata

export default async function HomePage() {
  const [sections, heroConfig, appearance, marqueeConfig] = await Promise.all([
    getLandingSections(),
    getLandingHero(),
    getLandingAppearance(),
    getSectionContent<MarqueeConfig>('marquee', {
      enabled: true,
      showLivePrices: true,
      speedSeconds: 120,
      pauseOnHover: true,
      pricesBadgeText: 'Precios de Energía en Vivo',
      pricesBadgeTextEn: 'Live Energy Prices',
      newsBadgeText: 'Actualidad & Operaciones',
      newsBadgeTextEn: 'Market News & Ops',
    }),
  ]);

  const secBg = appearance.section_bg_colors || {};

  // Mapa de visibilidad rápida
  const isVisible = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? sec.is_active : true;
  };

  return (
    <>
      {/* 1. Hero Principal */}
      {isVisible('hero') && (
        <HeroSection config={heroConfig} customBg={secBg.hero} />
      )}

      {/* 2. Marquee de Commodities & Precios en Vivo (Dual Bidireccional) */}
      {isVisible('marquee') && (
        <MarqueeTicker config={marqueeConfig} customBg={secBg.marquee} />
      )}

      {/* 3. Retos del Sector (El Problema) */}
      {isVisible('problema') && <ProblemSection customBg={secBg.problema} />}

      {/* 4. Servicios Petroleros */}
      {isVisible('services') && <ServicesSection customBg={secBg.services} />}

      {/* 5. Portafolio de Hidrocarburos */}
      {isVisible('products') && <ProductsSection customBg={secBg.products} />}

      {/* 6. Operaciones & Infraestructura */}
      {isVisible('plataforma') && <ProjectsSection customBg={secBg.plataforma} />}

      {/* 7. Consejo Directivo */}
      {isVisible('team') && <TeamSection customBg={secBg.team} />}

      {/* 8. Testimonios */}
      {isVisible('testimonials') && <TestimonialsSection customBg={secBg.testimonials} />}

      {/* 9. Preguntas Frecuentes (FAQ) */}
      {isVisible('faq') && <FaqSection customBg={secBg.faq} />}

      {/* 10. Contacto Directo */}
      {isVisible('contact') && <ContactSection customBg={secBg.contact} />}
    </>
  );
}
