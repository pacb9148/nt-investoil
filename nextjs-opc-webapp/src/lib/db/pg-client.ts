import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;
let initialized = false;
// Solo la creación de tablas (no la migración): la migración usa queryPg, así que si queryPg
// esperase a la migración se bloquearía a sí misma.
let initPromise: Promise<void> | null = null;
// La migración de los JSON se lanza una sola vez por proceso.
let migrationStarted = false;

export function hasPostgresDb(): boolean {
  // `next build` renderiza páginas en varios procesos a la vez: durante la compilación no se
  // toca la base (se usan los JSON); las tablas y la migración se crean al arrancar en producción.
  if (process.env.NEXT_PHASE === 'phase-production-build') return false;
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  return !!(url && url.trim().length > 0 && !url.includes('demo-project'));
}

export function getPgPool(): Pool | null {
  if (!hasPostgresDb()) return null;

  if (!pool) {
    const connectionString = (process.env.DATABASE_URL || process.env.POSTGRES_URL)!.trim();
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000,
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }

  return pool;
}

export async function queryPg<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T> | null> {
  const p = getPgPool();
  if (!p) return null;

  try {
    // Inicializar tablas automáticamente en la primera consulta
    // Se marca ANTES de inicializar: antes se marcaba después, y la migración (que llama a
    // queryPg) volvía a entrar aquí, detectaba la base vacía y lanzaba otra migración, y así en
    // bucle: cientos de migraciones simultáneas que tumbaban el build y luego la aplicación.
    if (!initialized) {
      initialized = true;
      initPromise = ensurePgSchema();
    }
    await initPromise;
    return await p.query<T>(text, params);
  } catch (err: any) {
    console.error('[PostgreSQL Query Error]:', err.message, 'SQL:', text.slice(0, 100));
    return null;
  }
}

export async function ensurePgSchema(): Promise<void> {
  const p = getPgPool();
  if (!p) return;

  const schemaSql = `
    -- 1. Tabla de archivos binarios persistentes (imágenes y videos)
    CREATE TABLE IF NOT EXISTS media_files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size BIGINT NOT NULL,
      data_base64 TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_media_files_filename ON media_files(filename);

    -- 2. Tabla de catálogo de medios
    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      type TEXT NOT NULL,
      mime_type TEXT,
      size BIGINT,
      alt_text TEXT,
      data_base64 TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Tabla de categorías de blog
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      name_en TEXT,
      description_en TEXT,
      color TEXT DEFAULT '#f59e0b',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 4. Tabla de artículos de blog
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT,
      content JSONB,
      status TEXT DEFAULT 'draft',
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      category TEXT,
      featured_image_url TEXT,
      video_url TEXT,
      tags TEXT[],
      reading_time INTEGER DEFAULT 3,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      is_republished BOOLEAN DEFAULT FALSE,
      original_source_url TEXT,
      original_source_name TEXT,
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;

    -- 5. Tabla de miembros de equipo
    CREATE TABLE IF NOT EXISTS landing_team (
      id TEXT PRIMARY KEY,
      number TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      role_en TEXT,
      location TEXT,
      image TEXT,
      bio TEXT,
      bio_en TEXT,
      photo_url TEXT,
      linkedin_url TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 6. Tabla de configuración de secciones (Hero, Header, Footer, etc.)
    CREATE TABLE IF NOT EXISTS landing_sections (
      id TEXT PRIMARY KEY,
      content JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 7. Cabecera y Menú
    CREATE TABLE IF NOT EXISTS landing_header (
      id INT PRIMARY KEY DEFAULT 1,
      logo_url TEXT NOT NULL DEFAULT '/images/branding/oil-drop-logo.png',
      logo_text TEXT NOT NULL DEFAULT 'INVEST OIL',
      logo_tagline TEXT NOT NULL DEFAULT 'Petroleum and Derivates Markets',
      menu_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      action_button JSONB NOT NULL DEFAULT '{"text":"Mesa de Trading","text_en":"Trading Desk","url":"/#contact","is_visible":true}'::jsonb,
      backoffice_button JSONB NOT NULL DEFAULT '{"text":"Backoffice","text_en":"Backoffice","is_visible":true}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 8. Página Nosotros (/about)
    CREATE TABLE IF NOT EXISTS landing_about (
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
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 9. Pie de Página & Sedes
    CREATE TABLE IF NOT EXISTS landing_footer (
      id INT PRIMARY KEY DEFAULT 1,
      brand JSONB NOT NULL DEFAULT '{}'::jsonb,
      columns JSONB NOT NULL DEFAULT '[]'::jsonb,
      headquarters JSONB NOT NULL DEFAULT '[]'::jsonb,
      social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
      legal_notice TEXT DEFAULT 'Invest Oil LLC es una firma comercial internacional especializada en commodities energéticos.',
      copyright TEXT DEFAULT '© 2026 Invest Oil LLC. Todos los derechos reservados.',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 10. SEO & Metadatos
    CREATE TABLE IF NOT EXISTS landing_seo (
      id INT PRIMARY KEY DEFAULT 1,
      site_name TEXT NOT NULL DEFAULT 'Invest Oil LLC',
      title_template TEXT NOT NULL DEFAULT '%s | Invest Oil LLC',
      default_meta_description TEXT NOT NULL DEFAULT 'Compañía internacional de trading de crudo, derivados petrolíferos y Pet Coke con logística global.',
      default_og_image TEXT NOT NULL DEFAULT '/images/branding/oil-drop-logo.png',
      twitter_handle TEXT DEFAULT '@InvestOilGlobal',
      keywords JSONB NOT NULL DEFAULT '["petróleo","trading crudo","pet coke","combustibles marinos","invest oil"]'::jsonb,
      canonical_url TEXT NOT NULL DEFAULT 'https://investoil.es',
      robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://investoil.es/sitemap.xml',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 11. Hero Principal
    CREATE TABLE IF NOT EXISTS landing_hero (
      id INT PRIMARY KEY DEFAULT 1,
      eyebrow_text TEXT DEFAULT 'INFRAESTRUCTURA Y TRADING ENERGÉTICO GLOBAL',
      eyebrow_text_en TEXT DEFAULT 'GLOBAL ENERGY TRADING & INFRASTRUCTURE',
      headline_line1 TEXT DEFAULT 'CONEXIONES GLOBALES EN EL',
      headline_line1_en TEXT DEFAULT 'GLOBAL CONNECTIONS IN THE',
      headline_highlight TEXT DEFAULT 'MERCADO PETROLERO',
      headline_highlight_en TEXT DEFAULT 'PETROLEUM MARKET',
      headline_line2 TEXT DEFAULT 'Y SUS DERIVADOS',
      headline_line2_en TEXT DEFAULT 'AND ITS DERIVATIVES',
      description TEXT DEFAULT 'Facilitamos operaciones internacionales de crudo y refinados con presencia estratégica en Houston, Madrid y Bogotá.',
      description_en TEXT DEFAULT 'We facilitate international crude and refined operations with strategic presence in Houston, Madrid, and Bogota.',
      primary_cta_text TEXT DEFAULT 'Contactar Especialista',
      primary_cta_text_en TEXT DEFAULT 'Contact Specialist',
      primary_cta_url TEXT DEFAULT '#contact',
      secondary_cta_text TEXT DEFAULT 'Ver Productos',
      secondary_cta_text_en TEXT DEFAULT 'View Products',
      secondary_cta_url TEXT DEFAULT '#products',
      background_type TEXT DEFAULT 'video',
      background_video_url TEXT DEFAULT '/videos/hero-background.mp4',
      background_image_url TEXT,
      background_overlay_opacity INT DEFAULT 45,
      side_card_type TEXT DEFAULT 'trading_seal',
      side_card_custom_image TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 12. Apariencia y Colores
    CREATE TABLE IF NOT EXISTS landing_site_appearance (
      id INT PRIMARY KEY DEFAULT 1,
      primary_color TEXT DEFAULT '#f59e0b',
      secondary_color TEXT DEFAULT '#0f172a',
      accent_color TEXT DEFAULT '#10b981',
      font_family TEXT DEFAULT 'Outfit',
      border_radius TEXT DEFAULT '0.5rem',
      custom_css TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 13. Testimonios
    CREATE TABLE IF NOT EXISTS landing_testimonials (
      id TEXT PRIMARY KEY,
      author_name TEXT NOT NULL,
      author_company TEXT,
      author_role TEXT,
      avatar_url TEXT,
      text_es TEXT NOT NULL,
      text_en TEXT,
      rating INT DEFAULT 5,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 14. Servicios Petroleros
    CREATE TABLE IF NOT EXISTS landing_services (
      id TEXT PRIMARY KEY,
      title_es TEXT NOT NULL,
      title_en TEXT,
      description_es TEXT NOT NULL,
      description_en TEXT,
      icon TEXT,
      features JSONB DEFAULT '[]'::jsonb,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 15. Productos de Hidrocarburos
    CREATE TABLE IF NOT EXISTS landing_products (
      id TEXT PRIMARY KEY,
      name_es TEXT NOT NULL,
      name_en TEXT,
      category TEXT,
      specs JSONB DEFAULT '{}'::jsonb,
      description_es TEXT,
      description_en TEXT,
      image_url TEXT,
      sort_order INT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 16. Productos Generales
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      category TEXT,
      specs JSONB DEFAULT '{}'::jsonb,
      description TEXT,
      description_en TEXT,
      image_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 17. Operaciones & Infraestructura
    CREATE TABLE IF NOT EXISTS landing_operations (
      id INT PRIMARY KEY DEFAULT 1,
      title_es TEXT NOT NULL DEFAULT 'Red Logística y Terminales Estratégicas',
      title_en TEXT DEFAULT 'Global Logistics Network & Strategic Terminals',
      subtitle_es TEXT NOT NULL DEFAULT 'Presencia operativa en los principales hubs portuarios y rutas marítimas mundiales.',
      subtitle_en TEXT DEFAULT 'Operational presence across major global port hubs and maritime trade corridors.',
      facilities JSONB NOT NULL DEFAULT '[]'::jsonb,
      metrics JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 18. Retos del Sector (Problema / Solución)
    CREATE TABLE IF NOT EXISTS landing_problem (
      id INT PRIMARY KEY DEFAULT 1,
      eyebrow TEXT NOT NULL DEFAULT 'Dinámica de Mercados Volátiles',
      title TEXT NOT NULL DEFAULT 'Superando la Incertidumbre en la Cadena de Suministro Energético',
      subtitle TEXT NOT NULL DEFAULT 'Respuestas concretas frente a disrupciones geopolíticas y cuellos de botella logísticos.',
      pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
      solution_points JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 19. Marquesina
    CREATE TABLE IF NOT EXISTS landing_marquee (
      id INT PRIMARY KEY DEFAULT 1,
      row1_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      row2_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 20. CTA Final
    CREATE TABLE IF NOT EXISTS landing_cta_final (
      id INT PRIMARY KEY DEFAULT 1,
      eyebrow TEXT NOT NULL DEFAULT 'Alianzas Estratégicas',
      title TEXT NOT NULL DEFAULT 'Asegure su Cadena de Suministro Petrolero con Invest Oil',
      description TEXT NOT NULL DEFAULT 'Conéctese con nuestra mesa de operaciones y despacho internacional para cotizaciones spot o contratos de suministro a largo plazo.',
      primary_cta JSONB NOT NULL DEFAULT '{"text":"Contactar Mesa de Trading","url":"#contact"}'::jsonb,
      secondary_cta JSONB NOT NULL DEFAULT '{"text":"Explorar Productos","url":"#products"}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 21. FAQ
    CREATE TABLE IF NOT EXISTS landing_faq (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      question_en TEXT,
      answer_en TEXT,
      category TEXT DEFAULT 'general',
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 22. Usuarios del Backoffice
    CREATE TABLE IF NOT EXISTS backoffice_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      status TEXT NOT NULL DEFAULT 'active',
      department TEXT,
      phone TEXT,
      password_plain TEXT,
      password_aliases TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ
    );

    -- 23. Usuarios Generales
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'operator',
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 24. Prospectos y Leads
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      country TEXT,
      product_interest TEXT,
      volume TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    await p.query(schemaSql);
  } catch (err: any) {
    console.error('[PostgreSQL Schema Init Error]:', err.message);
  }
}
