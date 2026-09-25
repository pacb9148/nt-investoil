import fs from 'fs';
import path from 'path';
import { hasPostgresDb, queryPg, ensurePgSchema } from '@/lib/db/pg-client';

export interface MigrationSummary {
  success: boolean;
  timestamp: string;
  totalRecordsMigrated: number;
  tables: Record<string, { count: number; status: 'migrated' | 'error' | 'skipped'; error?: string }>;
}

function resolveDataDir(): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'data'),
    path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../../../data'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), 'src', 'data');
}

function readJson<T>(filename: string): T | null {
  const dir = resolveDataDir();
  const filePath = path.join(dir, filename);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch (err) {
    console.error(`[migration-service] Error leyendo ${filename}:`, err);
  }
  return null;
}

export async function migrateAllJsonToPostgres(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    success: true,
    timestamp: new Date().toISOString(),
    totalRecordsMigrated: 0,
    tables: {},
  };

  if (!hasPostgresDb()) {
    return {
      ...summary,
      success: false,
      tables: {
        all: { count: 0, status: 'skipped', error: 'No se detectó DATABASE_URL o POSTGRES_URL activa.' },
      },
    };
  }

  // 1. Asegurar todas las tablas en la base de datos
  await ensurePgSchema();

  // Helper para registrar
  const recordTable = (table: string, count: number, status: 'migrated' | 'error', error?: string) => {
    summary.tables[table] = { count, status, error };
    if (status === 'migrated') {
      summary.totalRecordsMigrated += count;
    } else {
      summary.success = false;
    }
  };

  // ---------------------------------------------------------------------------
  // 1. CATEGORÍAS (categories.json -> categories)
  // ---------------------------------------------------------------------------
  try {
    const categories = readJson<any[]>('categories.json') || [];
    let count = 0;
    for (const c of categories) {
      await queryPg(
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
      count++;
    }
    recordTable('categories', count, 'migrated');
  } catch (err: any) {
    recordTable('categories', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. ARTÍCULOS DE BLOG (posts.json -> posts)
  // ---------------------------------------------------------------------------
  try {
    const posts = readJson<any[]>('posts.json') || [];
    let count = 0;
    for (const p of posts) {
      await queryPg(
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
      count++;
    }
    recordTable('posts', count, 'migrated');
  } catch (err: any) {
    recordTable('posts', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 3. MIEMBROS DE EQUIPO (team.json -> landing_team)
  // ---------------------------------------------------------------------------
  try {
    const team = readJson<any[]>('team.json') || [];
    let count = 0;
    for (let i = 0; i < team.length; i++) {
      const m = team[i];
      const memberId = m.id || `tm-${i + 1}`;
      await queryPg(
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
          memberId,
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
      count++;
    }
    recordTable('landing_team', count, 'migrated');
  } catch (err: any) {
    recordTable('landing_team', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 4. TESTIMONIOS (testimonials.json -> landing_testimonials)
  // ---------------------------------------------------------------------------
  try {
    const testimonials = readJson<any[]>('testimonials.json') || [];
    let count = 0;
    for (let i = 0; i < testimonials.length; i++) {
      const t = testimonials[i];
      const testId = t.id || `test-${i + 1}`;
      await queryPg(
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
          testId,
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
      count++;
    }
    recordTable('landing_testimonials', count, 'migrated');
  } catch (err: any) {
    recordTable('landing_testimonials', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 5. SERVICIOS PETROLEROS (services.json -> landing_services)
  // ---------------------------------------------------------------------------
  try {
    const services = readJson<any[]>('services.json') || [];
    let count = 0;
    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      const sId = s.id || `serv-${i + 1}`;
      await queryPg(
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
          sId,
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
      count++;
    }
    recordTable('landing_services', count, 'migrated');
  } catch (err: any) {
    recordTable('landing_services', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 6. PRODUCTOS DE HIDROCARBUROS (products.json -> landing_products y products)
  // ---------------------------------------------------------------------------
  try {
    const products = readJson<any[]>('products.json') || [];
    let count = 0;
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pId = p.id || `prod-${i + 1}`;
      await queryPg(
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

      await queryPg(
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
      count++;
    }
    recordTable('landing_products', count, 'migrated');
  } catch (err: any) {
    recordTable('landing_products', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 7. PREGUNTAS FRECUENTES (faq.json -> landing_faq)
  // ---------------------------------------------------------------------------
  try {
    const faqs = readJson<any[]>('faq.json') || [];
    let count = 0;
    for (let i = 0; i < faqs.length; i++) {
      const f = faqs[i];
      const fId = f.id || `faq-${i + 1}`;
      await queryPg(
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
          fId,
          f.question || '',
          f.answer || '',
          f.question_en || null,
          f.answer_en || null,
          f.category || 'general',
          f.sort_order !== undefined ? f.sort_order : i,
          f.is_active !== undefined ? f.is_active : true,
        ]
      );
      count++;
    }
    recordTable('landing_faq', count, 'migrated');
  } catch (err: any) {
    recordTable('landing_faq', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 8. CATÁLOGO MULTIMEDIA (media.json -> media)
  // ---------------------------------------------------------------------------
  try {
    const media = readJson<any[]>('media.json') || [];
    let count = 0;
    for (const m of media) {
      await queryPg(
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
      count++;
    }
    recordTable('media', count, 'migrated');
  } catch (err: any) {
    recordTable('media', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 9. USUARIOS Y CREDENCIALES (users.json -> backoffice_users y users)
  // ---------------------------------------------------------------------------
  try {
    const users = readJson<any[]>('users.json') || [];
    let count = 0;
    for (const u of users) {
      await queryPg(
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

      await queryPg(
        `INSERT INTO users (id, email, name, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           status = EXCLUDED.status,
           updated_at = NOW()`,
        [u.id, u.email, u.name, u.role || 'operator', u.status || 'active']
      );
      count++;
    }
    recordTable('backoffice_users', count, 'migrated');
  } catch (err: any) {
    recordTable('backoffice_users', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 10. LEADS Y PROSPECTOS (leads.json -> leads)
  // ---------------------------------------------------------------------------
  try {
    const leads = readJson<any[]>('leads.json') || [];
    let count = 0;
    for (const l of leads) {
      await queryPg(
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
      count++;
    }
    recordTable('leads', count, 'migrated');
  } catch (err: any) {
    recordTable('leads', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 11. TABLAS ESPECÍFICAS DE SECCIÓN (HEADER, ABOUT, FOOTER, SEO, HERO, APARIENCIA, OPERACIONES, PROBLEMA, MARQUEE)
  // ---------------------------------------------------------------------------
  try {
    // Header
    const header = readJson<any>('header.json');
    if (header) {
      await queryPg(
        `INSERT INTO landing_header (id, logo_url, logo_text, logo_tagline, menu_items, action_button, backoffice_button, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           logo_url = EXCLUDED.logo_url,
           logo_text = EXCLUDED.logo_text,
           logo_tagline = EXCLUDED.logo_tagline,
           menu_items = EXCLUDED.menu_items,
           action_button = EXCLUDED.action_button,
           backoffice_button = EXCLUDED.backoffice_button,
           updated_at = NOW()`,
        [
          header.logo_url || '/images/branding/corporate-card-logo.jpeg',
          header.logo_text || 'INVEST OIL',
          header.logo_tagline || 'Trading Company',
          JSON.stringify(header.menu_items || []),
          JSON.stringify(header.action_button || {}),
          JSON.stringify(header.backoffice_button || {}),
        ]
      );
    }

    // About
    const about = readJson<any>('about.json');
    if (about) {
      await queryPg(
        `INSERT INTO landing_about (id, badge, badge_en, title, title_en, tagline, tagline_en, story_paragraphs, story_paragraphs_en, mission_vision, values, stats, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         ON CONFLICT (id) DO UPDATE SET
           badge = EXCLUDED.badge,
           badge_en = EXCLUDED.badge_en,
           title = EXCLUDED.title,
           title_en = EXCLUDED.title_en,
           tagline = EXCLUDED.tagline,
           tagline_en = EXCLUDED.tagline_en,
           story_paragraphs = EXCLUDED.story_paragraphs,
           story_paragraphs_en = EXCLUDED.story_paragraphs_en,
           mission_vision = EXCLUDED.mission_vision,
           values = EXCLUDED.values,
           stats = EXCLUDED.stats,
           updated_at = NOW()`,
        [
          about.badge || 'Perfil Corporativo',
          about.badge_en || null,
          about.title || 'Invest Oil LLC',
          about.title_en || null,
          about.tagline || '',
          about.tagline_en || null,
          JSON.stringify(about.story_paragraphs || []),
          JSON.stringify(about.story_paragraphs_en || []),
          JSON.stringify(about.mission_vision || []),
          JSON.stringify(about.values || []),
          JSON.stringify(about.stats || []),
        ]
      );
    }

    // Footer & Sedes
    const settings = readJson<any>('settings.json') || readJson<any>('site-settings.json');
    if (settings) {
      await queryPg(
        `INSERT INTO landing_footer (id, brand, columns, headquarters, social_links, legal_notice, copyright, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           brand = EXCLUDED.brand,
           columns = EXCLUDED.columns,
           headquarters = EXCLUDED.headquarters,
           social_links = EXCLUDED.social_links,
           legal_notice = EXCLUDED.legal_notice,
           copyright = EXCLUDED.copyright,
           updated_at = NOW()`,
        [
          JSON.stringify(settings.brand || {}),
          JSON.stringify(settings.columns || []),
          JSON.stringify(settings.headquarters || settings.offices || []),
          JSON.stringify(settings.social_links || settings.social || []),
          settings.legal_notice || null,
          settings.copyright || null,
        ]
      );
    }

    // SEO & Identidad Delaware USA
    const seo = readJson<any>('seo.json');
    if (seo) {
      await queryPg(
        `INSERT INTO landing_seo (id, site_name, title_template, default_meta_description, default_og_image, twitter_handle, keywords, canonical_url, robots_txt, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (id) DO UPDATE SET
           site_name = EXCLUDED.site_name,
           title_template = EXCLUDED.title_template,
           default_meta_description = EXCLUDED.default_meta_description,
           default_og_image = EXCLUDED.default_og_image,
           twitter_handle = EXCLUDED.twitter_handle,
           keywords = EXCLUDED.keywords,
           canonical_url = EXCLUDED.canonical_url,
           robots_txt = EXCLUDED.robots_txt,
           updated_at = NOW()`,
        [
          seo.site_name || 'Invest Oil LLC',
          seo.title_template || '%s | Invest Oil LLC',
          seo.default_meta_description || seo.meta_description || '',
          seo.default_og_image || seo.og_image || '/images/branding/corporate-card-logo.jpeg',
          seo.twitter_handle || null,
          JSON.stringify(seo.keywords || []),
          seo.canonical_url || 'https://investoil.es',
          seo.robots_txt || null,
        ]
      );
    }

    // Hero
    const hero = readJson<any>('hero.json');
    if (hero) {
      await queryPg(
        `INSERT INTO landing_hero (id, eyebrow_text, eyebrow_text_en, headline_line1, headline_line1_en, headline_highlight, headline_highlight_en, headline_line2, headline_line2_en, description, description_en, primary_cta_text, primary_cta_text_en, primary_cta_url, secondary_cta_text, secondary_cta_text_en, secondary_cta_url, background_type, background_video_url, background_image_url, background_overlay_opacity, side_card_type, side_card_custom_image, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
         ON CONFLICT (id) DO UPDATE SET
           eyebrow_text = EXCLUDED.eyebrow_text,
           eyebrow_text_en = EXCLUDED.eyebrow_text_en,
           headline_line1 = EXCLUDED.headline_line1,
           headline_line1_en = EXCLUDED.headline_line1_en,
           headline_highlight = EXCLUDED.headline_highlight,
           headline_highlight_en = EXCLUDED.headline_highlight_en,
           headline_line2 = EXCLUDED.headline_line2,
           headline_line2_en = EXCLUDED.headline_line2_en,
           description = EXCLUDED.description,
           description_en = EXCLUDED.description_en,
           primary_cta_text = EXCLUDED.primary_cta_text,
           primary_cta_text_en = EXCLUDED.primary_cta_text_en,
           primary_cta_url = EXCLUDED.primary_cta_url,
           secondary_cta_text = EXCLUDED.secondary_cta_text,
           secondary_cta_text_en = EXCLUDED.secondary_cta_text_en,
           secondary_cta_url = EXCLUDED.secondary_cta_url,
           background_type = EXCLUDED.background_type,
           background_video_url = EXCLUDED.background_video_url,
           background_image_url = EXCLUDED.background_image_url,
           background_overlay_opacity = EXCLUDED.background_overlay_opacity,
           side_card_type = EXCLUDED.side_card_type,
           side_card_custom_image = EXCLUDED.side_card_custom_image,
           updated_at = NOW()`,
        [
          hero.eyebrow_text || 'INFRAESTRUCTURA Y TRADING ENERGÉTICO GLOBAL',
          hero.eyebrow_text_en || null,
          hero.headline_line1 || 'CONEXIONES GLOBALES EN EL',
          hero.headline_line1_en || null,
          hero.headline_highlight || 'MERCADO PETROLERO',
          hero.headline_highlight_en || null,
          hero.headline_line2 || 'Y SUS DERIVADOS',
          hero.headline_line2_en || null,
          hero.description || '',
          hero.description_en || null,
          hero.primary_cta_text || 'Contactar Especialista',
          hero.primary_cta_text_en || null,
          hero.primary_cta_url || '#contact',
          hero.secondary_cta_text || 'Ver Productos',
          hero.secondary_cta_text_en || null,
          hero.secondary_cta_url || '#products',
          hero.background_type || 'video',
          hero.background_video_url || '/videos/hero-background.mp4',
          hero.background_image_url || null,
          hero.background_overlay_opacity || 45,
          hero.side_card_type || 'trading_seal',
          hero.side_card_custom_image || null,
        ]
      );
    }

    // Apariencia
    const appearance = readJson<any>('appearance.json');
    if (appearance) {
      await queryPg(
        `INSERT INTO landing_site_appearance (id, primary_color, secondary_color, accent_color, font_family, border_radius, custom_css, updated_at)
         VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           primary_color = EXCLUDED.primary_color,
           secondary_color = EXCLUDED.secondary_color,
           accent_color = EXCLUDED.accent_color,
           font_family = EXCLUDED.font_family,
           border_radius = EXCLUDED.border_radius,
           custom_css = EXCLUDED.custom_css,
           updated_at = NOW()`,
        [
          appearance.primary_color || '#f59e0b',
          appearance.secondary_color || '#0f172a',
          appearance.accent_color || '#10b981',
          appearance.font_family || 'Outfit',
          appearance.border_radius || '0.5rem',
          appearance.custom_css || null,
        ]
      );
    }

    // Operaciones
    const operations = readJson<any>('operations.json');
    if (operations) {
      await queryPg(
        `INSERT INTO landing_operations (id, facilities, metrics, updated_at)
         VALUES (1, $1, '[]'::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           facilities = EXCLUDED.facilities,
           updated_at = NOW()`,
        [JSON.stringify(operations)]
      );
    }

    // Problema
    const problem = readJson<any>('problem.json');
    if (problem) {
      await queryPg(
        `INSERT INTO landing_problem (id, pain_points, solution_points, updated_at)
         VALUES (1, $1, '[]'::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET
           pain_points = EXCLUDED.pain_points,
           updated_at = NOW()`,
        [JSON.stringify(problem)]
      );
    }

    // Marquesina
    const marquee = readJson<any>('marquee.json');
    if (marquee) {
      await queryPg(
        `INSERT INTO landing_marquee (id, row1_items, row2_items, updated_at)
         VALUES (1, $1, $2, NOW())
         ON CONFLICT (id) DO UPDATE SET
           row1_items = EXCLUDED.row1_items,
           row2_items = EXCLUDED.row2_items,
           updated_at = NOW()`,
        [JSON.stringify(marquee.row1_items || marquee), JSON.stringify(marquee.row2_items || [])]
      );
    }

    recordTable('landing_singleton_sections', 9, 'migrated');
  } catch (err: any) {
    recordTable('landing_singleton_sections', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 12. TABLA UNIVERSAL `landing_sections` (Persistencia completa indexada de cada JSON)
  // ---------------------------------------------------------------------------
  try {
    const sectionFiles = [
      'about',
      'ai-settings',
      'appearance',
      'faq',
      'header',
      'hero',
      'legal-pages',
      'marquee',
      'operations',
      'problem',
      'products',
      'seo',
      'services',
      'settings',
      'site-settings',
      'team',
      'testimonials',
    ];

    let count = 0;
    for (const key of sectionFiles) {
      const data = readJson<any>(`${key}.json`);
      if (data !== null) {
        // Guardar con clave normalizada y con alias si aplica
        const primaryKey = key.replace(/-/g, '_');
        await queryPg(
          `INSERT INTO landing_sections (id, content, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
          [primaryKey, JSON.stringify(data)]
        );
        // También guardar con la clave original si tiene guiones para compatibilidad
        if (key !== primaryKey) {
          await queryPg(
            `INSERT INTO landing_sections (id, content, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
            [key, JSON.stringify(data)]
          );
        }
        if (key === 'ai-settings') {
          await queryPg(
            `INSERT INTO landing_sections (id, content, updated_at)
             VALUES ('ai_settings_config', $1, NOW())
             ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()`,
            [JSON.stringify(data)]
          );
        }
        count++;
      }
    }
    recordTable('landing_sections', count, 'migrated');
  } catch (err: any) {
    recordTable('landing_sections', 0, 'error', err.message);
  }

  return summary;
}
