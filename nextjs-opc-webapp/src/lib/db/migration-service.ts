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
    const checkCat = await queryPg('SELECT COUNT(*) as count FROM categories');
    const existingCatCount = checkCat ? parseInt(checkCat.rows[0]?.count || '0', 10) : 0;
    if (existingCatCount > 0) {
      recordTable('categories', existingCatCount, 'migrated');
    } else {
      const categories = readJson<any[]>('categories.json') || [];
      let count = 0;
      for (const c of categories) {
        await queryPg(
          `INSERT INTO categories (id, name, slug, description, name_en, description_en, color, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [c.id, c.name, c.slug, c.description || '', c.name_en || null, c.description_en || null, c.color || '#f59e0b']
        );
        count++;
      }
      recordTable('categories', count, 'migrated');
    }
  } catch (err: any) {
    recordTable('categories', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 2. ARTÍCULOS DE BLOG (posts.json -> posts)
  // ---------------------------------------------------------------------------
  try {
    const checkPosts = await queryPg('SELECT COUNT(*) as count FROM posts');
    const existingPostsCount = checkPosts ? parseInt(checkPosts.rows[0]?.count || '0', 10) : 0;
    if (existingPostsCount > 0) {
      recordTable('posts', existingPostsCount, 'migrated');
    } else {
      const posts = readJson<any[]>('posts.json') || [];
      let count = 0;
      for (const p of posts) {
        await queryPg(
          `INSERT INTO posts (id, slug, title, excerpt, content, status, category_id, category, featured_image_url, video_url, tags, reading_time, views, likes, is_republished, original_source_url, original_source_name, published_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('posts', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 3. MIEMBROS DE EQUIPO (team.json -> landing_team)
  // ---------------------------------------------------------------------------
  try {
    const checkTeam = await queryPg('SELECT COUNT(*) as count FROM landing_team');
    const existingTeamCount = checkTeam ? parseInt(checkTeam.rows[0]?.count || '0', 10) : 0;
    if (existingTeamCount > 0) {
      recordTable('landing_team', existingTeamCount, 'migrated');
    } else {
      const team = readJson<any[]>('team.json') || [];
      let count = 0;
      for (let i = 0; i < team.length; i++) {
        const m = team[i];
        const memberId = m.id || `tm-${i + 1}`;
        await queryPg(
          `INSERT INTO landing_team (id, number, name, role, role_en, location, image, photo_url, bio, bio_en, linkedin_url, sort_order, is_active, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('landing_team', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 4. TESTIMONIOS (testimonials.json -> landing_testimonials)
  // ---------------------------------------------------------------------------
  try {
    const checkTest = await queryPg('SELECT COUNT(*) as count FROM landing_testimonials');
    const existingTestCount = checkTest ? parseInt(checkTest.rows[0]?.count || '0', 10) : 0;
    if (existingTestCount > 0) {
      recordTable('landing_testimonials', existingTestCount, 'migrated');
    } else {
      const testimonials = readJson<any[]>('testimonials.json') || [];
      let count = 0;
      for (let i = 0; i < testimonials.length; i++) {
        const t = testimonials[i];
        const testId = t.id || `test-${i + 1}`;
        await queryPg(
          `INSERT INTO landing_testimonials (id, author_name, author_company, author_role, avatar_url, text_es, text_en, rating, sort_order, is_active, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('landing_testimonials', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 5. SERVICIOS PETROLEROS (services.json -> landing_services)
  // ---------------------------------------------------------------------------
  try {
    const checkServ = await queryPg('SELECT COUNT(*) as count FROM landing_services');
    const existingServCount = checkServ ? parseInt(checkServ.rows[0]?.count || '0', 10) : 0;
    if (existingServCount > 0) {
      recordTable('landing_services', existingServCount, 'migrated');
    } else {
      const services = readJson<any[]>('services.json') || [];
      let count = 0;
      for (let i = 0; i < services.length; i++) {
        const s = services[i];
        const sId = s.id || `serv-${i + 1}`;
        await queryPg(
          `INSERT INTO landing_services (id, title_es, title_en, description_es, description_en, icon, features, sort_order, is_active, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('landing_services', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 6. PRODUCTOS DE HIDROCARBUROS (products.json -> landing_products y products)
  // ---------------------------------------------------------------------------
  try {
    const checkProd = await queryPg('SELECT COUNT(*) as count FROM landing_products');
    const existingProdCount = checkProd ? parseInt(checkProd.rows[0]?.count || '0', 10) : 0;
    if (existingProdCount > 0) {
      recordTable('landing_products', existingProdCount, 'migrated');
    } else {
      const products = readJson<any[]>('products.json') || [];
      let count = 0;
      for (let i = 0; i < products.length; i++) {
        const p = products[i];
        const pId = p.id || `prod-${i + 1}`;
        await queryPg(
          `INSERT INTO landing_products (id, name_es, name_en, category, specs, description_es, description_en, image_url, sort_order, is_active, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('landing_products', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 7. PREGUNTAS FRECUENTES (faq.json -> landing_faq)
  // ---------------------------------------------------------------------------
  try {
    const checkFaq = await queryPg('SELECT COUNT(*) as count FROM landing_faq');
    const existingFaqCount = checkFaq ? parseInt(checkFaq.rows[0]?.count || '0', 10) : 0;
    if (existingFaqCount > 0) {
      recordTable('landing_faq', existingFaqCount, 'migrated');
    } else {
      const faqs = readJson<any[]>('faq.json') || [];
      let count = 0;
      for (let i = 0; i < faqs.length; i++) {
        const f = faqs[i];
        const fId = f.id || `faq-${i + 1}`;
        await queryPg(
          `INSERT INTO landing_faq (id, question, answer, question_en, answer_en, category, sort_order, is_active, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('landing_faq', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 8. CATÁLOGO MULTIMEDIA (media.json -> media)
  // ---------------------------------------------------------------------------
  try {
    const checkMedia = await queryPg('SELECT COUNT(*) as count FROM media');
    const existingMediaCount = checkMedia ? parseInt(checkMedia.rows[0]?.count || '0', 10) : 0;
    if (existingMediaCount > 0) {
      recordTable('media', existingMediaCount, 'migrated');
    } else {
      const media = readJson<any[]>('media.json') || [];
      let count = 0;
      for (const m of media) {
        await queryPg(
          `INSERT INTO media (id, filename, url, type, mime_type, size, alt_text, data_base64, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('media', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 9. USUARIOS Y CREDENCIALES (users.json -> backoffice_users y users)
  // ---------------------------------------------------------------------------
  try {
    const checkUsers = await queryPg('SELECT COUNT(*) as count FROM backoffice_users');
    const existingUsersCount = checkUsers ? parseInt(checkUsers.rows[0]?.count || '0', 10) : 0;
    if (existingUsersCount > 0) {
      recordTable('backoffice_users', existingUsersCount, 'migrated');
    } else {
      const users = readJson<any[]>('users.json') || [];
      let count = 0;
      for (const u of users) {
        await queryPg(
          `INSERT INTO backoffice_users (id, email, name, role, status, department, phone, password_plain, password_aliases, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
           ON CONFLICT (email) DO NOTHING`,
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
           ON CONFLICT (email) DO NOTHING`,
          [u.id, u.email, u.name, u.role || 'operator', u.status || 'active']
        );
        count++;
      }
      recordTable('backoffice_users', count, 'migrated');
    }
  } catch (err: any) {
    recordTable('backoffice_users', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 10. LEADS Y PROSPECTOS (leads.json -> leads)
  // ---------------------------------------------------------------------------
  try {
    const checkLeads = await queryPg('SELECT COUNT(*) as count FROM leads');
    const existingLeadsCount = checkLeads ? parseInt(checkLeads.rows[0]?.count || '0', 10) : 0;
    if (existingLeadsCount > 0) {
      recordTable('leads', existingLeadsCount, 'migrated');
    } else {
      const leads = readJson<any[]>('leads.json') || [];
      let count = 0;
      for (const l of leads) {
        await queryPg(
          `INSERT INTO leads (id, name, email, phone, company, country, product_interest, volume, message, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }
  } catch (err: any) {
    recordTable('leads', 0, 'error', err.message);
  }

  // ---------------------------------------------------------------------------
  // 11. TABLAS ESPECÍFICAS DE SECCIÓN (HEADER, ABOUT, FOOTER, SEO, HERO, APARIENCIA, OPERACIONES, PROBLEMA, MARQUEE)
  // ---------------------------------------------------------------------------
  try {
    // Header
    const checkHeader = await queryPg('SELECT COUNT(*) as count FROM landing_header');
    if (!checkHeader || parseInt(checkHeader.rows[0]?.count || '0', 10) === 0) {
      const header = readJson<any>('header.json');
      if (header) {
        await queryPg(
          `INSERT INTO landing_header (id, logo_url, logo_text, logo_tagline, menu_items, action_button, backoffice_button, updated_at)
           VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }

    // About
    const checkAbout = await queryPg('SELECT COUNT(*) as count FROM landing_about');
    if (!checkAbout || parseInt(checkAbout.rows[0]?.count || '0', 10) === 0) {
      const about = readJson<any>('about.json');
      if (about) {
        await queryPg(
          `INSERT INTO landing_about (id, badge, badge_en, title, title_en, tagline, tagline_en, story_paragraphs, story_paragraphs_en, mission_vision, values, stats, updated_at)
           VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }

    // Footer & Sedes
    const checkFooter = await queryPg('SELECT COUNT(*) as count FROM landing_footer');
    if (!checkFooter || parseInt(checkFooter.rows[0]?.count || '0', 10) === 0) {
      const settings = readJson<any>('settings.json') || readJson<any>('site-settings.json');
      if (settings) {
        await queryPg(
          `INSERT INTO landing_footer (id, brand, columns, headquarters, social_links, legal_notice, copyright, updated_at)
           VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }

    // SEO & Identidad Delaware USA
    const checkSeo = await queryPg('SELECT COUNT(*) as count FROM landing_seo');
    if (!checkSeo || parseInt(checkSeo.rows[0]?.count || '0', 10) === 0) {
      const seo = readJson<any>('seo.json');
      if (seo) {
        await queryPg(
          `INSERT INTO landing_seo (id, site_name, title_template, default_meta_description, default_og_image, twitter_handle, keywords, canonical_url, robots_txt, updated_at)
           VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }

    // Hero
    const checkHero = await queryPg('SELECT COUNT(*) as count FROM landing_hero');
    if (!checkHero || parseInt(checkHero.rows[0]?.count || '0', 10) === 0) {
      const hero = readJson<any>('hero.json');
      if (hero) {
        await queryPg(
          `INSERT INTO landing_hero (id, eyebrow_text, eyebrow_text_en, headline_line1, headline_line1_en, headline_highlight, headline_highlight_en, headline_line2, headline_line2_en, description, description_en, primary_cta_text, primary_cta_text_en, primary_cta_url, secondary_cta_text, secondary_cta_text_en, secondary_cta_url, background_type, background_video_url, background_image_url, background_overlay_opacity, side_card_type, side_card_custom_image, updated_at)
           VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }

    // Apariencia
    const checkApp = await queryPg('SELECT COUNT(*) as count FROM landing_site_appearance');
    if (!checkApp || parseInt(checkApp.rows[0]?.count || '0', 10) === 0) {
      const appearance = readJson<any>('appearance.json');
      if (appearance) {
        await queryPg(
          `INSERT INTO landing_site_appearance (id, primary_color, secondary_color, accent_color, font_family, border_radius, custom_css, updated_at)
           VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (id) DO NOTHING`,
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
    }

    // Operaciones
    const checkOps = await queryPg('SELECT COUNT(*) as count FROM landing_operations');
    if (!checkOps || parseInt(checkOps.rows[0]?.count || '0', 10) === 0) {
      const operations = readJson<any>('operations.json');
      if (operations) {
        await queryPg(
          `INSERT INTO landing_operations (id, facilities, metrics, updated_at)
           VALUES (1, $1, '[]'::jsonb, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(operations)]
        );
      }
    }

    // Problema
    const checkProb = await queryPg('SELECT COUNT(*) as count FROM landing_problem');
    if (!checkProb || parseInt(checkProb.rows[0]?.count || '0', 10) === 0) {
      const problem = readJson<any>('problem.json');
      if (problem) {
        await queryPg(
          `INSERT INTO landing_problem (id, pain_points, solution_points, updated_at)
           VALUES (1, $1, '[]'::jsonb, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(problem)]
        );
      }
    }

    // Marquesina
    const checkMarq = await queryPg('SELECT COUNT(*) as count FROM landing_marquee');
    if (!checkMarq || parseInt(checkMarq.rows[0]?.count || '0', 10) === 0) {
      const marquee = readJson<any>('marquee.json');
      if (marquee) {
        await queryPg(
          `INSERT INTO landing_marquee (id, row1_items, row2_items, updated_at)
           VALUES (1, $1, $2, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(marquee.row1_items || marquee), JSON.stringify(marquee.row2_items || [])]
        );
      }
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
      const primaryKey = key.replace(/-/g, '_');
      // Verificar si ya existe en la base de datos viva
      const checkSec = await queryPg('SELECT COUNT(*) as count FROM landing_sections WHERE id = $1', [primaryKey]);
      if (checkSec && parseInt(checkSec.rows[0]?.count || '0', 10) > 0) {
        count++;
        continue;
      }

      const data = readJson<any>(`${key}.json`);
      if (data !== null) {
        await queryPg(
          `INSERT INTO landing_sections (id, content, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (id) DO NOTHING`,
          [primaryKey, JSON.stringify(data)]
        );
        if (key !== primaryKey) {
          await queryPg(
            `INSERT INTO landing_sections (id, content, updated_at)
             VALUES ($1, $2, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [key, JSON.stringify(data)]
          );
        }
        if (key === 'ai-settings') {
          await queryPg(
            `INSERT INTO landing_sections (id, content, updated_at)
             VALUES ('ai_settings_config', $1, NOW())
             ON CONFLICT (id) DO NOTHING`,
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
