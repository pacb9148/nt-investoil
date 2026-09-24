-- ==============================================================================
-- Migración 0006: Esquema Integral de Persistencia en Base de Datos
-- Invest Oil LLC — Sistema OPC
-- Garantiza persistencia total de contenidos, publicaciones, medios, equipo y usuarios
-- ==============================================================================

-- 1. Cabecera y Menú
CREATE TABLE IF NOT EXISTS public.landing_header (
  id INT PRIMARY KEY DEFAULT 1,
  logo_url TEXT NOT NULL DEFAULT '/images/branding/corporate-card-logo.jpeg',
  logo_text TEXT NOT NULL DEFAULT 'INVEST OIL',
  logo_tagline TEXT NOT NULL DEFAULT 'Trading Company',
  menu_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_button JSONB NOT NULL DEFAULT '{"text":"Mesa de Trading","text_en":"Trading Desk","url":"/#contact","is_visible":true}'::jsonb,
  backoffice_button JSONB NOT NULL DEFAULT '{"text":"Backoffice","text_en":"Backoffice","is_visible":true}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Página Nosotros (/about)
CREATE TABLE IF NOT EXISTS public.landing_about (
  id INT PRIMARY KEY DEFAULT 1,
  badge TEXT NOT NULL DEFAULT 'Perfil Corporativo & Liderazgo',
  badge_en TEXT DEFAULT 'Corporate Profile & Leadership',
  title TEXT NOT NULL DEFAULT 'Garantía Energética Global con Excelencia Operativa',
  title_en TEXT DEFAULT 'Global Energy Guarantee with Operational Excellence',
  tagline TEXT NOT NULL DEFAULT 'Empresa privada internacional especializada en la comercialización, trading y logística integral de hidrocarburos de alta demanda.',
  tagline_en TEXT DEFAULT 'International private trading company specialized in global logistics and supply of high-demand petroleum commodities.',
  story_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  story_paragraphs_en JSONB NOT NULL DEFAULT '[]'::jsonb,
  mission_vision JSONB NOT NULL DEFAULT '[]'::jsonb,
  values JSONB NOT NULL DEFAULT '[]'::jsonb,
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Pie de Página & Sedes
CREATE TABLE IF NOT EXISTS public.landing_footer (
  id INT PRIMARY KEY DEFAULT 1,
  brand JSONB NOT NULL DEFAULT '{}'::jsonb,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  headquarters JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  legal_notice TEXT DEFAULT 'Invest Oil LLC es una firma comercial internacional especializada en commodities energéticos.',
  copyright TEXT DEFAULT '© 2026 Invest Oil LLC. Todos los derechos reservados.',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. SEO & Metadatos
CREATE TABLE IF NOT EXISTS public.landing_seo (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT NOT NULL DEFAULT 'Invest Oil LLC',
  title_template TEXT NOT NULL DEFAULT '%s | Invest Oil LLC',
  default_meta_description TEXT NOT NULL DEFAULT 'Compañía internacional de trading de crudo, derivados petrolíferos y Pet Coke con logística global.',
  default_og_image TEXT NOT NULL DEFAULT '/images/branding/corporate-card-logo.jpeg',
  twitter_handle TEXT DEFAULT '@InvestOilGlobal',
  keywords JSONB NOT NULL DEFAULT '["petróleo","trading crudo","pet coke","combustibles marinos","invest oil"]'::jsonb,
  canonical_url TEXT NOT NULL DEFAULT 'https://investoil.es',
  robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://investoil.es/sitemap.xml',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. Consejo Directivo y Equipo
CREATE TABLE IF NOT EXISTS public.landing_team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  role_en TEXT,
  bio TEXT,
  bio_en TEXT,
  photo_url TEXT,
  linkedin_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Testimonios & Clientes
CREATE TABLE IF NOT EXISTS public.landing_testimonials (
  id TEXT PRIMARY KEY,
  author_name TEXT NOT NULL,
  author_company TEXT,
  author_role TEXT,
  avatar_url TEXT,
  text_es TEXT NOT NULL,
  text_en TEXT,
  rating INT DEFAULT 5,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. Servicios Petroleros
CREATE TABLE IF NOT EXISTS public.landing_services (
  id TEXT PRIMARY KEY,
  title_es TEXT NOT NULL,
  title_en TEXT,
  description_es TEXT NOT NULL,
  description_en TEXT,
  icon TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. Portafolio de Hidrocarburos (Productos)
CREATE TABLE IF NOT EXISTS public.landing_products (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT,
  category TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  description_es TEXT,
  description_en TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. Operaciones & Infraestructura
CREATE TABLE IF NOT EXISTS public.landing_operations (
  id INT PRIMARY KEY DEFAULT 1,
  title_es TEXT NOT NULL DEFAULT 'Red Logística y Terminales Estratégicas',
  title_en TEXT DEFAULT 'Global Logistics Network & Strategic Terminals',
  subtitle_es TEXT NOT NULL DEFAULT 'Presencia operativa en los principales hubs portuarios y rutas marítimas mundiales.',
  subtitle_en TEXT DEFAULT 'Operational presence across major global port hubs and maritime trade corridors.',
  facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. Retos del Sector (Problema / Solución)
CREATE TABLE IF NOT EXISTS public.landing_problem (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow TEXT NOT NULL DEFAULT 'Dinámica de Mercados Volátiles',
  title TEXT NOT NULL DEFAULT 'Superando la Incertidumbre en la Cadena de Suministro Energético',
  subtitle TEXT NOT NULL DEFAULT 'Respuestas concretas frente a disrupciones geopolíticas y cuellos de botella logísticos.',
  pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  solution_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 11. Marquesina Doble (Precios de Mercado & Ticker)
CREATE TABLE IF NOT EXISTS public.landing_marquee (
  id INT PRIMARY KEY DEFAULT 1,
  row1_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  row2_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 12. CTA Final de Cierre
CREATE TABLE IF NOT EXISTS public.landing_cta_final (
  id INT PRIMARY KEY DEFAULT 1,
  eyebrow TEXT NOT NULL DEFAULT 'Alianzas Estratégicas',
  title TEXT NOT NULL DEFAULT 'Asegure su Cadena de Suministro Petrolero con Invest Oil',
  description TEXT NOT NULL DEFAULT 'Conéctese con nuestra mesa de operaciones y despacho internacional para cotizaciones spot o contratos de suministro a largo plazo.',
  primary_cta JSONB NOT NULL DEFAULT '{"text":"Contactar Mesa de Trading","url":"#contact"}'::jsonb,
  secondary_cta JSONB NOT NULL DEFAULT '{"text":"Explorar Productos","url":"#products"}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 13. Usuarios y Credenciales del Backoffice
CREATE TABLE IF NOT EXISTS public.backoffice_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator',
  status TEXT NOT NULL DEFAULT 'active',
  department TEXT,
  phone TEXT,
  password_plain TEXT,
  password_aliases TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  last_login TIMESTAMPTZ
);

-- ==============================================================================
-- Políticas RLS (Row Level Security)
-- ==============================================================================
ALTER TABLE public.landing_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_about ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_problem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_marquee ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_cta_final ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backoffice_users ENABLE ROW LEVEL SECURITY;

-- Lectura pública universal para componentes de la web
CREATE POLICY "Lectura pública header" ON public.landing_header FOR SELECT USING (true);
CREATE POLICY "Lectura pública about" ON public.landing_about FOR SELECT USING (true);
CREATE POLICY "Lectura pública footer" ON public.landing_footer FOR SELECT USING (true);
CREATE POLICY "Lectura pública seo" ON public.landing_seo FOR SELECT USING (true);
CREATE POLICY "Lectura pública team" ON public.landing_team FOR SELECT USING (true);
CREATE POLICY "Lectura pública testimonials" ON public.landing_testimonials FOR SELECT USING (true);
CREATE POLICY "Lectura pública services" ON public.landing_services FOR SELECT USING (true);
CREATE POLICY "Lectura pública products" ON public.landing_products FOR SELECT USING (true);
CREATE POLICY "Lectura pública operations" ON public.landing_operations FOR SELECT USING (true);
CREATE POLICY "Lectura pública problem" ON public.landing_problem FOR SELECT USING (true);
CREATE POLICY "Lectura pública marquee" ON public.landing_marquee FOR SELECT USING (true);
CREATE POLICY "Lectura pública cta_final" ON public.landing_cta_final FOR SELECT USING (true);

-- Escritura reservada para service_role / usuarios autenticados
CREATE POLICY "Mutación total header" ON public.landing_header FOR ALL USING (true);
CREATE POLICY "Mutación total about" ON public.landing_about FOR ALL USING (true);
CREATE POLICY "Mutación total footer" ON public.landing_footer FOR ALL USING (true);
CREATE POLICY "Mutación total seo" ON public.landing_seo FOR ALL USING (true);
CREATE POLICY "Mutación total team" ON public.landing_team FOR ALL USING (true);
CREATE POLICY "Mutación total testimonials" ON public.landing_testimonials FOR ALL USING (true);
CREATE POLICY "Mutación total services" ON public.landing_services FOR ALL USING (true);
CREATE POLICY "Mutación total products" ON public.landing_products FOR ALL USING (true);
CREATE POLICY "Mutación total operations" ON public.landing_operations FOR ALL USING (true);
CREATE POLICY "Mutación total problem" ON public.landing_problem FOR ALL USING (true);
CREATE POLICY "Mutación total marquee" ON public.landing_marquee FOR ALL USING (true);
CREATE POLICY "Mutación total cta_final" ON public.landing_cta_final FOR ALL USING (true);
CREATE POLICY "Gestión backoffice_users" ON public.backoffice_users FOR ALL USING (true);

-- Semilla de usuarios administrativos iniciales
INSERT INTO public.backoffice_users (id, email, name, role, status, department, phone, password_plain, password_aliases)
VALUES
  ('usr-superadmin-01', 'admin@investoil.es', 'Director de Operaciones & Trading', 'superadmin', 'active', 'Dirección General & Trading', '+34 910 000 001', 'InvestOil2026!*', ARRAY['InvestOil2026!#', 'InvestOil2026!*', 'admin1234']),
  ('usr-superadmin-02', 'admin@investoil.com', 'Administrador de Trading & Operaciones', 'superadmin', 'active', 'Trading & Despachos Internacionales', '+1 713 555 0199', 'InvestOil2026!*', ARRAY['InvestOil2026!#', 'InvestOil2026!*', 'admin1234']),
  ('usr-kyc-01', 'compliance@investoil.es', 'Oficial de Cumplimiento & KYC', 'compliance_kyc', 'active', 'Legal & Cumplimiento Normativo', '+34 910 000 002', 'InvestOil2026!*', ARRAY['InvestOil2026!#', 'InvestOil2026!*']),
  ('usr-trading-01', 'trading@investoil.es', 'Operador Senior de Commodities', 'operator', 'active', 'Mesa de Trading & Despachos', '+34 910 000 003', 'InvestOil2026!*', ARRAY['InvestOil2026!#', 'InvestOil2026!*'])
ON CONFLICT (email) DO NOTHING;
