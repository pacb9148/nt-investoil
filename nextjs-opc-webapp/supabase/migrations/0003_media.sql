-- ==============================================================================
-- 0003_media.sql: Tabla de Media y Configuración de Storage
-- ==============================================================================

-- Tabla de media
CREATE TABLE IF NOT EXISTS public.media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('image', 'video', 'document')),
  mime_type TEXT,
  size INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);

-- Habilitar RLS en media
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de media"
  ON public.media FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Gestión de media para autenticados"
  ON public.media FOR ALL
  TO authenticated
  USING (true);

-- Crear bucket de storage para 'media' si existe schema storage
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('media', 'media', true)
    ON CONFLICT (id) DO NOTHING;

    -- Políticas de acceso a storage.objects para el bucket media
    DROP POLICY IF EXISTS "Media Storage Public Read" ON storage.objects;
    CREATE POLICY "Media Storage Public Read"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'media');

    DROP POLICY IF EXISTS "Media Storage Authenticated Upload" ON storage.objects;
    CREATE POLICY "Media Storage Authenticated Upload"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'media');

    DROP POLICY IF EXISTS "Media Storage Authenticated Delete" ON storage.objects;
    CREATE POLICY "Media Storage Authenticated Delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'media');
  END IF;
END $$;
