-- ==============================================================================
-- 0002_blog.sql: Tablas de Posts, Categorías y Relaciones
-- ==============================================================================

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Tabla de posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB, -- Tiptap JSON content
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  reading_time INTEGER DEFAULT 3,
  views INTEGER DEFAULT 0,
  is_republished BOOLEAN DEFAULT FALSE,
  original_source_url TEXT,
  original_source_name TEXT
);

-- Trigger de updated_at para posts
CREATE TRIGGER on_posts_updated
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Relación posts-categorías
CREATE TABLE IF NOT EXISTS public.post_categories (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

-- Índices para búsqueda rápida y ordenamiento
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_views ON public.posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Búsqueda full-text en español/inglés
CREATE INDEX IF NOT EXISTS idx_posts_fts ON public.posts USING gin(to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(excerpt, '')));

-- RLS en Categorías
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de categorías"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Gestión de categorías para usuarios autenticados"
  ON public.categories FOR ALL
  TO authenticated
  USING (true);

-- RLS en Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Los usuarios anónimos solo leen posts publicados
CREATE POLICY "Lectura pública de posts publicados"
  ON public.posts FOR SELECT
  TO anon
  USING (status = 'published');

-- Usuarios autenticados (admin, editor) pueden ver todos los posts (borradores, archivados, publicados)
CREATE POLICY "Lectura completa de posts para autenticados"
  ON public.posts FOR SELECT
  TO authenticated
  USING (true);

-- Usuarios autenticados pueden insertar, actualizar y eliminar posts
CREATE POLICY "Gestión de posts para autenticados"
  ON public.posts FOR ALL
  TO authenticated
  USING (true);

-- RLS en post_categories
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de post_categories"
  ON public.post_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Gestión de post_categories para autenticados"
  ON public.post_categories FOR ALL
  TO authenticated
  USING (true);
