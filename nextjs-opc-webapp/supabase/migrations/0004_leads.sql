-- ==============================================================================
-- 0004_leads.sql: Tabla de Mensajes y Leads de Contacto
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.contact_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'spam')),
  source TEXT DEFAULT 'web_contact_form',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TRIGGER on_contact_leads_updated
  BEFORE UPDATE ON public.contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_contact_leads_status ON public.contact_leads(status);
CREATE INDEX IF NOT EXISTS idx_contact_leads_created_at ON public.contact_leads(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- Los usuarios anónimos pueden enviar mensajes de contacto (INSERT)
CREATE POLICY "Inserción pública de mensajes de contacto"
  ON public.contact_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Solo usuarios administradores o autenticados pueden ver o editar leads
CREATE POLICY "Lectura y gestión de leads para usuarios autenticados"
  ON public.contact_leads FOR ALL
  TO authenticated
  USING (true);
