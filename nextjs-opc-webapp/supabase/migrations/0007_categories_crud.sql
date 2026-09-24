-- ==============================================================================
-- Migración 0007: Categorías en Base de Datos y campo obligatorio en Posts
-- Invest Oil LLC — Sistema OPC
-- ==============================================================================

-- 1. Asegurar tabla public.categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  name_en TEXT,
  description_en TEXT,
  color TEXT DEFAULT '#f59e0b',
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lectura publica categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Gestion total categories" ON public.categories FOR ALL USING (true);

-- 2. Asegurar columna category_id y category en public.posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN category_id TEXT REFERENCES public.categories(id) ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN category TEXT;
  END IF;
END $$;

-- 3. Semilla de Categorías Comerciales Petroleras Oficiales
INSERT INTO public.categories (id, name, slug, description, name_en, color)
VALUES
  ('cat-1', 'Mercado Petrolero & Precios', 'mercado-petrolero', 'Análisis de diferenciales Brent/WTI, cotizaciones y balances de inventarios.', 'Oil Markets & Pricing', '#f59e0b'),
  ('cat-2', 'Logística & Fletes Marítimos', 'logistica-maritima', 'Rutas VLCC/Aframax, fletes internacionales y operaciones terminales.', 'Maritime & Freight Logistics', '#06b6d4'),
  ('cat-3', 'Refinación & Derivados', 'refinacion-derivados', 'Merey 16, Diésel EN590, Jet A-1 y procesamiento en unidades de alta conversión.', 'Refining & Derivatives', '#eab308'),
  ('cat-4', 'Compliance & Regulaciones', 'compliance-regulaciones', 'Incoterms 2020, cartas de crédito documentarias e inspección SGS.', 'Compliance & Regulations', '#10b981'),
  ('cat-5', 'Pet Coke & Commodities Sólidos', 'pet-coke-solidos', 'Coque de petróleo verde y calcinado para cementeras y metalurgia.', 'Pet Coke & Solid Carbon', '#ec4899'),
  ('cat-6', 'Transición & Sostenibilidad', 'transicion-sostenibilidad', 'GNL criogénico, combustibles marítimos de ultra bajo azufre (MGO).', 'Energy Transition & ESG', '#8b5cf6')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color = EXCLUDED.color;
