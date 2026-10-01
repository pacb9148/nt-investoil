import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { hasPostgresDb, queryPg } from '@/lib/db/pg-client';
import type { Post, Category, MediaItem, ContactLead, TeamMember, BackofficeUser, CompanyRating } from '@/types';
import { BLOG_POSTS, BLOG_CATEGORIES } from '@/lib/constants/blog-data';
import { TEAM_MEMBERS } from '@/lib/constants/investoil';

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
  const fallback = fs.existsSync(path.join(process.cwd(), 'nextjs-opc-webapp'))
    ? path.join(process.cwd(), 'nextjs-opc-webapp', 'src', 'data')
    : path.join(process.cwd(), 'src', 'data');
  try {
    fs.mkdirSync(fallback, { recursive: true });
  } catch {}
  return fallback;
}

const DATA_DIR = resolveDataDir();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Con PostgreSQL configurado la base es la única fuente de verdad: los JSON de src/data solo
// sirven de respaldo cuando no hay base (desarrollo local). Leerlos en producción resucita
// contenido borrado (fotos, posts, medios «fantasma»).
export function readJsonFile<T>(filename: string, defaultData: T): T {
  if (hasPostgresDb()) {
    return (Array.isArray(defaultData) ? [] : defaultData) as T;
  }
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
    // Si no existe, crear con defaultData
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  } catch (error) {
    console.error(`Error al leer archivo de base de datos ${filename}:`, error);
    return defaultData;
  }
}

export function writeJsonFile<T>(filename: string, data: T): void {
  if (hasPostgresDb()) return;
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error al escribir archivo de base de datos ${filename}:`, error);
  }
}

// Media inicial por defecto
const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'm-1',
    filename: 'oil-drop-logo.png',
    url: '/images/branding/oil-drop-logo.png',
    type: 'image',
    mime_type: 'image/png',
    size: 167738,
    alt_text: 'Logotipo Oficial Gota de Petróleo Invest Oil LLC',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-3',
    filename: 'pet-coke-terminal.jpg',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 420000,
    alt_text: 'Terminal de carga de Pet Coke',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-4',
    filename: 'oil-tanker-vessel.jpg',
    url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 680000,
    alt_text: 'Buque petrolero VLCC en alta mar',
    created_at: new Date().toISOString(),
  },
  {
    id: 'm-5',
    filename: 'refinery-complex.jpg',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80',
    type: 'image',
    mime_type: 'image/jpeg',
    size: 510000,
    alt_text: 'Complejo de refinación petroquímica',
    created_at: new Date().toISOString(),
  },
];

// ==========================================
// 1. POSTS (Artículos del Blog & Análisis)
// ==========================================
// La migración a PostgreSQL nunca llegó a ejecutarse sola y la de `posts` falló en el primer arranque:
// el blog vivía del JSON. Una vez por proceso se comprueba si los artículos de partida se sembraron
// (marca `posts_seed_v1`); si no, se siembran. Con la marca puesta, vaciar el blog a propósito se respeta.
let postsSeedChecked = false;
async function ensurePostsSeededOnce(): Promise<void> {
  if (postsSeedChecked || !hasPostgresDb()) return;
  postsSeedChecked = true;
  try {
    const flag = await queryPg("SELECT 1 FROM landing_sections WHERE id = 'posts_seed_v2'");
    if (!flag || flag.rows.length > 0) return;

    // Se insertan los que falten (los existentes y los conflictos de slug se respetan): la v1 solo sembraba con
    // la tabla vacía y dejaba fuera los artículos de partida en cuanto alguien creaba uno nuevo.
    const { seedPostsFromJson } = await import('@/lib/db/migration-service');
    const { count: seeded, failed } = await seedPostsFromJson();
    console.log(`[db-service] Artículos sembrados desde posts.json: ${seeded}${failed.length ? `, fallidos: ${failed.join(', ')}` : ''}`);
    if (seeded === 0 && failed.length > 0) return; // sin marca: se reintentará en el próximo arranque
    await queryPg(
      `INSERT INTO landing_sections (id, content, updated_at) VALUES ('posts_seed_v2', '{"done":true}'::jsonb, NOW())
       ON CONFLICT (id) DO NOTHING`
    );
  } catch (err) {
    postsSeedChecked = false;
    console.error('[db-service] Error comprobando la siembra de artículos:', err);
  }
}

export async function getPosts(options?: {
  status?: string;
  search?: string;
  categorySlug?: string;
  limit?: number;
}): Promise<Post[]> {
  let posts: Post[] = [];

  if (hasPostgresDb()) {
    try {
      await ensurePostsSeededOnce();
      // Por fecha de PUBLICACIÓN (no de creación en la base): un artículo redactado hoy con fecha
      // histórica de enero debe listarse por esa fecha, no por cuándo se guardó en la base de datos.
      const res = await queryPg('SELECT * FROM posts ORDER BY COALESCE(published_at, created_at) DESC');
      if (!res) {
        // Antes esto caía en silencio a «sin artículos»: el blog aparecía vacío sin explicación.
        throw new Error('No se pudo leer la tabla de artículos en PostgreSQL (revisa los logs del servidor).');
      }
      if (res.rows) {
        // El contenido puede ser un documento Tiptap (objeto) o HTML guardado como cadena (noticias del radar):
        // JSON.parse sobre el HTML lanzaba y hacía desaparecer TODOS los artículos.
        const parseContent = (c: unknown) => {
          if (typeof c !== 'string') return c;
          try {
            return JSON.parse(c);
          } catch {
            return c;
          }
        };
        posts = res.rows.map((r: any) => ({
          ...r,
          content: parseContent(r.content),
          tags: r.tags || [],
        })) as Post[];

        // Si la base de datos respondió, es la única fuente de verdad
        let filtered = posts;
        if (options?.status && options.status !== 'all') {
          filtered = filtered.filter((p) => p.status === options.status);
        }
        if (options?.search) {
          const q = options.search.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
              p.tags?.some((t) => t.toLowerCase().includes(q))
          );
        }
        if (options?.categorySlug) {
          filtered = filtered.filter((p) =>
            p.category === options.categorySlug || p.categories?.some((c) => c.slug === options.categorySlug)
          );
        }
        if (options?.limit && filtered.length > options.limit) {
          filtered = filtered.slice(0, options.limit);
        }
        return filtered;
      }
    } catch (err) {
      console.error('[db-service] getPosts falló:', err);
      throw err;
    }
  }

  if (posts.length === 0 && isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      let query = supabase.from('posts').select('*, categories(*)').order('created_at', { ascending: false });

      if (options?.status && options.status !== 'all') {
        query = query.eq('status', options.status);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        posts = data as Post[];
        return posts;
      }
    } catch {
      // Fallback local
    }
  }

  // Fallback a JSON solo si no hay conexión a PostgreSQL ni Supabase
  posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  posts = [...posts].sort(
    (a, b) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime()
  );

  // Filtrado en memoria
  if (options?.status && options.status !== 'all') {
    posts = posts.filter((p) => p.status === options.status);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (options?.categorySlug) {
    posts = posts.filter((p) =>
      p.categories?.some((c) => c.slug === options.categorySlug)
    );
  }

  if (options?.limit && posts.length > options.limit) {
    posts = posts.slice(0, options.limit);
  }

  return posts;
}

export async function getPostById(id: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.id === id) || null;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export async function savePost(postData: Partial<Post>): Promise<Post> {
  // Obtener posts vigentes de la base de datos real
  const posts = await getPosts();
  const now = new Date().toISOString();
  const allCategories = await getCategories();

  // Resolución y validación estricta de categoría
  let targetCategoryId = postData.category_id || postData.categories?.[0]?.id || null;
  let targetCategoryName =
    typeof postData.category === 'string'
      ? postData.category
      : (postData.category as any)?.name || postData.categories?.[0]?.name || null;

  let matchedCategory: Category | null = null;
  if (targetCategoryId) {
    matchedCategory = allCategories.find((c) => c.id === targetCategoryId) || null;
  }
  if (!matchedCategory && targetCategoryName) {
    matchedCategory =
      allCategories.find(
        (c) => c.name.toLowerCase() === targetCategoryName!.toLowerCase() || c.slug === targetCategoryName!.toLowerCase()
      ) || null;
  }

  // Si se asignó un identificador de categoría pero no existe en el catálogo de BD
  if ((targetCategoryId || targetCategoryName) && !matchedCategory) {
    throw new Error('La categoría seleccionada no existe en la base de datos.');
  }

  const finalStatus = postData.status || 'draft';

  // No se puede publicar un artículo sin categoría (requisito imprescindible)
  if (finalStatus === 'published' && !matchedCategory) {
    throw new Error('Es imprescindible asignar una categoría válida antes de publicar el artículo.');
  }

  const categoryList: Category[] = matchedCategory ? [matchedCategory] : [];

  let targetPost: Post;

  if (postData.id) {
    // Actualizar post existente
    const index = posts.findIndex((p) => p.id === postData.id);
    if (index !== -1) {
      const existing = posts[index];
      // Si el post existente ya tenía categoría y no se pasó una nueva, mantenerla
      const effectiveCategory = matchedCategory || (existing.category_id ? allCategories.find((c) => c.id === existing.category_id) : null);
      if (finalStatus === 'published' && !effectiveCategory) {
        throw new Error('Es imprescindible asignar una categoría válida antes de publicar el artículo.');
      }

      targetPost = {
        ...existing,
        ...postData,
        status: finalStatus,
        category_id: effectiveCategory ? effectiveCategory.id : null,
        category: effectiveCategory ? effectiveCategory.name : null,
        categories: effectiveCategory ? [effectiveCategory] : [],
        views: postData.views !== undefined ? Number(postData.views) : (existing.views ?? 0),
        likes: postData.likes !== undefined ? Number(postData.likes) : (existing.likes ?? 0),
        published_at: finalStatus === 'published' ? (postData.published_at || existing.published_at || now) : null,
        updated_at: now,
      };
      posts[index] = targetPost;
    } else {
      targetPost = {
        id: postData.id,
        slug: postData.slug || `post-${Date.now()}`,
        title: postData.title || 'Sin título',
        excerpt: postData.excerpt || '',
        content: postData.content || null,
        status: finalStatus,
        category_id: matchedCategory ? matchedCategory.id : null,
        category: matchedCategory ? matchedCategory.name : null,
        categories: categoryList,
        featured_image_url: postData.featured_image_url || null,
        video_url: postData.video_url || null,
        tags: postData.tags || [],
        reading_time: postData.reading_time || 3,
        views: postData.views !== undefined ? Number(postData.views) : 0,
        likes: postData.likes !== undefined ? Number(postData.likes) : 0,
        is_republished: postData.is_republished || false,
        original_source_url: postData.original_source_url || null,
        original_source_name: postData.original_source_name || null,
        created_at: postData.created_at || now,
        updated_at: now,
        published_at: finalStatus === 'published' ? (postData.published_at || now) : null,
      };
      posts.unshift(targetPost);
    }
  } else {
    // Crear nuevo post
    targetPost = {
      id: `p-${Date.now()}`,
      slug: postData.slug || `post-${Date.now()}`,
      title: postData.title || 'Sin título',
      excerpt: postData.excerpt || '',
      content: postData.content || null,
      status: finalStatus,
      category_id: matchedCategory ? matchedCategory.id : null,
      category: matchedCategory ? matchedCategory.name : null,
      categories: categoryList,
      featured_image_url: postData.featured_image_url || null,
      video_url: postData.video_url || null,
      tags: postData.tags || [],
      reading_time: postData.reading_time || 3,
      views: postData.views !== undefined ? Number(postData.views) : 0,
      likes: postData.likes !== undefined ? Number(postData.likes) : 0,
      is_republished: postData.is_republished || false,
      original_source_url: postData.original_source_url || null,
      original_source_name: postData.original_source_name || null,
      created_at: postData.created_at || now,
      updated_at: now,
      published_at: finalStatus === 'published' ? (postData.published_at || now) : null,
    };
    posts.unshift(targetPost);
  }

  writeJsonFile('posts.json', posts);

  // Sincronizar en PostgreSQL si DATABASE_URL está presente
  if (hasPostgresDb()) {
    try {
      const saved = await queryPg(
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
          targetPost.id,
          targetPost.slug,
          targetPost.title,
          targetPost.excerpt,
          targetPost.content ? JSON.stringify(targetPost.content) : null,
          targetPost.status,
          targetPost.category_id,
          targetPost.category,
          targetPost.featured_image_url,
          targetPost.video_url,
          targetPost.tags,
          targetPost.reading_time,
          targetPost.views,
          targetPost.likes || 0,
          targetPost.is_republished,
          targetPost.original_source_url,
          targetPost.original_source_name,
          targetPost.published_at,
        ]
      );
      if (!saved) throw new Error('PostgreSQL rechazó el guardado del artículo (revisa los logs del servidor).');
    } catch (pgErr) {
      console.error('Sync post to PostgreSQL failed:', pgErr);
      // Sin esto el editor decía «publicado» y el artículo nunca llegaba a la base.
      throw pgErr instanceof Error ? pgErr : new Error(String(pgErr));
    }
  }

  // Sincronizar en Supabase si está disponible
  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('posts').upsert({
        id: targetPost.id,
        slug: targetPost.slug,
        title: targetPost.title,
        excerpt: targetPost.excerpt,
        content: targetPost.content,
        status: targetPost.status,
        category_id: targetPost.category_id,
        category: targetPost.category,
        featured_image_url: targetPost.featured_image_url,
        video_url: targetPost.video_url,
        tags: targetPost.tags,
        reading_time: targetPost.reading_time,
        views: targetPost.views,
        is_republished: targetPost.is_republished,
        original_source_url: targetPost.original_source_url,
        original_source_name: targetPost.original_source_name,
        published_at: targetPost.published_at,
        updated_at: targetPost.updated_at,
      });
    } catch (err) {
      console.warn('Sync post to Supabase failed, kept locally:', err);
    }
  }

  return targetPost;
}

export async function deletePost(id: string): Promise<boolean> {
  if (hasPostgresDb()) {
    try {
      await queryPg('DELETE FROM posts WHERE id = $1', [id]);
    } catch (err) {
      console.warn('PostgreSQL deletePost error:', err);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('posts').delete().eq('id', id);
    } catch {}
  }

  const posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  const filtered = posts.filter((p) => p.id !== id);
  writeJsonFile('posts.json', filtered);

  return true;
}

// ==========================================
// 2. CATEGORÍAS (CRUD en Base de Datos & Local)
// ==========================================
export async function getCategories(): Promise<Category[]> {
  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM categories ORDER BY name ASC');
      if (res && res.rows && res.rows.length > 0) {
        return res.rows.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          name_en: item.name_en,
          description_en: item.description_en,
          color: item.color,
          created_at: item.created_at,
        }));
      }
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          name_en: item.name_en,
          description_en: item.description_en,
          color: item.color,
          created_at: item.created_at,
        }));
      }
    } catch {}
  }

  return readJsonFile<Category[]>('categories.json', BLOG_CATEGORIES);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.id === id) || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) || null;
}

export async function saveCategory(catData: Partial<Category>): Promise<Category> {
  if (!catData.name || !catData.name.trim()) {
    throw new Error('El nombre de la categoría es obligatorio.');
  }

  const categories = await getCategories();
  const cleanName = catData.name.trim();
  const cleanSlug = (catData.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

  // Comprobar si ya existe con ese slug o id
  const existingIndex = categories.findIndex(
    (c) => (catData.id && c.id === catData.id) || c.slug === cleanSlug
  );

  let targetCat: Category;
  if (existingIndex !== -1) {
    targetCat = {
      ...categories[existingIndex],
      ...catData,
      name: cleanName,
      slug: cleanSlug,
    };
    categories[existingIndex] = targetCat;
  } else {
    targetCat = {
      id: catData.id || `cat-${Date.now().toString(36)}`,
      name: cleanName,
      slug: cleanSlug,
      description: catData.description || '',
      name_en: catData.name_en || cleanName,
      description_en: catData.description_en || '',
      color: catData.color || '#f59e0b',
      created_at: new Date().toISOString(),
    };
    categories.push(targetCat);
  }

  writeJsonFile('categories.json', categories);

  if (hasPostgresDb()) {
    try {
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
        [targetCat.id, targetCat.name, targetCat.slug, targetCat.description, targetCat.name_en, targetCat.description_en, targetCat.color]
      );
    } catch (e) {
      console.warn('[db-service] PostgreSQL saveCategory fallback:', e);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('categories').upsert({
        id: targetCat.id,
        name: targetCat.name,
        slug: targetCat.slug,
        description: targetCat.description,
        name_en: targetCat.name_en,
        color: targetCat.color,
      });
    } catch (e) {
      console.warn('[db-service] Supabase saveCategory fallback:', e);
    }
  }

  return targetCat;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const categories = await getCategories();
  const target = categories.find((c) => c.id === id);
  if (!target) return false;

  // Validar que ningún post tenga esta categoría asignada
  const posts = readJsonFile<Post[]>('posts.json', BLOG_POSTS);
  const isInUse = posts.some(
    (p) => p.category_id === id || p.category === target.name || p.categories?.some((c) => c.id === id)
  );

  if (isInUse) {
    throw new Error(`No es posible eliminar la categoría "${target.name}" porque existen artículos asignados a ella. Reasigna los artículos antes de eliminarla.`);
  }

  const filtered = categories.filter((c) => c.id !== id);
  writeJsonFile('categories.json', filtered);

  if (hasPostgresDb()) {
    try {
      await queryPg('DELETE FROM categories WHERE id = $1', [id]);
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
  }

  return true;
}

// ==========================================
// 3. MEDIA (Imágenes, Videos y Archivos)
// ==========================================
export async function getMediaList(search?: string): Promise<MediaItem[]> {
  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM media ORDER BY created_at DESC');
      if (res && res.rows) {
        // La base de datos es la única fuente de verdad: no mezclar datos viejos de media.json
        if (res.rows.length > 0) {
          let list: MediaItem[] = res.rows.map((item: any) => ({
            id: item.id || `m-${Date.now()}`,
            filename: item.filename,
            url: item.url,
            type: item.type,
            mime_type: item.mime_type,
            size: item.size ? Number(item.size) : null,
            alt_text: item.alt_text,
            created_at: item.created_at,
          }));
          if (search) {
            const q = search.toLowerCase();
            list = list.filter(
              (m) =>
                m.filename.toLowerCase().includes(q) ||
                (m.alt_text && m.alt_text.toLowerCase().includes(q))
            );
          }
          return list;
        }
      }
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL getMediaList error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        let list: MediaItem[] = data.map((item: any) => ({
          id: item.id || `m-${Date.now()}`,
          filename: item.filename,
          url: item.url,
          type: item.type,
          mime_type: item.mime_type,
          size: item.size ? Number(item.size) : null,
          alt_text: item.alt_text,
          created_at: item.created_at,
        }));
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(
            (m) =>
              m.filename.toLowerCase().includes(q) ||
              (m.alt_text && m.alt_text.toLowerCase().includes(q))
          );
        }
        return list;
      }
    } catch {}
  }

  // Fallback a JSON solo si la base de datos no está disponible
  let media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);
  if (search) {
    const q = search.toLowerCase();
    media = media.filter(
      (m) =>
        m.filename.toLowerCase().includes(q) ||
        (m.alt_text && m.alt_text.toLowerCase().includes(q))
    );
  }

  return media;
}

export async function saveMediaItem(item: Partial<MediaItem>): Promise<MediaItem> {
  const media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);
  const now = new Date().toISOString();

  const newItem: MediaItem = {
    id: item.id || `m-${Date.now()}`,
    filename: item.filename || 'archivo-sin-nombre',
    url: item.url || '',
    type: item.type || (item.url?.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image'),
    mime_type: item.mime_type || null,
    size: item.size || null,
    alt_text: item.alt_text || item.filename || 'Archivo Invest Oil',
    created_at: now,
  };

  const existingIdx = media.findIndex((m) => m.id === newItem.id || m.url === newItem.url);
  if (existingIdx !== -1) {
    media[existingIdx] = { ...media[existingIdx], ...newItem };
  } else {
    media.unshift(newItem);
  }

  writeJsonFile('media.json', media);

  if (hasPostgresDb()) {
    try {
      await queryPg(
        `INSERT INTO media (id, filename, url, type, mime_type, size, alt_text, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (id) DO UPDATE SET
           filename = EXCLUDED.filename,
           url = EXCLUDED.url,
           type = EXCLUDED.type,
           mime_type = EXCLUDED.mime_type,
           size = EXCLUDED.size,
           alt_text = EXCLUDED.alt_text`,
        [newItem.id, newItem.filename, newItem.url, newItem.type, newItem.mime_type, newItem.size, newItem.alt_text]
      );
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL saveMediaItem error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('media').upsert({
        filename: newItem.filename,
        url: newItem.url,
        type: newItem.type,
        mime_type: newItem.mime_type,
        size: newItem.size,
        alt_text: newItem.alt_text,
      });
    } catch {}
  }

  return newItem;
}

export async function deleteMediaItem(idOrIdentifier: string): Promise<boolean> {
  const cleanId = decodeURIComponent(idOrIdentifier).trim();
  const media = readJsonFile<MediaItem[]>('media.json', DEFAULT_MEDIA);
  
  // Recopilar todos los identificadores, nombres y URLs asociados
  const targetIds = new Set<string>([cleanId]);
  const targetFilenames = new Set<string>([path.basename(cleanId.split('?')[0])]);
  const targetUrls = new Set<string>([cleanId]);

  // Si cleanId parece una URL completa o relativa
  if (cleanId.startsWith('/') || cleanId.startsWith('http')) {
    targetUrls.add(cleanId);
    targetFilenames.add(path.basename(cleanId.split('?')[0]));
  }

  // 1. Consultar en PostgreSQL para obtener nombres reales y URLs de ambas tablas
  if (hasPostgresDb()) {
    try {
      const res = await queryPg(
        `SELECT id, filename, url FROM media 
         WHERE id = $1 OR url = $1 OR filename = $1 OR url LIKE '%' || $1
         UNION 
         SELECT id, filename, NULL as url FROM media_files 
         WHERE id = $1 OR filename = $1 OR filename LIKE '%' || $1`,
        [cleanId]
      );
      if (res && res.rows) {
        for (const row of res.rows) {
          if (row.id) targetIds.add(row.id);
          // `media.filename` guarda el nombre original (sin marca de tiempo) y lo comparten varias
          // subidas: usarlo borraría archivos ajenos. Se identifica el archivo por el de su URL.
          if (row.url) {
            targetUrls.add(row.url);
            targetFilenames.add(path.basename(String(row.url).split('?')[0]));
          } else if (row.filename) {
            targetFilenames.add(row.filename);
          }
        }
      }
    } catch (e) {
      console.warn('[db-service] Error querying media before delete:', e);
    }
  }

  // 2. Borrar físicamente del disco todos los nombres identificados
  for (const filename of Array.from(targetFilenames)) {
    if (!filename || filename.includes('..') || filename === '.' || filename === '/') continue;
    const candidates = [
      path.join(process.cwd(), 'public', 'uploads', filename),
      path.join(process.cwd(), 'nextjs-opc-webapp', 'public', 'uploads', filename),
    ];
    for (const filePath of candidates) {
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.warn(`[db-service] No se pudo borrar archivo físico en ${filePath}:`, err);
      }
    }
  }

  // 3. Borrar de media.json
  const filtered = media.filter(
    (m) =>
      !targetIds.has(m.id) &&
      !targetUrls.has(m.url) &&
      !targetFilenames.has(m.filename) &&
      !Array.from(targetFilenames).some((fn) => m.url.endsWith(`/${fn}`))
  );
  writeJsonFile('media.json', filtered);

  // 4. Borrar de PostgreSQL en ambas tablas
  if (hasPostgresDb()) {
    try {
      const idsArr = Array.from(targetIds);
      const urlsArr = Array.from(targetUrls);
      const fnArr = Array.from(targetFilenames);

      await queryPg(
        `DELETE FROM media 
         WHERE id = ANY($1::text[]) 
            OR url = ANY($2::text[]) 
            OR filename = ANY($3::text[])`,
        [idsArr, urlsArr, fnArr]
      );

      await queryPg(
        `DELETE FROM media_files 
         WHERE id = ANY($1::text[]) 
            OR filename = ANY($2::text[])`,
        [idsArr, fnArr]
      );
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL deleteMediaItem error:', pgErr);
    }
  }

  // 5. Borrar de Supabase
  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      for (const id of Array.from(targetIds)) {
        await supabase.from('media').delete().eq('id', id);
        await supabase.from('media_files').delete().eq('id', id);
      }
      for (const fn of Array.from(targetFilenames)) {
        await supabase.from('media').delete().eq('filename', fn);
        await supabase.from('media_files').delete().eq('filename', fn);
      }
    } catch {}
  }

  // 6. Limpiar la referencia en las secciones de la landing (Hero, Cabecera, Servicios, etc.):
  // borrar el archivo aquí NO tocaba antes lo que ya tenían guardado esos formularios, así que un
  // video o imagen borrado seguía "configurado" (y a veces seguía cargando desde caché) hasta que
  // alguien lo quitaba a mano en el admin correspondiente.
  await clearMediaReferencesInSections(targetUrls, targetFilenames);

  return true;
}

/**
 * Recorre todo el contenido guardado en `landing_sections` (Hero, Cabecera, Retos, Servicios,
 * Actualidad, Productos, Operaciones, Equipo, Testimonios, FAQ...) y vacía cualquier campo de texto
 * que apunte exactamente al archivo borrado, sin necesidad de conocer de antemano el nombre del
 * campo en cada sección.
 */
async function clearMediaReferencesInSections(targetUrls: Set<string>, targetFilenames: Set<string>): Promise<void> {
  if (!hasPostgresDb()) return;
  if (targetUrls.size === 0 && targetFilenames.size === 0) return;

  const matchesTarget = (value: string): boolean => {
    if (targetUrls.has(value)) return true;
    const base = path.basename(value.split('?')[0]);
    return targetFilenames.has(base);
  };

  const scrub = (value: unknown): { value: unknown; changed: boolean } => {
    if (typeof value === 'string') {
      return matchesTarget(value) ? { value: '', changed: true } : { value, changed: false };
    }
    if (Array.isArray(value)) {
      let changed = false;
      const next = value.map((item) => {
        const r = scrub(item);
        if (r.changed) changed = true;
        return r.value;
      });
      return { value: next, changed };
    }
    if (value && typeof value === 'object') {
      let changed = false;
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const r = scrub(v);
        if (r.changed) changed = true;
        next[k] = r.value;
      }
      return { value: next, changed };
    }
    return { value, changed: false };
  };

  try {
    const res = await queryPg('SELECT id, content FROM landing_sections');
    if (!res) return;
    for (const row of res.rows) {
      const { value, changed } = scrub(row.content);
      if (!changed) continue;
      await queryPg(
        `UPDATE landing_sections SET content = $2, updated_at = NOW() WHERE id = $1`,
        [row.id, JSON.stringify(value)]
      );
    }
  } catch (e) {
    console.warn('[db-service] Error limpiando referencias de medios en landing_sections:', e);
  }
}

export interface DomainFixSummary {
  scanned: number;
  updated: number;
  updatedSectionIds: string[];
}

/**
 * Corrige un dominio ya guardado en producción (p. ej. tras migrar de investoil.es a investoil.us):
 * cambiar solo el valor por defecto en el código no toca lo que un admin ya guardó desde los
 * formularios — esa es la brecha real que dejaba el dominio viejo visible en el sitio en vivo pese a
 * haber actualizado el código. Recorre TODO el contenido de `landing_sections` (Hero, Cabecera, SEO,
 * Pie de página, prompt de Oli, Retos, Servicios, Actualidad, Productos, Equipo, Testimonios, FAQ...)
 * y sustituye el dominio antiguo por el nuevo en cualquier campo de texto, sin necesitar conocer de
 * antemano en qué sección o campo vive cada URL o correo.
 */
/**
 * Recorre TODO el contenido de `landing_sections` aplicando `fixText` a cada campo de texto, sin
 * necesitar conocer de antemano en qué sección o campo vive el valor a corregir. Base compartida por
 * `fixDomainInStoredSections` y `fixEmailAliasInStoredSections`: ambas son el mismo problema (un
 * literal ya guardado en producción que el cambio de un valor por defecto en el código no toca).
 */
async function scrubStoredSectionsText(
  fixText: (text: string) => { value: string; changed: boolean }
): Promise<DomainFixSummary> {
  const summary: DomainFixSummary = { scanned: 0, updated: 0, updatedSectionIds: [] };
  if (!hasPostgresDb()) return summary;

  const scrub = (value: unknown): { value: unknown; changed: boolean } => {
    if (typeof value === 'string') {
      return fixText(value);
    }
    if (Array.isArray(value)) {
      let changed = false;
      const next = value.map((item) => {
        const r = scrub(item);
        if (r.changed) changed = true;
        return r.value;
      });
      return { value: next, changed };
    }
    if (value && typeof value === 'object') {
      let changed = false;
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const r = scrub(v);
        if (r.changed) changed = true;
        next[k] = r.value;
      }
      return { value: next, changed };
    }
    return { value, changed: false };
  };

  const res = await queryPg('SELECT id, content FROM landing_sections');
  if (!res) {
    throw new Error('No se pudo leer landing_sections en PostgreSQL.');
  }

  for (const row of res.rows) {
    summary.scanned += 1;
    const { value, changed } = scrub(row.content);
    if (!changed) continue;
    const saved = await queryPg(
      `UPDATE landing_sections SET content = $2, updated_at = NOW() WHERE id = $1`,
      [row.id, JSON.stringify(value)]
    );
    if (!saved) {
      throw new Error(`No se pudo actualizar la sección «${row.id}».`);
    }
    summary.updated += 1;
    summary.updatedSectionIds.push(row.id);
  }

  return summary;
}

export async function fixDomainInStoredSections(oldDomain: string, newDomain: string): Promise<DomainFixSummary> {
  const escapedOld = oldDomain.replace(/\./g, '\\.');
  // Alias ya retirados en una migración anterior (Fase 21): a diferencia de las comparaciones en el
  // código fuente (que SÍ necesitan el literal antiguo para reconocer datos viejos), lo que esté
  // guardado como contenido real con uno de estos alias no debe quedarse igual con solo el dominio
  // cambiado — hay que llevarlo al canal vigente correspondiente. La primera versión de esta función
  // los dejaba intactos por error, y así se coló «trading@investoil.es» en una respuesta de Oli.
  const retiredAliases: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: new RegExp(`contacto@${escapedOld}`, 'gi'), replacement: `info@${newDomain}` },
    { pattern: new RegExp(`trading@${escapedOld}`, 'gi'), replacement: `business@${newDomain}` },
  ];
  const domainPattern = new RegExp(escapedOld, 'gi');

  const fixText = (text: string): { value: string; changed: boolean } => {
    let out = text;
    let changed = false;
    for (const { pattern, replacement } of retiredAliases) {
      if (pattern.test(out)) {
        pattern.lastIndex = 0;
        out = out.replace(pattern, replacement);
        changed = true;
      }
    }
    if (domainPattern.test(out)) {
      domainPattern.lastIndex = 0;
      out = out.replace(domainPattern, newDomain);
      changed = true;
    }
    return { value: out, changed };
  };

  return scrubStoredSectionsText(fixText);
}

/**
 * Corrige un alias de correo ya retirado pero todavía guardado en producción (p. ej. tras unificar
 * info@investoil.us en business@investoil.us): igual que con el dominio, cambiar solo el valor por
 * defecto en el código no toca lo que un admin ya guardó, ni el texto que ese correo dejó escrito
 * dentro de otros campos (FAQs entrenadas, páginas legales, prompt de Oli...).
 */
export async function fixEmailAliasInStoredSections(oldEmail: string, newEmail: string): Promise<DomainFixSummary> {
  const escapedOld = oldEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(escapedOld, 'gi');

  const fixText = (text: string): { value: string; changed: boolean } => {
    if (!pattern.test(text)) return { value: text, changed: false };
    pattern.lastIndex = 0;
    return { value: text.replace(pattern, newEmail), changed: true };
  };

  return scrubStoredSectionsText(fixText);
}

// Tablas de contenido que pueden apuntar a un archivo de la biblioteca (lista fija: nunca viene del cliente).
const MEDIA_REFERENCE_TABLES: Array<{ table: string; label: string }> = [
  { table: 'landing_hero', label: 'Hero principal' },
  { table: 'landing_header', label: 'Cabecera y menú' },
  { table: 'landing_about', label: 'Página Nosotros' },
  { table: 'landing_footer', label: 'Pie de página' },
  { table: 'landing_seo', label: 'SEO / Open Graph' },
  { table: 'landing_team', label: 'Equipo directivo' },
  { table: 'landing_testimonials', label: 'Testimonios' },
  { table: 'landing_products', label: 'Productos' },
  { table: 'landing_services', label: 'Servicios' },
  { table: 'landing_operations', label: 'Operaciones' },
  { table: 'landing_sections', label: 'Secciones de la landing' },
  { table: 'posts', label: 'Entradas del blog' },
];

/** Secciones/páginas donde se usa un archivo; sirve para avisar antes de borrarlo. */
export async function findMediaUsage(urlOrFilename: string): Promise<string[]> {
  if (!hasPostgresDb()) return [];
  const needle = path.basename(decodeURIComponent(urlOrFilename).split('?')[0]);
  if (!needle) return [];

  const used: string[] = [];
  for (const { table, label } of MEDIA_REFERENCE_TABLES) {
    try {
      const res = await queryPg(
        `SELECT 1 FROM ${table} t WHERE position($1 in t::text) > 0 LIMIT 1`,
        [needle]
      );
      if (res && res.rows.length > 0) used.push(label);
    } catch {
      // Una tabla ausente no debe impedir avisar de las demás.
    }
  }
  return used;
}

// ==========================================
// 4. EQUIPO DIRECTIVO (Consejo & Management)
// ==========================================
export async function getTeamMembers(): Promise<TeamMember[]> {
  if (hasPostgresDb()) {
    try {
      const res = await queryPg('SELECT * FROM landing_team ORDER BY sort_order ASC');
      if (res && res.rows) {
        if (res.rows.length > 0) {
          return res.rows.map((r: any) => ({
            id: r.id,
            number: r.number || undefined,
            name: r.name,
            role: r.role,
            role_en: r.role_en || r.role,
            location: r.location || undefined,
            image: r.image || r.photo_url || undefined,
            photo_url: r.photo_url || r.image || undefined,
            bio: r.bio || '',
            bio_en: r.bio_en || r.bio || '',
            linkedin_url: r.linkedin_url || undefined,
            sort_order: r.sort_order || 0,
            is_active: r.is_active !== false,
          }));
        }

        // Si la tabla existe pero está vacía, verificar si el sitio ya fue inicializado
        const checkInit = await queryPg('SELECT COUNT(*) as count FROM landing_sections');
        const isInit = parseInt(checkInit?.rows[0]?.count || '0', 10) > 0;
        if (isInit) {
          // La base de datos es la única fuente de verdad: devolver array vacío real sin revivir el JSON
          return [];
        }
      }
    } catch (pgErr) {
      console.warn('[db-service] PostgreSQL getTeamMembers error:', pgErr);
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('landing_team')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((r: any) => ({
          ...r,
          image: r.image || r.photo_url || '',
          photo_url: r.photo_url || r.image || '',
        })) as TeamMember[];
      }
    } catch {}
  }

  // Fallback a JSON solo si la base de datos no está disponible
  return readJsonFile<TeamMember[]>('team.json', TEAM_MEMBERS);
}

export async function saveTeamMembers(members: TeamMember[]): Promise<TeamMember[]> {
  const sanitizedMembers: TeamMember[] = members.map((m, i) => {
    const effectiveImg = typeof m.image === 'string' ? m.image.trim() : (typeof m.photo_url === 'string' ? m.photo_url.trim() : '');
    return {
      ...m,
      id: m.id || `tm-${i + 1}`,
      image: effectiveImg,
      photo_url: effectiveImg,
      sort_order: i,
      is_active: m.is_active !== false,
    };
  });

  // Sincronizar archivo JSON local de respaldo con exactamente la misma lista depurada
  writeJsonFile('team.json', sanitizedMembers);

  if (hasPostgresDb()) {
    try {
      const currentIds = sanitizedMembers.map((m) => m.id);

      // 1. Eliminar de la base de datos todos los directivos que fueron removidos en la interfaz
      if (currentIds.length > 0) {
        const placeholders = currentIds.map((_, i) => `$${i + 1}`).join(', ');
        await queryPg(`DELETE FROM landing_team WHERE id NOT IN (${placeholders})`, currentIds);
      } else {
        await queryPg('DELETE FROM landing_team');
      }

      // 2. Insertar o actualizar los miembros vigentes preservando su nuevo orden exacto (sort_order)
      for (let i = 0; i < sanitizedMembers.length; i++) {
        const m = sanitizedMembers[i];
        const effectiveImg = m.image || null;

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
            m.id,
            m.number || null,
            m.name,
            m.role,
            m.role_en || m.role,
            m.location || null,
            effectiveImg,
            effectiveImg,
            m.bio || '',
            m.bio_en || m.bio || '',
            m.linkedin_url || null,
            i,
            m.is_active !== false,
          ]
        );
      }
    } catch (pgErr) {
      console.error('[db-service] PostgreSQL saveTeamMembers error:', pgErr);
      // Sin esto el admin veía «guardado» mientras la web pública seguía leyendo la fila vieja.
      throw new Error(
        `No se pudo guardar el equipo en la base de datos: ${pgErr instanceof Error ? pgErr.message : String(pgErr)}`
      );
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const currentIds = sanitizedMembers.map((m) => m.id);

      if (currentIds.length > 0) {
        await supabase.from('landing_team').delete().not('id', 'in', `(${currentIds.join(',')})`);
      } else {
        await supabase.from('landing_team').delete().neq('id', 'all_empty');
      }

      for (let i = 0; i < sanitizedMembers.length; i++) {
        const m = sanitizedMembers[i];
        await supabase.from('landing_team').upsert({
          id: m.id,
          name: m.name,
          role: m.role,
          role_en: m.role_en || m.role,
          bio: m.bio || '',
          bio_en: m.bio_en || m.bio || '',
          photo_url: m.image || '',
          image: m.image || '',
          linkedin_url: m.linkedin_url || '',
          sort_order: i,
          is_active: m.is_active !== false,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('[db-service] Supabase saveTeamMembers fallback:', e);
    }
  }

  return sanitizedMembers;
}

// ==========================================
// 5. CONTACT LEADS
// ==========================================
function rowToLead(r: any): ContactLead {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject || null,
    message: r.message || '',
    status: r.status || 'new',
    source: r.source || 'web_form',
    created_at: new Date(r.created_at).toISOString(),
    updated_at: new Date(r.updated_at || r.created_at).toISOString(),
  };
}

export async function getLeads(): Promise<ContactLead[]> {
  if (hasPostgresDb()) {
    const res = await queryPg('SELECT * FROM leads ORDER BY created_at DESC');
    if (!res) {
      throw new Error('No se pudo leer la tabla de leads en PostgreSQL.');
    }
    return res.rows.map(rowToLead);
  }
  return getLeadsFromJson();
}

function getLeadsFromJson(): ContactLead[] {
  return readJsonFile<ContactLead[]>('leads.json', [
    {
      id: 'l-01',
      name: 'PetroAsia Trading Corp',
      email: 'procurement@petroasia.sg',
      subject: 'Requerimiento de Suministro Spot Pet Coke PC-4500 (50,000 MT)',
      message: 'Solicitamos cotización CFR puerto de Qingdao para entrega durante la segunda quincena del próximo mes.',
      status: 'new',
      source: 'web_form',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'l-02',
      name: 'Iberia Bunker Services',
      email: 'bunkers@iberiabunker.es',
      subject: 'Consulta Técnica Diésel Marino MGO & EN590',
      message: 'Interesados en programación mensual de barcazas para terminal de Algeciras.',
      status: 'contacted',
      source: 'web_form',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
}

export async function saveLead(leadData: Partial<ContactLead>): Promise<ContactLead> {
  const leads = await getLeads();
  const now = new Date().toISOString();

  let targetLead: ContactLead;
  const existingIdx = leadData.id ? leads.findIndex((l) => l.id === leadData.id) : -1;

  if (existingIdx !== -1) {
    targetLead = {
      ...leads[existingIdx],
      ...leadData,
      updated_at: now,
    };
    leads[existingIdx] = targetLead;
  } else {
    targetLead = {
      id: leadData.id || `l-${Date.now()}`,
      name: leadData.name || 'Anónimo',
      email: leadData.email || 'sin-email@investoil.us',
      subject: leadData.subject || 'Consulta comercial',
      message: leadData.message || '',
      status: leadData.status || 'new',
      source: leadData.source || 'web_form',
      created_at: now,
      updated_at: now,
    };
    leads.unshift(targetLead);
  }

  if (hasPostgresDb()) {
    // Un lead perdido es un cliente perdido: si la base falla, el formulario debe enterarse.
    const saved = await queryPg(
      `INSERT INTO leads (id, name, email, subject, message, status, source, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, email = EXCLUDED.email, subject = EXCLUDED.subject,
         message = EXCLUDED.message, status = EXCLUDED.status, source = EXCLUDED.source,
         updated_at = EXCLUDED.updated_at`,
      [
        targetLead.id,
        targetLead.name,
        targetLead.email,
        targetLead.subject || null,
        targetLead.message,
        targetLead.status,
        targetLead.source || 'web_form',
        targetLead.created_at,
        targetLead.updated_at,
      ]
    );
    if (!saved) throw new Error('No se pudo guardar el lead en PostgreSQL.');
  } else {
    writeJsonFile('leads.json', leads);
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('contact_leads').upsert([{
        id: targetLead.id,
        name: targetLead.name,
        email: targetLead.email,
        subject: targetLead.subject,
        message: targetLead.message,
        status: targetLead.status,
      }]);
    } catch {}
  }

  return targetLead;
}

function rowToRating(r: any): CompanyRating {
  return {
    id: r.id,
    what_we_do: Number(r.what_we_do),
    how_we_do_it: Number(r.how_we_do_it),
    results: Number(r.results),
    comment: r.comment || null,
    name: r.name || null,
    email: r.email || null,
    lead_id: r.lead_id || null,
    created_at: new Date(r.created_at).toISOString(),
  };
}

export async function getCompanyRatings(): Promise<CompanyRating[]> {
  if (hasPostgresDb()) {
    const res = await queryPg('SELECT * FROM company_ratings ORDER BY created_at DESC');
    if (!res) {
      throw new Error('No se pudo leer la tabla de valoraciones en PostgreSQL.');
    }
    return res.rows.map(rowToRating);
  }
  return readJsonFile<CompanyRating[]>('company-ratings.json', []);
}

export async function saveCompanyRating(
  data: Pick<CompanyRating, 'what_we_do' | 'how_we_do_it' | 'results'> &
    Partial<Pick<CompanyRating, 'comment' | 'name' | 'email' | 'lead_id'>>
): Promise<CompanyRating> {
  const rating: CompanyRating = {
    id: `rt-${Date.now()}`,
    what_we_do: data.what_we_do,
    how_we_do_it: data.how_we_do_it,
    results: data.results,
    comment: data.comment || null,
    name: data.name || null,
    email: data.email || null,
    lead_id: data.lead_id || null,
    created_at: new Date().toISOString(),
  };

  if (hasPostgresDb()) {
    // Una valoración perdida es una métrica perdida: si la base falla, el pop debe enterarse.
    const saved = await queryPg(
      `INSERT INTO company_ratings (id, what_we_do, how_we_do_it, results, comment, name, email, lead_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        rating.id,
        rating.what_we_do,
        rating.how_we_do_it,
        rating.results,
        rating.comment,
        rating.name,
        rating.email,
        rating.lead_id,
        rating.created_at,
      ]
    );
    if (!saved) throw new Error('No se pudo guardar la valoración en PostgreSQL.');
  } else {
    const ratings = await getCompanyRatings();
    ratings.unshift(rating);
    writeJsonFile('company-ratings.json', ratings);
  }

  return rating;
}

// ==========================================
// 6. ESTADÍSTICAS DEL DASHBOARD
// ==========================================
export async function getDashboardStats() {
  // Un fallo en una tabla no debe tumbar todo el panel de control.
  const [posts, media, leads] = await Promise.all([
    getPosts().catch(() => [] as Post[]),
    getMediaList().catch(() => [] as MediaItem[]),
    getLeads().catch(() => [] as ContactLead[]),
  ]);

  const publishedPostsCount = posts.filter((p) => p.status === 'published').length;
  const draftPostsCount = posts.filter((p) => p.status === 'draft').length;

  return {
    postsCount: posts.length,
    publishedPostsCount,
    draftPostsCount,
    mediaCount: media.length,
    leadsCount: leads.length,
    recentPosts: posts.slice(0, 5),
    recentLeads: leads.slice(0, 5),
  };
}

// ==========================================
// 7. GESTIÓN DE USUARIOS Y ACCESOS BACKOFFICE
// ==========================================
const DEFAULT_USERS: BackofficeUser[] = [
  {
    id: 'usr-superadmin-01',
    email: 'admin@investoil.us',
    name: 'Director de Operaciones & Trading',
    role: 'superadmin',
    status: 'active',
    department: 'Dirección General & Trading',
    phone: '+34 910 000 001',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*', 'admin1234'],
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLogin: '2026-09-24T16:00:00.000Z',
  },
  {
    id: 'usr-superadmin-02',
    email: 'admin@investoil.com',
    name: 'Administrador de Trading & Operaciones',
    role: 'superadmin',
    status: 'active',
    department: 'Trading & Despachos Internacionales',
    phone: '+1 713 555 0199',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*', 'admin1234'],
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLogin: '2026-09-24T16:00:00.000Z',
  },
  {
    id: 'usr-kyc-01',
    email: 'compliance@investoil.us',
    name: 'Oficial de Cumplimiento & KYC',
    role: 'compliance_kyc',
    status: 'active',
    department: 'Legal & Cumplimiento Normativo',
    phone: '+34 910 000 002',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*'],
    createdAt: '2026-02-01T10:00:00.000Z',
    lastLogin: null,
  },
  {
    id: 'usr-trading-01',
    email: 'business@investoil.us',
    name: 'Operador Senior de Commodities',
    role: 'operator',
    status: 'active',
    department: 'Operaciones Comerciales & Despachos',
    phone: '+34 910 000 003',
    passwordPlain: 'InvestOil2026!*',
    passwordAliases: ['InvestOil2026!#', 'InvestOil2026!*'],
    createdAt: '2026-02-10T12:00:00.000Z',
    lastLogin: null,
  },
];

function rowToUser(r: any): BackofficeUser {
  return {
    id: r.id,
    email: r.email,
    name: r.name,
    role: r.role,
    status: r.status,
    department: r.department || undefined,
    phone: r.phone || undefined,
    passwordPlain: r.password_plain || undefined,
    passwordAliases: r.password_aliases || [],
    createdAt: new Date(r.created_at).toISOString(),
    lastLogin: r.last_login ? new Date(r.last_login).toISOString() : null,
  };
}

async function upsertUserInPg(u: BackofficeUser): Promise<void> {
  const res = await queryPg(
    `INSERT INTO backoffice_users (id, email, name, role, status, department, phone, password_plain, password_aliases, created_at, last_login)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role, status = EXCLUDED.status,
       department = EXCLUDED.department, phone = EXCLUDED.phone, password_plain = EXCLUDED.password_plain,
       password_aliases = EXCLUDED.password_aliases, last_login = EXCLUDED.last_login`,
    [
      u.id, u.email, u.name, u.role, u.status, u.department || null, u.phone || null,
      u.passwordPlain || null, u.passwordAliases || [], u.createdAt, u.lastLogin || null,
    ]
  );
  if (!res) throw new Error('No se pudo guardar el usuario en PostgreSQL.');
}

async function getUsersFromPg(): Promise<BackofficeUser[]> {
  const res = await queryPg('SELECT * FROM backoffice_users ORDER BY created_at ASC');
  if (!res) throw new Error('No se pudo leer la tabla de usuarios en PostgreSQL.');
  if (res.rows.length === 0) {
    // Primer arranque: se siembran los administradores iniciales para no dejar el panel inaccesible.
    for (const u of DEFAULT_USERS) await upsertUserInPg(u);
    return DEFAULT_USERS.map((u) => ({ ...u }));
  }
  return res.rows.map(rowToUser);
}

export async function getUsers(): Promise<BackofficeUser[]> {
  if (hasPostgresDb()) return getUsersFromPg();
  let users = readJsonFile<BackofficeUser[]>('users.json', DEFAULT_USERS);

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      const { data, error } = await supabase.from('backoffice_users').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const dbUsers: BackofficeUser[] = data.map((d: any) => ({
          id: d.id,
          email: d.email,
          name: d.name,
          role: d.role,
          status: d.status,
          department: d.department,
          phone: d.phone,
          passwordPlain: d.password_plain,
          passwordAliases: d.password_aliases || [],
          createdAt: d.created_at,
          lastLogin: d.last_login,
        }));
        const map = new Map<string, BackofficeUser>();
        for (const u of users) map.set(u.email.toLowerCase(), u);
        for (const u of dbUsers) map.set(u.email.toLowerCase(), u);
        users = Array.from(map.values());
      }
    } catch {}
  }

  // Asegurar que admin@investoil.us y admin@investoil.com existan siempre
  const hasUs = users.some((u) => u.email.toLowerCase() === 'admin@investoil.us');
  const hasCom = users.some((u) => u.email.toLowerCase() === 'admin@investoil.com');
  if (!hasUs || !hasCom) {
    if (!hasUs) users.unshift(DEFAULT_USERS[0]);
    if (!hasCom) users.unshift(DEFAULT_USERS[1]);
    writeJsonFile('users.json', users);
  }
  return users;
}

export async function getUserByEmail(email: string): Promise<BackofficeUser | null> {
  const clean = email.trim().toLowerCase();
  const users = await getUsers();
  return users.find((u) => u.email.toLowerCase() === clean) || null;
}

export async function verifyUserCredentials(
  email: string,
  passwordAttempt: string
): Promise<BackofficeUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = passwordAttempt.trim();
  const users = await getUsers();

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || user.status !== 'active') {
    return null;
  }

  // Comprobar contraseña principal
  if (user.passwordPlain && user.passwordPlain === cleanPassword) {
    return user;
  }

  // Comprobar alias de contraseñas autorizadas
  if (Array.isArray(user.passwordAliases) && user.passwordAliases.includes(cleanPassword)) {
    return user;
  }

  return null;
}

export async function saveUser(userData: Partial<BackofficeUser>): Promise<BackofficeUser> {
  const users = await getUsers();
  const now = new Date().toISOString();

  let targetUser: BackofficeUser;

  if (userData.id) {
    // Actualizar usuario existente
    const index = users.findIndex((u) => u.id === userData.id);
    if (index !== -1) {
      const existing = users[index];
      targetUser = {
        ...existing,
        ...userData,
        email: userData.email ? userData.email.trim().toLowerCase() : existing.email,
        passwordPlain: userData.passwordPlain || existing.passwordPlain,
        // Al rotar la contraseña se descartan las anteriores: si no, seguirían siendo válidas.
        passwordAliases:
          userData.passwordAliases ??
          (userData.passwordPlain && userData.passwordPlain !== existing.passwordPlain
            ? []
            : existing.passwordAliases),
      };
      users[index] = targetUser;
    } else {
      targetUser = {
        id: userData.id,
        email: (userData.email || '').trim().toLowerCase(),
        name: userData.name || 'Operador Backoffice',
        role: userData.role || 'operator',
        status: userData.status || 'active',
        department: userData.department || 'Operaciones',
        phone: userData.phone || '',
        passwordPlain: userData.passwordPlain || crypto.randomBytes(12).toString('base64url'),
        passwordAliases: userData.passwordAliases || [],
        createdAt: now,
        lastLogin: null,
      };
      users.push(targetUser);
    }
  } else {
    // Crear nuevo usuario
    const newId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      targetUser = {
        ...users[existingIndex],
        ...userData,
        email: cleanEmail,
      };
      users[existingIndex] = targetUser;
    } else {
      targetUser = {
        id: newId,
        email: cleanEmail,
        name: userData.name || 'Operador Backoffice',
        role: userData.role || 'operator',
        status: userData.status || 'active',
        department: userData.department || 'Operaciones',
        phone: userData.phone || '',
        passwordPlain: userData.passwordPlain || crypto.randomBytes(12).toString('base64url'),
        passwordAliases: userData.passwordAliases || [],
        createdAt: now,
        lastLogin: null,
      };
      users.push(targetUser);
    }
  }

  if (hasPostgresDb()) {
    await upsertUserInPg(targetUser);
  } else {
    writeJsonFile('users.json', users);
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('backoffice_users').upsert({
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
        role: targetUser.role,
        status: targetUser.status,
        department: targetUser.department,
        phone: targetUser.phone,
        password_plain: targetUser.passwordPlain,
        password_aliases: targetUser.passwordAliases,
        last_login: targetUser.lastLogin,
      });
    } catch (e) {
      console.warn('[db-service] Supabase saveUser fallback:', e);
    }
  }

  return targetUser;
}

export async function deleteUser(id: string): Promise<boolean> {
  const users = await getUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return false;

  // No permitir borrar el último superadmin
  if (target.role === 'superadmin') {
    const superadmins = users.filter((u) => u.role === 'superadmin');
    if (superadmins.length <= 1) {
      throw new Error('No es posible eliminar el único superadministrador del sistema');
    }
  }

  const filtered = users.filter((u) => u.id !== id);
  if (hasPostgresDb()) {
    const res = await queryPg('DELETE FROM backoffice_users WHERE id = $1', [id]);
    if (!res) throw new Error('No se pudo eliminar el usuario en PostgreSQL.');
  } else {
    writeJsonFile('users.json', filtered);
  }

  if (isSupabaseConfigured()) {
    try {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      await supabase.from('backoffice_users').delete().eq('id', id);
    } catch {}
  }

  return true;
}

export async function recordUserLogin(email: string): Promise<void> {
  const clean = email.trim().toLowerCase();
  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === clean);
  if (user) {
    user.lastLogin = new Date().toISOString();
    if (hasPostgresDb()) {
      await queryPg('UPDATE backoffice_users SET last_login = $1 WHERE lower(email) = $2', [user.lastLogin, clean]);
    } else {
      writeJsonFile('users.json', users);
    }

    if (isSupabaseConfigured()) {
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const supabase = createAdminClient();
        await supabase
          .from('backoffice_users')
          .update({ last_login: user.lastLogin })
          .eq('email', clean);
      } catch {}
    }
  }
}


