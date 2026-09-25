import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;
let initialized = false;

export function hasPostgresDb(): boolean {
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
    if (!initialized) {
      await ensurePgSchema();
      initialized = true;
    }
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
  `;

  try {
    await p.query(schemaSql);
  } catch (err: any) {
    console.error('[PostgreSQL Schema Init Error]:', err.message);
  }
}
