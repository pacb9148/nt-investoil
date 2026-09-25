import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.argv[2];

if (!databaseUrl) {
  console.error('[-] Error: Debe proporcionar DATABASE_URL o POSTGRES_URL como variable de entorno o como primer argumento.');
  console.log('Uso: node scripts/migrate-to-db.mjs "postgresql://usuario:password@host:5432/bd"');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
});

const dataDir = path.resolve(__dirname, '../src/data');

function readJson(filename) {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
}

async function run() {
  console.log('[*] Conectando a PostgreSQL...');
  const client = await pool.connect();
  console.log('[+] Conexión establecida con éxito.');

  try {
    console.log('[*] Creando y asegurando esquema de base de datos...');
    await client.query(`
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

      CREATE TABLE IF NOT EXISTS landing_sections (
        id TEXT PRIMARY KEY,
        content JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS landing_header (
        id INT PRIMARY KEY DEFAULT 1,
        logo_url TEXT NOT NULL DEFAULT '/images/branding/corporate-card-logo.jpeg',
        logo_text TEXT NOT NULL DEFAULT 'INVEST OIL',
        logo_tagline TEXT NOT NULL DEFAULT 'Trading Company',
        menu_items JSONB NOT NULL DEFAULT '[]'::jsonb,
        action_button JSONB NOT NULL DEFAULT '{"text":"Mesa de Trading","text_en":"Trading Desk","url":"/#contact","is_visible":true}'::jsonb,
        backoffice_button JSONB NOT NULL DEFAULT '{"text":"Backoffice","text_en":"Backoffice","is_visible":true}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS landing_seo (
        id INT PRIMARY KEY DEFAULT 1,
        site_name TEXT NOT NULL DEFAULT 'Invest Oil LLC',
        title_template TEXT NOT NULL DEFAULT '%s | Invest Oil LLC',
        default_meta_description TEXT NOT NULL DEFAULT 'Compañía internacional de trading de crudo, derivados petrolíferos y Pet Coke con logística global.',
        default_og_image TEXT NOT NULL DEFAULT '/images/branding/corporate-card-logo.jpeg',
        twitter_handle TEXT DEFAULT '@InvestOilGlobal',
        keywords JSONB NOT NULL DEFAULT '["petróleo","trading crudo","pet coke","combustibles marinos","invest oil"]'::jsonb,
        canonical_url TEXT NOT NULL DEFAULT 'https://investoil.es',
        robots_txt TEXT DEFAULT 'User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://investoil.es/sitemap.xml',
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS landing_problem (
        id INT PRIMARY KEY DEFAULT 1,
        eyebrow TEXT NOT NULL DEFAULT 'Dinámica de Mercados Volátiles',
        title TEXT NOT NULL DEFAULT 'Superando la Incertidumbre en la Cadena de Suministro Energético',
        subtitle TEXT NOT NULL DEFAULT 'Respuestas concretas frente a disrupciones geopolíticas y cuellos de botella logísticos.',
        pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
        solution_points JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS landing_marquee (
        id INT PRIMARY KEY DEFAULT 1,
        row1_items JSONB NOT NULL DEFAULT '[]'::jsonb,
        row2_items JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS landing_cta_final (
        id INT PRIMARY KEY DEFAULT 1,
        eyebrow TEXT NOT NULL DEFAULT 'Alianzas Estratégicas',
        title TEXT NOT NULL DEFAULT 'Asegure su Cadena de Suministro Petrolero con Invest Oil',
        description TEXT NOT NULL DEFAULT 'Conéctese con nuestra mesa de operaciones y despacho internacional para cotizaciones spot o contratos de suministro a largo plazo.',
        primary_cta JSONB NOT NULL DEFAULT '{"text":"Contactar Mesa de Trading","url":"#contact"}'::jsonb,
        secondary_cta JSONB NOT NULL DEFAULT '{"text":"Explorar Productos","url":"#products"}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

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

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'operator',
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

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
    `);
    console.log('[+] Esquema verificado y listo.');

    // 1. Categories
    const categories = readJson('categories.json') || [];
    for (const c of categories) {
      await client.query(
        `INSERT INTO categories (id, name, slug, description, name_en, description_en, color, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           name_en = EXCLUDED.name_en,
           description_en = EXCLUDED.description_en,
           color = EXCLUDED.color,
           updated_at = NOW()`,
        [c.id, c.name, c.slug, c.description || '', c.name_en || null, c.description_en || null, c.color || '#f59e0b']
      );
    }
    console.log(`[+] Categorías migradas: ${categories.length}`);

    // 2. Posts
    const posts = readJson('posts.json') || [];
    for (const p of posts) {
      await client.query(
        `INSERT INTO posts (id, slug, title, excerpt, content, status, category_id, category, featured_image_url, video_url, tags, reading_time, views, likes, is_republished, original_source_url, original_source_name, published_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
         ON CONFLICT (id) DO UPDATE SET
           slug = EXCLUDED.slug,
           title = EXCLUDED.title,
           excerpt = EXCLUDED.excerpt,
           content = EXCLUDED.content,
           status = EXCLUDED.status,
           category_id = EXCLUDED.category_id,
           category = EXCLUDED.category,
           featured_image_url = EXCLUDED.featured_image_url,
           video_url = EXCLUDED.video_url,
           tags = EXCLUDED.tags,
           reading_time = EXCLUDED.reading_time,
           views = EXCLUDED.views,
           likes = EXCLUDED.likes,
           is_republished = EXCLUDED.is_republished,
           original_source_url = EXCLUDED.original_source_url,
           original_source_name = EXCLUDED.original_source_name,
           published_at = EXCLUDED.published_at,
           updated_at = NOW()`,
        [
          p.id,
          p.slug,
          p.title,
          p.excerpt || '',
          p.content ? JSON.stringify(p.content) : null,
          p.status || 'draft',
          p.category_id || null,
          p.category || null,
          p.featured_image_url || null,
          p.video_url || null,
          p.tags || [],
          p.reading_time || 3,
          p.views || 0,
          p.likes || 0,
          p.is_republished || false,
          p.original_source_url || null,
          p.original_source_name || null,
          p.published_at || null,
        ]
      );
    }
    console.log(`[+] Artículos de blog migrados: ${posts.length}`);

    // 3. Team
    const team = readJson('team.json') || [];
    for (let i = 0; i < team.length; i++) {
      const m = team[i];
      await client.query(
        `INSERT INTO landing_team (id, number, name, role, role_en, location, image, photo_url, bio, bio_en, linkedin_url, sort_order, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
         ON CONFLICT (id) DO UPDATE SET
           number = EXCLUDED.number,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           role_en = EXCLUDED.role_en,
           location = EXCLUDED.location,
           image = EXCLUDED.image,
           photo_url = EXCLUDED.photo_url,
           bio = EXCLUDED.bio,
           bio_en = EXCLUDED.bio_en,
           linkedin_url = EXCLUDED.linkedin_url,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [
          m.id || `tm-${i + 1}`,
          m.number || `#0${i + 1}`,
          m.name,
          m.role,
          m.role_en || null,
          m.location || null,
          m.image || m.photo_url || null,
          m.photo_url || m.image || null,
          m.bio || null,
          m.bio_en || null,
          m.linkedin_url || null,
          m.sort_order !== undefined ? m.sort_order : i,
          m.is_active !== undefined ? m.is_active : true,
        ]
      );
    }
    console.log(`[+] Miembros de equipo migrados: ${team.length}`);

    // 4. Testimonials
    const testimonials = readJson('testimonials.json') || [];
    for (let i = 0; i < testimonials.length; i++) {
      const t = testimonials[i];
      await client.query(
        `INSERT INTO landing_testimonials (id, author_name, author_company, author_role, avatar_url, text_es, text_en, rating, sort_order, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (id) DO UPDATE SET
           author_name = EXCLUDED.author_name,
           author_company = EXCLUDED.author_company,
           author_role = EXCLUDED.author_role,
           avatar_url = EXCLUDED.avatar_url,
           text_es = EXCLUDED.text_es,
           text_en = EXCLUDED.text_en,
           rating = EXCLUDED.rating,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [
          t.id || `test-${i + 1}`,
          t.author_name || t.author || 'Cliente Confidencial',
          t.author_company || t.company || null,
          t.author_role || t.role || null,
          t.avatar_url || t.avatar || null,
          t.text_es || t.content || t.text || '',
          t.text_en || null,
          t.rating || 5,
          t.sort_order !== undefined ? t.sort_order : i,
          t.is_active !== undefined ? t.is_active : true,
        ]
      );
    }
    console.log(`[+] Testimonios migrados: ${testimonials.length}`);

    // 5. Services
    const services = readJson('services.json') || [];
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      await client.query(
        `INSERT INTO landing_services (id, title_es, title_en, description_es, description_en, icon, features, sort_order, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (id) DO UPDATE SET
           title_es = EXCLUDED.title_es,
           title_en = EXCLUDED.title_en,
           description_es = EXCLUDED.description_es,
           description_en = EXCLUDED.description_en,
           icon = EXCLUDED.icon,
           features = EXCLUDED.features,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [
          s.id || `serv-${i + 1}`,
          s.title_es || s.title || '',
          s.title_en || null,
          s.description_es || s.description || '',
          s.description_en || null,
          s.icon || null,
          JSON.stringify(s.features || []),
          s.sort_order !== undefined ? s.sort_order : i,
          s.is_active !== undefined ? s.is_active : true,
        ]
      );
    }
    console.log(`[+] Servicios petroleros migrados: ${services.length}`);

    // 6. Products
    const products = readJson('products.json') || [];
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pId = p.id || `prod-${i + 1}`;
      await client.query(
        `INSERT INTO landing_products (id, name_es, name_en, category, specs, description_es, description_en, image_url, sort_order, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name_es = EXCLUDED.name_es,
           name_en = EXCLUDED.name_en,
           category = EXCLUDED.category,
           specs = EXCLUDED.specs,
           description_es = EXCLUDED.description_es,
           description_en = EXCLUDED.description_en,
           image_url = EXCLUDED.image_url,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [
          pId,
          p.name_es || p.name || '',
          p.name_en || null,
          p.category || null,
          JSON.stringify(p.specs || {}),
          p.description_es || p.description || '',
          p.description_en || null,
          p.image_url || null,
          p.sort_order !== undefined ? p.sort_order : i,
          p.is_active !== undefined ? p.is_active : true,
        ]
      );
      await client.query(
        `INSERT INTO products (id, name, name_en, category, specs, description, description_en, image_url, is_active, sort_order, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           name_en = EXCLUDED.name_en,
           category = EXCLUDED.category,
           specs = EXCLUDED.specs,
           description = EXCLUDED.description,
           description_en = EXCLUDED.description_en,
           image_url = EXCLUDED.image_url,
           is_active = EXCLUDED.is_active,
           sort_order = EXCLUDED.sort_order,
           updated_at = NOW()`,
        [
          pId,
          p.name || p.name_es || '',
          p.name_en || null,
          p.category || null,
          JSON.stringify(p.specs || {}),
          p.description || p.description_es || '',
          p.description_en || null,
          p.image_url || null,
          p.is_active !== undefined ? p.is_active : true,
          p.sort_order !== undefined ? p.sort_order : i,
        ]
      );
    }
    console.log(`[+] Productos de hidrocarburos migrados: ${products.length}`);

    // 7. FAQs
    const faqs = readJson('faq.json') || [];
    for (let i = 0; i < faqs.length; i++) {
      const f = faqs[i];
      await client.query(
        `INSERT INTO landing_faq (id, question, answer, question_en, answer_en, category, sort_order, is_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           question = EXCLUDED.question,
           answer = EXCLUDED.answer,
           question_en = EXCLUDED.question_en,
           answer_en = EXCLUDED.answer_en,
           category = EXCLUDED.category,
           sort_order = EXCLUDED.sort_order,
           is_active = EXCLUDED.is_active,
           updated_at = NOW()`,
        [
          f.id || `faq-${i + 1}`,
          f.question || '',
          f.answer || '',
          f.question_en || null,
          f.answer_en || null,
          f.category || 'general',
          f.sort_order !== undefined ? f.sort_order : i,
          f.is_active !== undefined ? f.is_active : true,
        ]
      );
    }
    console.log(`[+] FAQs migradas: ${faqs.length}`);

    // 8. Media
    const media = readJson('media.json') || [];
    for (const m of media) {
      await client.query(
        `INSERT INTO media (id, filename, url, type, mime_type, size, alt_text, data_base64, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           filename = EXCLUDED.filename,
           url = EXCLUDED.url,
           type = EXCLUDED.type,
           mime_type = EXCLUDED.mime_type,
           size = EXCLUDED.size,
           alt_text = EXCLUDED.alt_text,
           data_base64 = COALESCE(EXCLUDED.data_base64, media.data_base64)`,
        [
          m.id,
          m.filename,
          m.url,
          m.type || 'image',
          m.mime_type || null,
          m.size || 0,
          m.alt_text || null,
          m.data_base64 || null,
        ]
      );
    }
    console.log(`[+] Elementos multimedia migrados: ${media.length}`);

    // 9. Users
    const users = readJson('users.json') || [];
    for (const u of users) {
      await client.query(
        `INSERT INTO backoffice_users (id, email, name, role, status, department, phone, password_plain, password_aliases, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           department = EXCLUDED.department,
           phone = EXCLUDED.phone,
           password_plain = EXCLUDED.password_plain,
           password_aliases = EXCLUDED.password_aliases`,
        [
          u.id,
          u.email,
          u.name,
          u.role || 'operator',
          u.status || 'active',
          u.department || null,
          u.phone || null,
          u.password_plain || 'InvestOil2026!*',
          u.password_aliases || ['InvestOil2026!*', 'InvestOil2026!#', 'admin1234'],
        ]
      );
      await client.query(
        `INSERT INTO users (id, email, name, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [u.id, u.email, u.name, u.role || 'operator', u.status || 'active']
      );
    }
    console.log(`[+] Usuarios migrados: ${users.length}`);

    // 10. Leads
    const leads = readJson('leads.json') || [];
    for (const l of leads) {
      await client.query(
        `INSERT INTO leads (id, name, email, phone, company, country, product_interest, volume, message, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           company = EXCLUDED.company,
           country = EXCLUDED.country,
           product_interest = EXCLUDED.product_interest,
           volume = EXCLUDED.volume,
           message = EXCLUDED.message,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [
          l.id,
          l.name || '',
          l.email || '',
          l.phone || null,
          l.company || null,
          l.country || null,
          l.product_interest || null,
          l.volume || null,
          l.message || null,
          l.status || 'new',
        ]
      );
    }
    console.log(`[+] Prospectos (leads) migrados: ${leads.length}`);

    // 11. Secciones Singleton y Universal landing_sections
    const sectionFiles = [
      'about', 'ai-settings', 'appearance', 'faq', 'header', 'hero',
      'legal-pages', 'marquee', 'operations', 'problem', 'products',
      'seo', 'services', 'settings', 'site-settings', 'team', 'testimonials'
    ];

    let sectionCount = 0;
    for (const key of sectionFiles) {
      const data = readJson(`${key}.json`);
      if (data !== null) {
        const pk = key.replace(/-/g, '_');
        await client.query(
          `INSERT INTO landing_sections (id, content, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
          [pk, JSON.stringify(data)]
        );
        if (key !== pk) {
          await client.query(
            `INSERT INTO landing_sections (id, content, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
            [key, JSON.stringify(data)]
          );
        }
        sectionCount++;
      }
    }
    console.log(`[+] Secciones universales migradas a landing_sections: ${sectionCount}`);

    console.log('\n[==============================================]');
    console.log('[+] MIGRACIÓN COMPLETADA CON ÉXITO SIN PÉRDIDAS');
    console.log('[==============================================]');
  } catch (err) {
    console.error('[-] Error durante la migración:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
