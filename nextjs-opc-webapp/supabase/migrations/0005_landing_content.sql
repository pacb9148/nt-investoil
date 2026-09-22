-- ==============================================================================
-- Migración 0005: Tablas para Gestión de Contenidos y Personalización de Landing
-- Invest Oil LLC — Sistema OPC
-- ==============================================================================

-- 1. Secciones de la landing y visibilidad
CREATE TABLE IF NOT EXISTS public.landing_sections (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Hero Section
CREATE TABLE IF NOT EXISTS public.landing_hero (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow_text TEXT NOT NULL,
  eyebrow_text_en TEXT,
  heading_line_1 TEXT NOT NULL,
  heading_line_1_en TEXT,
  heading_line_2 TEXT NOT NULL,
  heading_line_2_en TEXT,
  heading_accent TEXT NOT NULL,
  heading_accent_en TEXT,
  subtitle TEXT NOT NULL,
  subtitle_en TEXT,
  cta_primary_text TEXT NOT NULL,
  cta_primary_text_en TEXT,
  cta_primary_url TEXT NOT NULL DEFAULT '#services',
  cta_secondary_text TEXT NOT NULL,
  cta_secondary_text_en TEXT,
  cta_secondary_url TEXT NOT NULL DEFAULT '#products',
  hero_bg_type TEXT NOT NULL DEFAULT 'gradient', -- none, image, video, gradient
  hero_bg_url TEXT DEFAULT '',
  hero_bg_fit TEXT DEFAULT 'cover',
  hero_bg_position TEXT DEFAULT 'center center',
  hero_bg_opacity INT DEFAULT 20,
  hero_bg_blur INT DEFAULT 0,
  hero_visual_tipo TEXT DEFAULT 'mockup',
  hero_visual_url TEXT DEFAULT '',
  market_ticker TEXT DEFAULT 'BRENT: $82.40/bbl (+1.2%) | WTI: $78.15/bbl (+0.9%)',
  seats_total INT DEFAULT 100,
  seats_taken INT DEFAULT 28,
  countdown_deadline TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Apariencia y Estilos
CREATE TABLE IF NOT EXISTS public.landing_site_appearance (
  id INT PRIMARY KEY DEFAULT 1,
  font_heading TEXT NOT NULL DEFAULT 'Outfit',
  font_body TEXT NOT NULL DEFAULT 'Inter',
  primary_color TEXT NOT NULL DEFAULT '#F59E0B',
  accent_glow BOOLEAN NOT NULL DEFAULT true,
  background_pattern TEXT NOT NULL DEFAULT 'grid',
  custom_css TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Textos sueltos por sección
CREATE TABLE IF NOT EXISTS public.landing_texts (
  id TEXT PRIMARY KEY,
  text_es TEXT NOT NULL,
  text_en TEXT,
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  is_long BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. FAQ
CREATE TABLE IF NOT EXISTS public.landing_faq (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  question_en TEXT,
  answer TEXT NOT NULL,
  answer_en TEXT,
  category TEXT DEFAULT 'General',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Políticas RLS: Lectura pública, modificación exclusiva para superadmins / service_role
ALTER TABLE public.landing_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_site_appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de secciones" ON public.landing_sections FOR SELECT USING (true);
CREATE POLICY "Lectura pública de hero" ON public.landing_hero FOR SELECT USING (true);
CREATE POLICY "Lectura pública de apariencia" ON public.landing_site_appearance FOR SELECT USING (true);
CREATE POLICY "Lectura pública de textos" ON public.landing_texts FOR SELECT USING (true);
CREATE POLICY "Lectura pública de faq" ON public.landing_faq FOR SELECT USING (true);

-- Semillas iniciales (Seed)
INSERT INTO public.landing_sections (id, title, description, icon, is_active, sort_order)
VALUES
  ('hero', 'Hero Principal', 'Titular, subtítulo, CTAs, video/imagen de fondo e indicador de mercado', '🎯', true, 1),
  ('marquee', 'Marquee & Commodities', 'Cintillo animado de cotizaciones Brent/WTI y certificaciones', '🏷️', true, 2),
  ('estadisticas', 'Estadísticas de Impacto', '4 métricas clave (barriles, países, cumplimiento y monitoreo)', '📊', true, 3),
  ('problema', 'Retos del Sector Petrolero', 'Tarjetas de desafíos de intermediación, volatilidad y logística', '🔥', true, 4),
  ('services', 'Servicios Petroleros', 'Catálogo de servicios integrales de comercialización y trading', '⚡', true, 5),
  ('products', 'Portafolio de Hidrocarburos', 'Crudos, Jet Fuel A1, EN590, D2, GNL con especificaciones', '💰', true, 6),
  ('plataforma', 'Operaciones & Infraestructura', 'Terminales marítimas, logística y capacidad de almacenamiento', '🏢', true, 7),
  ('team', 'Consejo Directivo', 'Perfiles ejecutivos y gobernanza corporativa', '👥', true, 8),
  ('testimonials', 'Testimonios & Clientes', 'Prueba social y recomendaciones de refinerías y socios', '⭐', true, 9),
  ('faq', 'Preguntas Frecuentes', 'Respuestas sobre procedimientos de compra, Incoterms y garantías', '❓', true, 10),
  ('cta_final', 'CTA Final de Cierre', 'Bloque de cierre corporativo y botón principal de contacto', '🚀', true, 11),
  ('contact', 'Formulario de Contacto', 'Captación de leads y solicitudes comerciales directas', '✉️', true, 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.landing_hero (
  id, eyebrow_text, eyebrow_text_en, heading_line_1, heading_line_1_en,
  heading_line_2, heading_line_2_en, heading_accent, heading_accent_en,
  subtitle, subtitle_en, cta_primary_text, cta_primary_text_en, cta_primary_url,
  cta_secondary_text, cta_secondary_text_en, cta_secondary_url, hero_bg_type, hero_bg_opacity
) VALUES (
  1,
  'INFRAESTRUCTURA Y TRADING ENERGÉTICO GLOBAL',
  'GLOBAL ENERGY TRADING & INFRASTRUCTURE',
  'Soluciones Estratégicas en',
  'Strategic Solutions in',
  'del Petróleo y Derivados',
  'Oil & Refined Products',
  'el Mercado Global',
  'the Global Market',
  'Conectamos productores, refinerías y distribuidores en los principales centros energéticos mundiales con máxima solidez operativa, gestión de riesgo y cumplimiento normativo internacional.',
  'Connecting producers, refineries, and distributors across world energy hubs with premier operational strength, risk mitigation, and strict international compliance.',
  'Explorar Servicios Petroleros',
  'Explore Petroleum Services',
  '#services',
  'Ver Catálogo de Productos',
  'View Products Catalog',
  '#products',
  'gradient',
  25
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.landing_site_appearance (
  id, font_heading, font_body, primary_color, accent_glow, background_pattern
) VALUES (
  1, 'Outfit', 'Inter', '#F59E0B', true, 'grid'
) ON CONFLICT (id) DO NOTHING;
